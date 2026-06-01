<template>
  <div class="page-wrapper">

    <header class="site-header">
      <div class="logo">{{settings_store.settings.website}}</div>
      <div class="header-badge">Transaction History</div>
    </header>

    <div class="container">

      <div class="page-hero">
        <div class="hero-tag">Account</div>
        <h1>Your <span class="text-accent">Transactions</span></h1>
        <p>A full record of your deposits and withdrawals.</p>
      </div>

      <!-- SUMMARY STRIP -->
      <div class="summary-strip">
        <div class="summary-item">
          <span class="summary-label">Total Deposits</span>
          <span class="summary-value green">{{ totalDeposits }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-label">Total Withdrawals</span>
          <span class="summary-value red">{{ totalWithdrawals }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <span class="summary-label">All Transactions</span>
          <span class="summary-value">{{ transactions.length }}</span>
        </div>
      </div>

      <!-- TRANSACTIONS LIST -->
      <div class="tx-block">

        <!-- Loading -->
        <div class="state-card" v-if="loading">
          <div class="spinner"></div>
          <p>Loading your transactions...</p>
        </div>

        <!-- Empty -->
        <div class="state-card" v-else-if="transactions.length === 0">
          <span class="state-icon">📭</span>
          <p>No transactions yet.</p>
        </div>

        <!-- List -->
        <div v-else class="tx-list">

          <!-- Desktop header -->
          <div class="tx-header desktop-only">
            <span class="th th-type">Type</span>
            <span class="th th-amount">Amount</span>
            <span class="th th-status">Status</span>
            <span class="th th-method">Method</span>
            <span class="th th-wallet">Wallet</span>
            <span class="th th-date">Date</span>
          </div>

          <!-- Rows -->
          <div v-for="tx in transactions" :key="tx.id" class="tx-row">

            <!-- Type -->
            <div class="tx-cell tc-type">
              <span class="type-badge" :class="tx.type">
                <svg v-if="tx.type === 'deposit'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                {{ tx.type }}
              </span>
            </div>

            <!-- Amount -->
            <div class="tx-cell tc-amount">
              <span class="tx-label mobile-only">Amount</span>
              <span class="amount-val" :class="tx.type">{{ user_store.formattedPrice(tx.amount) }}</span>
            </div>

            <!-- Status -->
            <div class="tx-cell tc-status">
              <span class="tx-label mobile-only">Status</span>
              <span class="status-badge" :class="tx.status">
                <span class="status-dot"></span>{{ tx.status }}
              </span>
            </div>

            <!-- Method -->
            <div class="tx-cell tc-method">
              <span class="tx-label mobile-only">Method</span>
              <span class="method-tag">{{ tx.payment_method }}</span>
            </div>

            <!-- Wallet -->
            <div class="tx-cell tc-wallet" v-if = "tx.wallet">
              <span class="tx-label mobile-only">Wallet</span>
              <div class="wallet-row">
                <span class="wallet-addr">{{ truncateWallet(tx.wallet) }}</span>
                <button class="copy-btn" :class="{ copied: copiedId === tx.id }" @click="copyWallet(tx)">
                  {{ copiedId === tx.id ? '✓' : 'Copy' }}
                </button>
              </div>
            </div>

            <!-- Date -->
            <div class="tx-cell tc-date">
              <span class="tx-label mobile-only">Date</span>
              <span class="date-val">{{ formatDate(tx.created_at) }}</span>
            </div>

          </div>

        </div>
      </div>

    </div>

    <footer class="site-footer">
      <span class="footer-logo">{{settings_store.settings.website}}</span>
      <span class="footer-note">18+ · Bet Responsibly</span>
    </footer>

    <!-- Copy toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast">✓ Wallet address copied</div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import API from '../api/index'
import { useUserStore } from '../stores/user'
import { useSettingsStore } from '@/stores/settings'
const settings_store = useSettingsStore()
const user_store = useUserStore()

const transactions = ref([])
const loading      = ref(false)
const showToast    = ref(false)
const copiedId     = ref(null)

async function fetchTransactions() {

  loading.value = true
  
  try {
    
    const res = await API.fetch_transactions()
    
    transactions.value = res.transactions ?? []
  
  } finally {
    
    loading.value = false
  
  }

}

fetchTransactions()

const totalDeposits = computed(() => {
  const d = transactions.value.filter(t => t.type === 'deposit' && t.status === 'completed')
  if (!d.length) return '—'
  return user_store.formattedPrice(d.reduce((s, t) => s + parseFloat(t.amount || 0), 0))
})
const totalWithdrawals = computed(() => {
  const w = transactions.value.filter(t => t.type === 'withdrawal' && t.status === 'completed')
  if (!w.length) return '—'
  return user_store.formattedPrice(w.reduce((s, t) => s + parseFloat(t.amount || 0), 0))
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function truncateWallet(w) {
  if (!w) return '—'
  return w.length <= 16 ? w : w.slice(0, 8) + '…' + w.slice(-6)
}
async function copyWallet(tx) {
  if (!tx.wallet) return
  await navigator.clipboard.writeText(tx.wallet)
  copiedId.value = tx.id
  showToast.value = true
  setTimeout(() => { showToast.value = false; copiedId.value = null }, 2200)
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(to right bottom, #003122, #0f1513);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  --surface: rgba(255, 255, 255, 0.04);
}

.desktop-only { display: flex !important; }
.mobile-only  { display: none  !important; }
@media (max-width: 768px) {
  .desktop-only { display: none  !important; }
  .mobile-only  { display: block !important; }
}

/* ── HEADER ── */
.site-header {
  padding: 18px 40px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0,0,0,0.15);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.logo { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--color1); }
.header-badge {
  font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,255,255,0.45); border: 1px solid var(--border); padding: 4px 14px; border-radius: 20px;
}

/* ── CONTAINER ── */
.container { max-width: 900px; margin: 0 auto; padding: 56px 24px 80px; flex: 1; }

/* ── HERO ── */
.page-hero { margin-bottom: 40px; }
.hero-tag {
  display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color1); border: 1px solid var(--color2);
  background: var(--secondary-gradient-background-color2); padding: 4px 14px; border-radius: 4px; margin-bottom: 16px;
}
h1 { font-size: clamp(32px, 5vw, 48px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; color: #fff; margin-bottom: 14px; }
.text-accent {
  background: linear-gradient(135deg, #01d796, #00c084);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.page-hero p { font-size: 14.5px; line-height: 1.75; color: rgba(255,255,255,0.45); font-weight: 300; }

/* ── SUMMARY STRIP ── */
.summary-strip {
  display: flex; align-items: center;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; padding: 20px 28px; margin-bottom: 40px;
  flex-wrap: wrap; gap: 16px;
}
.summary-item { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 120px; }
.summary-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
.summary-value { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
.summary-value.green { color: var(--color1); }
.summary-value.red   { color: #ff6b6b; }
.summary-divider { width: 1px; background: var(--border); align-self: stretch; }

/* ── TX BLOCK ── */
.tx-block { margin-bottom: 40px; }

/* ── STATE CARD ── */
.state-card {
  background: var(--surface); border: 1px dashed var(--border);
  border-radius: 14px; padding: 48px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
}
.state-icon { font-size: 32px; opacity: 0.4; }
.state-card p { font-size: 14px; color: rgba(255,255,255,0.3); font-weight: 300; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(1,215,150,0.15);
  border-top-color: var(--color1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── TX LIST ── */
.tx-list {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden;
}

.tx-header {
  display: grid;
  grid-template-columns: 110px 1fr 110px 110px 1fr 130px;
  padding: 10px 20px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid var(--border);
  gap: 10px;
}
.th {
  font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(255,255,255,0.3);
  white-space: nowrap;
}

/* ── TX ROW ── */
.tx-row {
  display: grid;
  grid-template-columns: 110px 1fr 110px 110px 1fr 130px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  gap: 10px;
  align-items: center;
  transition: background 0.15s;
}
.tx-row:hover { background: rgba(255,255,255,0.02); }

@media (max-width: 768px) {
  .tx-row {
    grid-template-columns: 1fr 1fr;
    padding: 16px;
    gap: 12px;
  }
  .tc-type { grid-column: 1 / -1; }
}

.tx-cell { display: flex; flex-direction: column; gap: 3px; }
.tx-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.3); }

/* type badge */
.type-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700; text-transform: capitalize;
}
.type-badge.deposit    { background: rgba(1,215,150,0.12); color: var(--color1); border: 1px solid rgba(1,215,150,0.2); }
.type-badge.withdrawal { background: rgba(255,107,107,0.1); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.2); }

/* amount */
.amount-val { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
.amount-val.deposit    { color: var(--color1); }
.amount-val.withdrawal { color: #ff6b6b; }

/* status */
.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600; text-transform: capitalize;
}
.status-badge.completed { background: rgba(1,215,150,0.1);  color: var(--color1); border: 1px solid rgba(1,215,150,0.2);  }
.status-badge.pending   { background: rgba(251,191,36,0.1); color: #fbbf24;       border: 1px solid rgba(251,191,36,0.2); }
.status-badge.failed    { background: rgba(255,107,107,0.1);color: #ff6b6b;       border: 1px solid rgba(255,107,107,0.2);}
.status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.status-badge.pending .status-dot { animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* method */
.method-tag {
  display: inline-block; font-size: 11.5px; font-weight: 500;
  color: rgba(255,255,255,0.65);
  background: rgba(255,255,255,0.05); border: 1px solid var(--border);
  padding: 3px 10px; border-radius: 6px; white-space: nowrap;
}

/* wallet */
.wallet-row { display: flex; align-items: center; gap: 7px; }
.wallet-addr { font-size: 11.5px; color: rgba(255,255,255,0.5); font-family: 'Courier New', monospace; letter-spacing: 0.01em; }
.copy-btn {
  font-size: 11px; font-weight: 600; color: var(--color1);
  background: var(--secondary-gradient-background-color2);
  border: 1px solid var(--color2); padding: 3px 10px;
  border-radius: 5px; cursor: pointer; white-space: nowrap;
  flex-shrink: 0; transition: all 0.2s;
}
.copy-btn.copied { color: #fff; background: rgba(1,215,150,0.2); border-color: var(--color1); }

/* date */
.date-val { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 300; white-space: nowrap; }

/* ── FOOTER ── */
.site-footer {
  padding: 20px 40px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(0,0,0,0.1);
}
.footer-logo { font-size: 15px; font-weight: 700; color: var(--color1); }
.footer-note { font-size: 12px; color: rgba(255,255,255,0.3); font-weight: 300; }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: var(--color1); color: #002a1c;
  font-size: 13px; font-weight: 700; padding: 10px 24px;
  border-radius: 30px; box-shadow: 0 4px 20px rgba(1,215,150,0.35);
  z-index: 9999; white-space: nowrap;
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

@media (max-width: 580px) {
  .site-header { padding: 14px 18px; }
  .container { padding: 36px 16px 60px; }
  .summary-strip { padding: 16px 18px; }
  .site-footer { flex-direction: column; gap: 6px; padding: 18px; }
}
</style>