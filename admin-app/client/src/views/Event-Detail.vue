<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY/>
    <SUCCESSALERTBOX>{{ interactive_store.backend_message }}</SUCCESSALERTBOX>
    <ERRORALERTBOX>{{ interactive_store.backend_message }}</ERRORALERTBOX>
    <SIDEBAR/>

    <div class="sub_container" :style="interactive_store.sub_container_css">

      <HEADER page_name="event-detail" searchbox_placeholder="Search events" />

      <!-- Page Title -->
      <div class="page-title-row">
        <h1>Event Detail</h1>
        <button class="back-btn" @click="router.push('/events')">← Back to Events</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">Loading event...</div>

      <!-- Event Info Card -->
      <div v-else-if="event" class="event-card">
        <div class="event-header">
          <div class="event-teams">
            <span class="team home">{{ event.home_team }}</span>
            <span class="vs">vs</span>
            <span class="team away">{{ event.away_team }}</span>
          </div>
          <span :class="['status-badge', event.status]">{{ event.status }}</span>
        </div>

        <div class="event-meta">
          <div class="meta-item">
            <span class="meta-label">Sport</span>
            <span class="meta-value">{{ event.sport_name }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">League</span>
            <span class="meta-value">{{ event.league_name }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Start Time</span>
            <span class="meta-value">{{ formatDate(event.start_time) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Score</span>
            <span class="meta-value">{{ event.home_score }} – {{ event.away_score }}</span>
          </div>
          <div v-if="event.external_id" class="meta-item">
            <span class="meta-label">External ID</span>
            <span class="meta-value">{{ event.external_id }}</span>
          </div>
        </div>
      </div>


     
     <!-- ── TEMPLATE SECTION ── -->
      <!-- Add this block inside <template> before the Markets section -->
      
      <div v-if="event" class="section">
      
        <div class="section-title-row">
          <h2>Scores & Status</h2>
        </div>
      
        <div class="score-form-card">
      
          <!-- Status + Scores -->
          <div class="score-grid">
      
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="score_form.status" class="form-input">
                <option value="pending">Pending</option>
                <option value="live">Live</option>
                <option value="settled">Settled</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Start Time</label>
              <input type="datetime-local" v-model="score_form.start_time" class="form-input" />
            </div>
      
            <div class="form-group">
              <label class="form-label">{{ event.home_team }} Score</label>
              <input type="number" v-model="score_form.home_score" class="form-input" min="0" />
            </div>
      
            <div class="form-group">
              <label class="form-label">{{ event.away_team }} Score</label>
              <input type="number" v-model="score_form.away_score" class="form-input" min="0" />
            </div>
      
          </div>
      
          <button class="submit-button small" @click="updateScores">Save Scores</button>
      
        </div>
      
        <!-- ── Period Scores ── -->
        <div class="period-section">
      
          <div class="section-title-row" style="margin-top: 24px;">
            <h3>Period Scores</h3>
            <button class="add-btn small" @click="show_period_form = !show_period_form">
              {{ show_period_form ? '✕ Cancel' : '+ Add / Update Period' }}
            </button>
          </div>
      
          <!-- Add Period Form -->
          <div v-if="show_period_form" class="inline-form period-form">
            <div class="form-group">
              <label class="form-label">Period</label>
              <select v-model="period_form.period" class="form-input">
                <option value="" disabled>Select period</option>
                <option v-for="p in period_options" :key="p.value" :value="p.value">
                  {{ p.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">{{ event.home_team }}</label>
              <input type="number" v-model="period_form.home_score" class="form-input" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ event.away_team }}</label>
              <input type="number" v-model="period_form.away_score" class="form-input" min="0" />
            </div>
            <p class="err">{{ period_err }}</p>
            <button class="submit-button small" @click="savePeriod">Save Period</button>
          </div>
      
          <!-- Period Scores Table -->
          <div v-if="event_periods.length === 0" class="empty-state">No period scores yet.</div>
      
          <div v-else class="periods-table">
            <div class="periods-header">
              <span>Period</span>
              <span>{{ event.home_team }}</span>
              <span>{{ event.away_team }}</span>
            </div>
            <div v-for="p in event_periods" :key="p.id" class="periods-row">
              <span class="period-label">{{ formatPeriodLabel(p.period) }}</span>
              <span class="period-score">{{ p.home_score }}</span>
              <span class="period-score">{{ p.away_score }}</span>
            </div>
          </div>
      
        </div>
      
      </div>


      <!-- ── Markets Section ───────────────────────────── -->
      <div v-if="event" class="section">

        <div class="section-title-row">
          <h2>Markets</h2>
          <button class="add-btn" @click="show_market_form = !show_market_form">
            {{ show_market_form ? '✕ Cancel' : '+ Add Market' }}
          </button>
        </div>

        <!-- Add Market Form -->
        <div v-if="show_market_form" class="inline-form">
          <select v-model="new_market_id" class="form-input">
            <option value="" disabled>Select market</option>
            <option v-for="m in available_markets" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
          <p class="err">{{ market_err }}</p>
          <button class="submit-button small" @click="addMarket">Add Market</button>
        </div>

        <!-- Markets List -->
        <div v-if="event.markets.length === 0" class="empty-state">No markets added yet.</div>

        <div v-for="market in event.markets" :key="market.event_market_id" class="market-card">

          <div class="market-header">
            <div class="market-title-group">
              <span class="market-name">{{ market.market_name }}</span>
              <span :class="['status-badge', 'small', market.market_status]">{{ market.market_status }}</span>
            </div>
            <button class="delete-btn" @click="deleteMarket(market.event_market_id)">Remove</button>
          </div>

          <!-- Selections -->
          <div class="selections-list">
            <div v-if="market.selections.length === 0" class="empty-state small">No selections yet.</div>

            <div v-for="sel in market.selections" :key="sel.id" class="selection-row">
              <span class="sel-name">{{ sel.name }}</span>
              <span class="sel-odd">{{ sel.odd }}</span>
              <span v-if="sel.line_value" class="sel-line">({{ sel.line_value }})</span>
              <span :class="['status-badge', 'small', sel.status]">{{ sel.status }}</span>
              <button class="delete-btn small" @click="deleteSelection(market.event_market_id, sel.id)">✕</button>
            </div>
          </div>

          <!-- Add Selection Form -->
          <div class="add-selection-toggle">
            <button
              class="add-btn small"
              @click="toggleSelectionForm(market.event_market_id)"
            >
              {{ active_selection_form === market.event_market_id ? '✕ Cancel' : '+ Add Selection' }}
            </button>
          </div>

          <div v-if="active_selection_form === market.event_market_id" class="inline-form selection-form">
            <input type="text"    v-model="new_selection.name"       class="form-input" placeholder="e.g. Home / Draw / Over 2.5" />
            <input type="number"  v-model="new_selection.odd"        class="form-input" placeholder="Odd e.g. 1.85" step="0.01" />
            <input type="number"  v-model="new_selection.line_value" class="form-input" placeholder="Line (optional) e.g. 2.5" step="0.5" />
            <p class="err">{{ selection_err }}</p>
            <button class="submit-button small" @click="addSelection(market.event_market_id)">Add</button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"

import { useInteractiveStore } from "@/stores/interactive"
import { useAdminStore }       from "@/stores/admin"

import HEADER        from "../components/Header.vue"
import OVERLAY       from "../components/modals/loading_overlay.vue"
import SIDEBAR       from "../components/SideBar.vue"
import API           from "../api/index"

const interactive_store = useInteractiveStore()
const admin_store       = useAdminStore()
const router            = useRouter()
const route             = useRoute()

const event             = ref(null)
const loading           = ref(true)
const available_markets = ref([])

// ── Market form ──────────────────────────────
const show_market_form  = ref(false)
const new_market_id     = ref("")
const market_err        = ref("")

// ── Selection form ───────────────────────────
const active_selection_form = ref(null)
const new_selection = reactive({ name: "", odd: "", line_value: "" })
const selection_err = ref("")


// ── Score form state ─────────────────────────
const score_form = reactive({
  status:     "",
  home_score: 0,
  away_score: 0,
  start_time: ""
})
 
// ── Period form state ────────────────────────
const show_period_form = ref(false)
const period_err       = ref("")
const event_periods    = ref([])
 
const period_form = reactive({
  period:     "",
  home_score: 0,
  away_score: 0
})

// ── Load event ───────────────────────────────
onMounted(async () => {
  await loadEvent()
})

async function loadEvent() {

  loading.value = true
  
  try {
    
    const res = await API.get_event(route.params.id)
    
    event.value = res.event

    // ── Populate score form ──────────────────────
    score_form.status     = res.event.status
    score_form.home_score = res.event.home_score
    score_form.away_score = res.event.away_score
    score_form.start_time = res.event.start_time?.slice(0, 16) // format for datetime-local input

    // ── Populate periods ─────────────────────────
    event_periods.value = res.event.periods || []

    // load markets filtered by sport
    const mRes = await API.get_markets(event.value.sport_id)
    
    available_markets.value = mRes.markets

  } catch (err) {
    
    interactive_store.backend_message = err.message
    
    interactive_store.display_error_alert_box()
  
  } finally {

    loading.value = false
  
  }

}

// ── Add Market ───────────────────────────────
async function addMarket() {
  market_err.value = ""
  if (!new_market_id.value) {
    market_err.value = "Select a market"
    return
  }

  interactive_store.toggle_loading_overlay(true)
  
  try {
    
    const res = await API.add_event_market({
    
    event_id:  event.value.id,
    
    market_id: new_market_id.value
    
    })

    event.value.markets.push(res.market)

    new_market_id.value  = ""
    
    show_market_form.value = false

    interactive_store.backend_message = res.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  } finally {
    interactive_store.toggle_loading_overlay(false)
  }
}

// ── Delete Market ────────────────────────────
async function deleteMarket(event_market_id) {
  if (!confirm("Remove this market and all its selections?")) return

  interactive_store.toggle_loading_overlay(true)
  try {
    const res = await API.delete_event_market({
        data: {id: event_market_id}
    })
    event.value.markets = event.value.markets.filter(m => m.event_market_id !== event_market_id)

    interactive_store.backend_message = res.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  } finally {
    interactive_store.toggle_loading_overlay(false)
  }
}

// ── Toggle Selection Form ────────────────────
function toggleSelectionForm(event_market_id) {
  if (active_selection_form.value === event_market_id) {
    active_selection_form.value = null
  } else {
    active_selection_form.value = event_market_id
    new_selection.name       = ""
    new_selection.odd        = ""
    new_selection.line_value = ""
    selection_err.value      = ""
  }
}

// ── Add Selection ────────────────────────────
async function addSelection(event_market_id) {
  selection_err.value = ""

  if (!new_selection.name.trim()) { selection_err.value = "Selection name is required"; return }
  if (!new_selection.odd)         { selection_err.value = "Odd is required";             return }

  interactive_store.toggle_loading_overlay(true)
  try {
    const res = await API.add_selection({
      event_market_id,
      name:       new_selection.name,
      odd:        new_selection.odd,
      line_value: new_selection.line_value || null
    })

    const market = event.value.markets.find(m => m.event_market_id === event_market_id)
    if (market) market.selections.push(res.selection)

    new_selection.name       = ""
    new_selection.odd        = ""
    new_selection.line_value = ""
    active_selection_form.value = null

    interactive_store.backend_message = res.message
    interactive_store.display_success_alert_box()
  } catch (err) {
     console.log(err)
  } finally {
    interactive_store.toggle_loading_overlay(false)
  }
}

// ── Delete Selection ─────────────────────────
async function deleteSelection(event_market_id, selection_id) {
  if (!confirm("Remove this selection?")) return

  interactive_store.toggle_loading_overlay(true)
  try {
    const res = await API.delete_selection({
        data: {id: selection_id}
    })
    const market = event.value.markets.find(m => m.event_market_id === event_market_id)
    if (market) market.selections = market.selections.filter(s => s.id !== selection_id)

    interactive_store.backend_message = res.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  } finally {
    interactive_store.toggle_loading_overlay(false)
  }
}

// ── Format date ──────────────────────────────
function formatDate(dt) {

  return new Date(dt).toLocaleString()

}


// ──Period options based on sport ────────────
const period_options = computed(() => {
  const sport = event.value?.sport_name?.toLowerCase() || ""
 
  if (sport === "football") {
    return [
      { value: "p1",       label: "1st Half"   },
      { value: "p2",       label: "2nd Half"   },
      { value: "fulltime", label: "Full Time"  },
      { value: "overtime", label: "Overtime"   },
    ]
  }
 
  if (sport === "basketball") {
    return [
      { value: "p1",       label: "Q1"         },
      { value: "p2",       label: "Q2"         },
      { value: "p3",       label: "Q3"         },
      { value: "p4",       label: "Q4"         },
      { value: "fulltime", label: "Full Time"  },
      { value: "overtime", label: "Overtime"   },
    ]
  }
 
  if (sport === "baseball") {
    return [
      { value: "p1",       label: "Inning 1"   },
      { value: "p2",       label: "Inning 2"   },
      { value: "p3",       label: "Inning 3"   },
      { value: "p4",       label: "Inning 4"   },
      { value: "p5",       label: "Inning 5"   },
      { value: "p6",       label: "Inning 6"   },
      { value: "p7",       label: "Inning 7"   },
      { value: "p8",       label: "Inning 8"   },
      { value: "p9",       label: "Inning 9"   },
      { value: "fulltime", label: "Full Time"  },
      { value: "overtime", label: "Extra Inn." },
    ]
  }
 
  // fallback
  return [
    { value: "p1",       label: "Period 1"  },
    { value: "p2",       label: "Period 2"  },
    { value: "fulltime", label: "Full Time" },
    { value: "overtime", label: "Overtime"  },
  ]
})
 
// ── Format period label for display ─────────
function formatPeriodLabel(period) {
  const match = period_options.value.find(p => p.value === period)
  return match ? match.label : period
}
 
// ── Populate score form when event loads ─────
// Add this inside your loadEvent() function after event.value = res.event:
// score_form.status     = res.event.status
// score_form.home_score = res.event.home_score
// score_form.away_score = res.event.away_score
// event_periods.value   = res.event.periods || []
 
// ── Update Scores ────────────────────────────
async function updateScores() {
  interactive_store.toggle_loading_overlay(true)
  try {
    const res = await API.update_event_scores({
      event_id:   event.value.id,
      status:     score_form.status,
      home_score: score_form.home_score,
      away_score: score_form.away_score,
      start_time: score_form.start_time
    })
 
    // update local event state
    event.value.status     = score_form.status
    event.value.home_score = score_form.home_score
    event.value.away_score = score_form.away_score
    event.value.start_time = score_form.start_time
 
    interactive_store.backend_message = res.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  } finally {
    interactive_store.toggle_loading_overlay(false)
  }
}
 
// ── Save Period ──────────────────────────────
async function savePeriod() {

  period_err.value = ""
  
  if (!period_form.period) { period_err.value = "Select a period"; return }
 
  interactive_store.toggle_loading_overlay(true)

  try {
    
    const res = await API.upsert_event_period({
      event_id:   event.value.id,
      period:     period_form.period,
      home_score: period_form.home_score,
      away_score: period_form.away_score
    })
 
    event_periods.value    = res.periods
    show_period_form.value = false
    period_form.period     = ""
    period_form.home_score = 0
    period_form.away_score = 0
 
    interactive_store.backend_message = res.message
    interactive_store.display_success_alert_box()
  } catch (err) {
    interactive_store.backend_message = err.message
    interactive_store.display_error_alert_box()
  } finally {
    interactive_store.toggle_loading_overlay(false)
  }
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

/* ── Page title row ── */
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

/* ── Event Card ── */
.event-card {
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(145, 138, 138, 0.1);
  padding: 24px;
  margin-bottom: 30px;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.event-teams {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team {
  font-size: 20px;
  font-weight: 600;
  color: #0E2E45;
}

.vs {
  font-size: 14px;
  color: #aaa;
  font-weight: 400;
}

.event-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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

/* ── Status Badges ── */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge.small { font-size: 11px; padding: 2px 8px; }
.status-badge.pending  { background: #fff3cd; color: #856404; }
.status-badge.live     { background: #d4edda; color: #155724; }
.status-badge.finished { background: #d6d8d9; color: #383d41; }
.status-badge.cancelled{ background: #f8d7da; color: #721c24; }
.status-badge.open     { background: #d4edda; color: #155724; }
.status-badge.suspended{ background: #fff3cd; color: #856404; }
.status-badge.settled  { background: #d6d8d9; color: #383d41; }
.status-badge.won      { background: #d4edda; color: #155724; }
.status-badge.lost     { background: #f8d7da; color: #721c24; }
.status-badge.void     { background: #d6d8d9; color: #383d41; }

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

/* ── Buttons ── */
.add-btn {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.add-btn:hover { background-color: #0056b3; }
.add-btn.small { padding: 5px 12px; font-size: 13px; }

.delete-btn {
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-btn:hover { background: #b02a37; }
.delete-btn.small { padding: 3px 8px; font-size: 12px; }

.submit-button {
  padding: 12px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.submit-button:hover { background-color: #0056b3; }
.submit-button.small { padding: 8px 16px; font-size: 14px; }

/* ── Inline Forms ── */
.inline-form {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 500px;
}

.selection-form {
  margin-top: 12px;
  max-width: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
  align-items: start;
}

.selection-form p.err,
.selection-form .submit-button {
  grid-column: span 3;
}

/* ── Market Card ── */
.market-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.market-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.market-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.market-name {
  font-size: 16px;
  font-weight: 600;
  color: #0E2E45;
}

/* ── Selections ── */
.selections-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.selection-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eee;
  flex-wrap: wrap;
}

.sel-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.sel-odd {
  font-size: 14px;
  font-weight: 700;
  color: #007bff;
  min-width: 40px;
}

.sel-line {
  font-size: 13px;
  color: #888;
}

.add-selection-toggle {
  margin-top: 8px;
}

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
.empty-state.small { padding: 4px 0; }

/* ── Form inputs ── */
.form-input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}
.form-input:focus {
  border-color: #007bff;
  outline: none;
}

p.err {
  color: red;
  font-size: 14px;
  margin: 0;
}


.score-form-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  margin-bottom: 10px;
}
 
.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
 
.period-form {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
  align-items: end;
  max-width: 100%;
}
 
.period-form p.err,
.period-form .submit-button {
  grid-column: span 3;
}
 
.periods-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 10px;
}
 
.periods-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: #0E2E45;
  color: #fff;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
}
 
.periods-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
}
 
.periods-row:nth-child(even) { background: #f9f9f9; }
 
.period-label {
  font-weight: 500;
  color: #333;
}
 
.period-score {
  font-weight: 700;
  color: #0E2E45;
}
 

@media (max-width: 768px) {
  .score-grid   { grid-template-columns: 1fr; }
  .period-form  { grid-template-columns: 1fr; }
  .period-form p.err,
  .period-form .submit-button { grid-column: span 1; }
  .selection-form {
    grid-template-columns: 1fr;
  }
  .selection-form p.err,
  .selection-form .submit-button {
    grid-column: span 1;
  }
  .page-title-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .event-header   { flex-direction: column; align-items: flex-start; }
}
</style>