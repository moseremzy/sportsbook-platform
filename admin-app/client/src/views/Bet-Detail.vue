<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{ interactive_store.backend_message }}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{ interactive_store.backend_message }}</ERRORALERTBOX>
    <SIDEBAR />

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="bet-slip-detail" searchbox_placeholder="" />

      <div class="page-title-row">
        <h1>Bet Slip</h1>
        <button class="back-btn" @click="router.push('/account/bet-slips')">← Back to Bet Slips</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">Loading bet slip...</div>

      <template v-else-if="bet_slip">

        <!-- ── Slip Info Card ── -->
        <div class="info-card">
          <div class="info-grid">
            <div class="meta-item">
              <span class="meta-label">Full Name</span>
              <span class="meta-value">{{ bet_slip.fullname }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Email</span>
              <span class="meta-value">{{ bet_slip.email }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Balance</span>
              <span class="meta-value">{{ formatAmount(bet_slip.balance) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Bet Type</span>
              <span class="meta-value" style="text-transform: capitalize;">{{ bet_slip.bet_type }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Odds</span>
              <span class="meta-value">{{ bet_slip.total_odd }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Stake</span>
              <span class="meta-value">{{ formatAmount(bet_slip.stake) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Possible Win</span>
              <span class="meta-value">{{ formatAmount(bet_slip.possible_win) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Status</span>
              <span :class="['status-badge', bet_slip.status]">{{ bet_slip.status }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Placed At</span>
              <span class="meta-value">{{ formatDate(bet_slip.created_at) }}</span>
            </div>
            <div class="meta-item" v-if="bet_slip.settled_at">
              <span class="meta-label">Settled At</span>
              <span class="meta-value">{{ formatDate(bet_slip.settled_at) }}</span>
            </div>
          </div>
        </div>

        <!-- ── Update Slip Status ── -->
        <div class="section">
          <div class="section-title-row">
            <h2>Update Slip Status</h2>
          </div>
          <div class="status-update-card">
            <div class="status-update-row">
              <div class="form-group">
                <label class="form-label">Slip Status</label>
                <select v-model="slip_status" class="form-input">
                  <option value="pending">Pending</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="partial">Partial</option>
                  <option value="void">Void</option>
                </select>
              </div>
              <div class="form-group align-end">
                <button class="submit-button small" @click="updateSlipStatus">Save Status</button>
              </div>
            </div>
            <p v-if="slip_status === 'won'" class="won-notice">
              ⚠️ Setting status to <strong>Won</strong> will credit <strong>{{ formatAmount(bet_slip.possible_win) }}</strong> to the user's balance.
            </p>
          </div>
        </div>

        <!-- ── Selections ── -->
        <div class="section">
          <div class="section-title-row">
            <h2>Selections</h2>
          </div>

          <div v-if="bet_slip.selections.length === 0" class="empty-state">No selections found.</div>

          <div v-for="sel in bet_slip.selections" :key="sel.id" class="selection-card">

            <div class="selection-top">
              <div class="selection-match">
                <span class="team">{{ sel.home_team }}</span>
                <span class="vs">vs</span>
                <span class="team">{{ sel.away_team }}</span>
              </div>
              <span :class="['status-badge', sel.status]">{{ sel.status }}</span>
            </div>

            <div class="selection-meta">
              <div class="meta-item">
                <span class="meta-label">Market</span>
                <span class="meta-value">{{ sel.market_name }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Selection</span>
                <span class="meta-value">{{ sel.selection_name }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Odd</span>
                <span class="meta-value">{{ sel.odd_at_bet_time }}</span>
              </div>
              <div class="meta-item" v-if="sel.line_value">
                <span class="meta-label">Line</span>
                <span class="meta-value">{{ sel.line_value }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Event Status</span>
                <span :class="['status-badge', 'small', sel.event_status]">{{ sel.event_status }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Score</span>
                <span class="meta-value">{{ sel.home_score }} – {{ sel.away_score }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Start Time</span>
                <span class="meta-value">{{ formatDate(sel.start_time) }}</span>
              </div>
            </div>

            <!-- Update Selection Status -->
            <div class="selection-status-row">
              <div class="form-group">
                <label class="form-label">Update Status</label>
                <select v-model="sel._new_status" class="form-input small-select">
                  <option value="pending">Pending</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="void">Void</option>
                </select>
              </div>
              <div class="form-group align-end">
                <button
                  class="submit-button small"
                  @click="updateSelectionStatus(sel)"
                  :disabled="savingSelectionId === sel.id"
                >
                  {{ savingSelectionId === sel.id ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>

          </div>
        </div>

      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore }       from '@/stores/admin'
import HEADER   from '../components/Header.vue'
import OVERLAY  from '../components/modals/loading_overlay.vue'
import SIDEBAR  from '../components/SideBar.vue'
import API      from '@/api/index'

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const router            = useRouter()
const route             = useRoute()

const bet_slip           = ref(null)
const loading            = ref(true)
const slip_status        = ref('')
const savingSelectionId  = ref(null)

// ── Auth Guard ───────────────────────────────
watch(() => admin_store.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    interactive_store.backend_message = 'Session expired'
    interactive_store.display_error_alert_box(true)
    setTimeout(() => router.push({ path: '/login' }), 1000)
  }
})

// ── Load Bet Slip ────────────────────────────
onMounted(async () => {
  await loadBetSlip()
})

async function loadBetSlip() {
  
  loading.value = true
  
  try {
    
    const res = await API.get_bet_slip(route.params.id)

    bet_slip.value  = res.bet_slip
    
    slip_status.value = res.bet_slip.status

    // attach _new_status to each selection for the dropdown
    bet_slip.value.selections.forEach(sel => {

      sel._new_status = sel.status
    
    })
  
  } catch (err) {
    
    interactive_store.backend_message = err.message
    
    interactive_store.display_error_alert_box()
  
  } finally {

    loading.value = false

  }

}

// ── Update Slip Status ───────────────────────
async function updateSlipStatus() {

  if (slip_status.value === bet_slip.value.status) {
    interactive_store.backend_message = 'Status is already set to ' + slip_status.value
    interactive_store.display_error_alert_box()
    return
  }

  if (!confirm(
    slip_status.value === 'won'
      ? `Set slip to Won? This will credit ${formatAmount(bet_slip.value.possible_win)} to the user's balance.`
      : `Update slip status to "${slip_status.value}"?`
  )) return

  interactive_store.toggle_loading_overlay(true)

  try {

    const res = await API.update_bet_slip_status({
      id:     bet_slip.value.id,
      status: slip_status.value
    })

    bet_slip.value.status = slip_status.value

    if (slip_status.value === 'won') {
      bet_slip.value.balance = res.new_balance
      bet_slip.value.settled_at = res.settled_at
    }

    interactive_store.backend_message = res.data.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  } finally {
    interactive_store.toggle_loading_overlay(false)
  }
}

// ── Update Selection Status ──────────────────
async function updateSelectionStatus(sel) {

  if (sel._new_status === sel.status) {
    interactive_store.backend_message = 'Status is already set to ' + sel._new_status
    interactive_store.display_error_alert_box()
    return
  }

  savingSelectionId.value = sel.id
  
  try {

    const res = await API.update_selection_status({
      id:     sel.id,
      status: sel._new_status
    })

    sel.status = sel._new_status

    interactive_store.backend_message = res.data.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  } finally {
    savingSelectionId.value = null
  }
}

// ── Format helpers ───────────────────────────
function formatDate(dt) {
  return new Date(dt).toLocaleString()
}

function formatAmount(amount) {
  return Number(amount).toLocaleString()
}
</script>

<style scoped>
/* DESKTOP VIEW */
@media only screen and (min-width: 992px) {
  div.container {
    display: flex;
    height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  div.sub_container {
    display: block;
    margin: 0 0 0 250px;
    height: 100vh;
    padding: 0 15px 50px 15px;
    width: calc(100% - 250px);
    overflow-y: auto;
  }
  div.sub_container h1 {
    margin: 0px auto 5px auto;
    color: #0E2E45;
    font-size: 35px;
    font-weight: 300;
  }
}

/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
  div.container {
    display: flex;
    height: auto;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  div.sub_container {
    display: block;
    margin: 0;
    padding: 0 15px 50px 15px;
    width: 100%;
  }
  div.sub_container h1 {
    margin: 0px auto 5px auto;
    color: #0E2E45;
    font-size: 3rem;
    font-weight: 300;
  }
}

.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.back-btn {
  background-color: #0E2E45;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.back-btn:hover { background-color: #1a4a6e; }

/* ── Info Card ── */
.info-card {
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(145, 138, 138, 0.1);
  padding: 24px;
  margin-bottom: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

/* ── Section ── */
.section {
  margin-bottom: 40px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title-row h2 {
  font-size: 22px;
  font-weight: 400;
  color: #0E2E45;
  margin: 0;
}

/* ── Status Update Card ── */
.status-update-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  max-width: 500px;
}

.status-update-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: end;
}

.won-notice {
  margin-top: 12px;
  font-size: 13px;
  color: #856404;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  padding: 10px 14px;
}

/* ── Selection Card ── */
.selection-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.selection-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.selection-match {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team {
  font-size: 16px;
  font-weight: 600;
  color: #0E2E45;
}

.vs {
  font-size: 13px;
  color: #aaa;
}

.selection-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.selection-status-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: end;
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  margin-top: 4px;
}

/* ── Status Badges ── */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
}
.status-badge.small { font-size: 11px; padding: 2px 8px; }
.status-badge.pending  { background: #fff3cd; color: #856404; }
.status-badge.won      { background: #d4edda; color: #155724; }
.status-badge.lost     { background: #f8d7da; color: #721c24; }
.status-badge.partial  { background: #cce5ff; color: #004085; }
.status-badge.void     { background: #e2e3e5; color: #6c757d; }
.status-badge.live     { background: #d4edda; color: #155724; }
.status-badge.finished { background: #d6d8d9; color: #383d41; }
.status-badge.cancelled{ background: #f8d7da; color: #721c24; }

/* ── Form ── */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: bold;
  color: #555;
}

.form-input {
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}
.form-input:focus { border-color: #007bff; outline: none; }
.small-select { font-size: 14px; padding: 8px; }

.align-end { justify-content: flex-end; }

.submit-button {
  padding: 12px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}
.submit-button:hover { background-color: #0056b3; }
.submit-button.small { padding: 9px 18px; font-size: 14px; }
.submit-button:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── States ── */
.loading-state {
  text-align: center;
  padding: 60px;
  color: #888;
  font-size: 16px;
}

.empty-state {
  color: #aaa;
  font-size: 14px;
  padding: 10px 0;
}

@media (max-width: 768px) {
  .page-title-row    { flex-direction: column; align-items: flex-start; gap: 10px; }
  .status-update-row { grid-template-columns: 1fr; }
  .selection-status-row { grid-template-columns: 1fr; }
}
</style>