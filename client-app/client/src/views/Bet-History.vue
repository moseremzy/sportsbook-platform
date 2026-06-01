<template>
  <div class="events-page">
    <div class="main-layout">
      <div class="container">

        <!-- Tabs -->
        <div class="tab-container">
          <button class="tab" :class="{ active: activeTab === 'open_bets' }" @click="activeTab = 'open_bets'">
            Open Bets <span class="tab-count">{{ openBets.length }}</span>
          </button>
          <button class="tab" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
            Bet History
          </button>
        </div>

        <!-- ── OPEN BETS ── -->
        <div v-if="activeTab === 'open_bets'">
          <div v-if="loading" class="empty-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading bets...</p>
          </div>

          <div v-else-if="openBets.length === 0" class="empty-state">
            <i class="fa-regular fa-ticket"></i>
            <p>No open bets yet</p>
          </div>

          <div v-for="bet in openBets" :key="bet.id" class="bet-card">
            <div class="bet-card-header">
              <div class="bet-type-badge" :class="bet.bet_type">{{ bet.bet_type }}</div>
              <div class="bet-status pending">
                <span class="status-dot"></span>
                Pending
              </div>
            </div>

            <div class="selections">
              <div v-for="sel in bet.selections" :key="sel.id" class="selection-row">
                <div class="selection-info">
                  <span class="selection-match">{{ sel.home_team }} vs {{ sel.away_team }}</span>
                  <span class="selection-pick">
                    {{ sel.selection_name }} {{ sel.line_value }}
                    <span class="selection-market">· {{ sel.market_slug }}</span>
                  </span>
                </div>
                <div class="selection-odd">{{ sel.odd_at_bet_time }}</div>
              </div>
            </div>

            <div class="bet-card-footer">
              <div class="bet-stat">
                <span class="stat-label">Total Odds</span>
                <span class="stat-value">{{ bet.total_odd }}</span>
              </div>
              <div class="bet-stat">
                <span class="stat-label">Stake</span>
                <span class="stat-value">{{ currency }}{{ Number(bet.stake).toLocaleString() }}</span>
              </div>
              <div class="bet-stat highlight">
                <span class="stat-label">Potential Win</span>
                <span class="stat-value green">{{ currency }}{{ Number(bet.possible_win).toLocaleString() }}</span>
              </div>
            </div>

            <div class="bet-card-meta">
              <span class="bet-date">{{ formatDate(bet.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- ── BET HISTORY ── -->
        <div v-if="activeTab === 'history'">

          <div class="filter-row">
            <button
              v-for="f in filters"
              :key="f.value"
              class="filter-chip"
              :class="{ active: activeFilter === f.value }"
              @click="activeFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>

          <div v-if="loading" class="empty-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading history...</p>
          </div>

          <div v-else-if="filteredHistory.length === 0" class="empty-state">
            <i class="fa-regular fa-clock-rotate-left"></i>
            <p>No bets found</p>
          </div>

          <div
            v-for="bet in filteredHistory"
            :key="bet.id"
            class="bet-card"
            :class="'outcome-' + bet.status"
          >
            <div class="bet-card-header">
              <div class="bet-type-badge" :class="bet.bet_type">{{ bet.bet_type }}</div>
              <div class="outcome-badge" :class="bet.status">
                <i :class="outcomeIcon(bet.status)"></i>
                {{ capitalize(bet.status) }}
              </div>
            </div>


            <div class="selections">
              <div
                v-for="sel in bet.selections"
                :key="sel.id"
                class="selection-row"
                :class="sel.status"
              >
                <div class="selection-info">
                  <span class="selection-match">{{ sel.home_team }} vs {{ sel.away_team }}</span>
                  <span class="selection-pick">
                    {{sel.selection_name }}  {{ sel.line_value }}
                    <span class="selection-market">· {{ sel.market_slug }}</span>
                  </span>
                </div>
                <div class="selection-result-wrap">
                  <div class="selection-odd">{{ sel.odd_at_bet_time }}</div>
                  <i class="result-icon" :class="selectionIcon(sel.status)"></i>
                </div>
              </div>
            </div>

            <div class="bet-card-footer">
              <div class="bet-stat">
                <span class="stat-label">Total Odds</span>
                <span class="stat-value">{{ bet.total_odd }}</span>
              </div>
              <div class="bet-stat">
                <span class="stat-label">Stake</span>
                <span class="stat-value">{{ currency }}{{ Number(bet.stake).toLocaleString() }}</span>
              </div>
              <div class="bet-stat highlight">
                <span class="stat-label">{{ bet.status === 'won' ? 'Payout' : 'Potential' }}</span>
                <span
                  class="stat-value"
                  :class="bet.status === 'won' ? 'green' : bet.status === 'lost' ? 'red' : ''"
                >
                  {{ currency }}{{ Number(bet.possible_win).toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="bet-card-meta">
              <span class="bet-date">{{ formatDate(bet.created_at) }}</span>
              <span class="bet-date" v-if="bet.settled_at">Settled: {{ formatDate(bet.settled_at) }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import API from '../api/index'

const route      = useRoute()
const activeTab  = ref(route.query.s || 'open_bets')
const loading    = ref(false)
const currency   = '₦'
const bet_history = ref([])

const activeFilter = ref('all')
const filters = [
  { label: 'All',  value: 'all' },
  { label: 'Won',  value: 'won' },
  { label: 'Lost', value: 'lost' },
  { label: 'Void', value: 'void' },
]

// Split into open vs settled
const openBets = computed(() =>
  bet_history.value.filter(b => b.status === 'pending')
)

const settledBets = computed(() =>
  bet_history.value.filter(b => b.status !== 'pending')
)

const filteredHistory = computed(() => {
  if (activeFilter.value === 'all') return settledBets.value
  return settledBets.value.filter(b => b.status === activeFilter.value)
})

async function fetchBetHistory() {
  loading.value = true
  try {
    const res = await API.fetch_bet_history()
    bet_history.value = res.bet_history ?? []
  } finally {
    loading.value = false
  }
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function outcomeIcon(status) {
  return {
    won:  'fa-solid fa-circle-check',
    lost: 'fa-solid fa-circle-xmark',
    void: 'fa-solid fa-circle-minus',
  }[status] || ''
}

function selectionIcon(status) {
  return {
    won:  'fa-solid fa-check',
    lost: 'fa-solid fa-xmark',
    void: 'fa-solid fa-minus',
  }[status] || 'fa-regular fa-clock'
}

onMounted(fetchBetHistory)
</script>

<style scoped>
.events-page {
  background: #0a1f10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.container {
  background: #0a1f10;
  min-height: 100vh;
  color: #fff;
  width: 80%;
  margin: 0 auto;
  padding-bottom: 32px;
}

/* ── Tabs ── */
.tab-container {
  display: flex;
  background: #0d2416;
  padding: 10px 12px;
  height: 60px;
  gap: 8px;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab {
  flex: 1;
  background: var(--color2);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab.active { background: var(--color1); }

.tab-count {
  background: rgba(255,255,255,0.2);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
}

/* ── Filter chips ── */
.filter-row {
  display: flex;
  gap: 8px;
  padding: 12px 12px 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-row::-webkit-scrollbar { display: none; }

.filter-chip {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}

.filter-chip.active {
  background: var(--color1);
  border-color: var(--color1);
  color: #fff;
}

/* ── Bet card ── */
.bet-card {
  margin: 12px;
  background: #0d2416;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
  transition: 0.2s;
}

.bet-card.outcome-won  { border-color: rgba(61,196,90,0.35); }
.bet-card.outcome-lost { border-color: rgba(224,48,48,0.3); }
.bet-card.outcome-void { border-color: rgba(255,255,255,0.15); }

/* ── Card header ── */
.bet-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.bet-type-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
}

.bet-type-badge.express { background: rgba(61,196,90,0.15); color: #3dc45a; }
.bet-type-badge.single      { background: rgba(47,156,255,0.15); color: #2f9cff; }

/* status */
.bet-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
}

.bet-status.live .status-dot {
  background: #e03030;
  box-shadow: 0 0 6px #e03030;
  animation: pulse 1.4s infinite;
}

.bet-status.pending .status-dot { background: #f0a500; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* outcome badge */
.outcome-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
}

.outcome-badge.won  { background: rgba(61,196,90,0.15);  color: #3dc45a; }
.outcome-badge.lost { background: rgba(224,48,48,0.15);  color: #e03030; }
.outcome-badge.void { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }

/* ── Selections ── */
.selections { padding: 8px 0; }

.selection-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  gap: 8px;
}

.selection-row:last-child { border-bottom: none; }

.selection-row.won  { background: rgb(9, 68, 22); }
.selection-row.lost { background:  rgb(124, 29, 29); }

.selection-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.selection-match {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selection-pick {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.selection-market {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
}

.selection-result-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-odd {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
}

.result-icon.fa-check { color: #3dc45a; }
.result-icon.fa-xmark { color: #e03030; }
.result-icon.fa-minus { color: rgba(255,255,255,0.4); }
.result-icon.fa-clock { color: #f0a500; }

/* ── Footer stats ── */
.bet-card-footer {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-top: 1px solid rgba(255,255,255,0.06);
  gap: 0;
}

.bet-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bet-stat + .bet-stat {
  border-left: 1px solid rgba(255,255,255,0.07);
  padding-left: 12px;
  margin-left: 12px;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.4);
}

.stat-value {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
}

.stat-value.green { color: #3dc45a; }
.stat-value.red   { color: #e03030; }

/* ── Meta row ── */
.bet-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.bet-date {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
}

/* cashout */
.cashout-btn {
  background: linear-gradient(90deg, #f0a500, #e07b00);
  border: none;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.cashout-btn:hover { filter: brightness(1.1); }

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  gap: 12px;
  color: rgba(255,255,255,0.25);
}

.empty-state i   { font-size: 40px; }
.empty-state p   { font-size: 14px; font-weight: 600; margin: 0; }

/* ── Main layout ── */
.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 0;
}
</style>