<template>
  <!-- ── RIGHT: BETSLIP (desktop) ── -->
  <aside class="betslip-panel desktop-only">
    <div class="betslip-header">
      <span>Betslip ({{ events_store.bet_slip.length }})</span>
    </div>
    <div class="betslip-tabs">
      <!-- <button class="bs-tab" :class="{ active: betMode === 'ordinary' }" @click="$emit('update:betMode', 'ordinary')">Ordinary</button> -->
      <button class="bs-tab bs-tab--express">Express</button>
    </div>
    <div class="betslip-items">
      <div v-if="events_store.bet_slip.length === 0" class="betslip-empty">Add selections to your betslip</div>
      <div v-for="(bet, i) in events_store.bet_slip" :key="i" class="betslip-item">
        <div class="bet-item-top">
          <span class="bet-league">{{ bet.league }}</span>
          <button class="bet-remove" @click="events_store.remove_bet(bet.selectionId)">✕</button>
        </div>
        <div class="bet-teams">{{ bet.home }}<br/>{{ bet.away }}</div>
        <div class="bet-outcome-row">
          <span class="bet-outcome">Winner: {{ bet.label }}</span>
          <span class="bet-odd-val">{{ bet.odd }}</span>
        </div>
      </div>
    </div>
    <div class="betslip-footer" v-if="events_store.bet_slip.length > 0">
      <div class="total-coeff">
        <span>Total Coefficient:</span>
        <span class="coeff-val">{{ events_store.total_odds.toFixed(2) }}</span>
      </div>
      <div class="total-profit">
          <span>POSSIBLE PROFIT:</span>
          <span>{{events_store.possible_profit(stake)}}</span>
      </div>
      <div class="bet-amount-row">
        <input type="number" v-model = "stake" class="bet-amount-input" placeholder="Bet amount" />
      </div>
      <button class="place-bet-btn" @click="placeBet">Place Bet</button>
    </div>
  </aside>


  <!-- ── MOBILE: Betslip FAB + drawer ── -->

   <!-- Overlay -->
  <Transition name="fade">
    <div
      v-show="interactive_store.activeNav === 'bet_slip_bar'"
      class="slideup-overlay"
      @click="interactive_store.toggleNav()"
    />
  </Transition>

  <button class="mob-betslip-fab mobile-only" @click="interactive_store.toggleNav('bet_slip_bar')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>
    <span v-if="events_store.bet_slip.length > 0" class="fab-badge">{{ events_store.bet_slip.length }}</span>
  </button>

  <Transition name="slide-up">
    <div class="mob-betslip-drawer mobile-only" v-if="interactive_store.activeNav === 'bet_slip_bar'">
      <div class="mob-betslip-header">
        <span>Betslip ({{ events_store.bet_slip.length }})</span>
        <button @click="interactive_store.toggleNav()">✕</button>
      </div>
      <div class="betslip-tabs">
        <!-- <button class="bs-tab" :class="{ active: betMode === 'ordinary' }" @click="$emit('update:betMode', 'ordinary')">Ordinary</button> -->
        <button class="bs-tab bs-tab--express">Express</button>
      </div>
      <div class="betslip-items">
        <div v-if="events_store.bet_slip.length === 0" class="betslip-empty">Add selections to your betslip</div>
        <div v-for="(bet, i) in events_store.bet_slip" :key="i" class="betslip-item">
          <div class="bet-item-top">
            <span class="bet-league">{{ bet.league }}</span>
            <button class="bet-remove" @click="events_store.remove_bet(bet.selectionId)">✕</button>
          </div>
          <div class="bet-teams">{{ bet.home }} vs {{ bet.away }}</div>
          <div class="bet-outcome-row">
            <span class="bet-outcome">Winner: {{ bet.label }}</span>
            <span class="bet-odd-val">{{ bet.odd }}</span>
          </div>
        </div>
      </div>
      <div class="betslip-footer" v-if="events_store.bet_slip.length > 0">
        <div class="total-coeff">
          <span>Total Coefficient:</span>
          <span class="coeff-val">{{ events_store.total_odds.toFixed(2) }}</span>
        </div>
        <div class="total-profit">
          <span>POSSIBLE PROFIT:</span>
          <span>{{events_store.possible_profit(stake)}}</span>
        </div>
        <div class="bet-amount-row">
        <input type="number" v-model = "stake" class="bet-amount-input" placeholder="Bet amount" />
      </div>
      <button class="place-bet-btn" @click ="placeBet">Place Bet</button>
    </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useInteractiveStore } from '../stores/interactive';
import { useEventsStore } from '../stores/events'
import API from '../api/index'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user';
const interactive_store = useInteractiveStore()
const events_store = useEventsStore()
const user_store = useUserStore()


const route   = useRoute()
const router  = useRouter()

const stake = ref('')

async function placeBet() {

  try {

  if (!user_store.isAuthenticated) {

    return router.push({name: 'sign-in'})

  }

  if (events_store.bet_slip.length < 1) {
    
    interactive_store.backend_message = 'Bet slip is empty'

    interactive_store.display_error_alert_box()

    return

  }

   interactive_store.toggle_loading_overlay(true)
    
  const payload = {
    total_odd: events_store.total_odds,
    stake: stake.value,
    possible_win: events_store.possible_profit(stake.value),
    selections: events_store.bet_slip.map(b => ({
      event_id: b.eventId,
      selection_id: b.selectionId,
      odd:          b.odd,
    }))
  }
  
  const response = await API.place_bet(payload)

  interactive_store.backend_message = 'Bet placed successfully!'

  stake.value = ""

  events_store.bet_slip = [];

  localStorage.setItem('bet_slip_events', []); 

  user_store.fetch_user()

  interactive_store.display_success_alert_box()

  } catch (error) {

    console.log(error)
    
  }
  
 interactive_store.toggle_loading_overlay(false)

}


</script>

<style scoped>
.desktop-only { display: none !important; }
.mobile-only  { display: none !important; }
@media (min-width: 1025px) { .desktop-only { display: flex !important; } }
@media (max-width: 1024px) { .mobile-only  { display: flex !important; } }

/* ── Betslip panel (desktop) ── */
.betslip-panel {
  width: 280px;
  flex-shrink: 0;
  background: var( --secondary-gradient-background-color2);
  border-left: 1px solid rgba(255,255,255,0.07);
  flex-direction: column;
  overflow-y: auto;
  height: 120vh;
  scrollbar-width: none;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.betslip-panel::-webkit-scrollbar {
  display: none;
}

.betslip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.betslip-header svg { width: 18px; height: 18px; color: rgba(255,255,255,0.5); }

.betslip-tabs {
  display: flex;
  padding: 10px 12px;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.bs-tab {
  flex: 1;
  padding: 7px 0;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.bs-tab.active          { background: rgba(255,255,255,0.12); color: #fff; }
.bs-tab--express.active { background: #3dc45a; color: #fff; }

.betslip-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.betslip-empty {
  text-align: center;
  padding: 32px 16px;
  color: rgba(255,255,255,0.3);
  font-size: 13px;
}

.betslip-item {
  background: var(--color2);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bet-item-top { display: flex; align-items: center; justify-content: space-between; }
.bet-league   { font-size: 11px; color: rgba(255,255,255,0.5); }

.bet-remove {
  background: none; border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer; font-size: 13px; padding: 2px 4px; transition: color 0.2s;
}
.bet-remove:hover { color: #ff5555; }

.bet-teams { font-size: 12.5px; color: rgba(255,255,255,0.85); line-height: 1.5; }

.bet-outcome-row { display: flex; align-items: center; justify-content: space-between; }
.bet-outcome { font-size: 12px; color: rgba(255,255,255,0.55); }
.bet-odd-val {
  background: rgba(255,255,255,0.1);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 14px; font-weight: 700; color: #fff;
}
.bet-winner-label { font-size: 11px; color: rgba(255,255,255,0.4); }

.betslip-footer {
  padding: 14px 12px 70px 12px;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.total-coeff { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
.total-profit { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
.coeff-val   { font-size: 15px; font-weight: 800; color: #3dc45a; }
.bet-amount-row { display: flex; }

.bet-amount-input {
  width: 100%;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff; padding: 9px 12px; border-radius: 8px; font-size: 14px;
}

.place-bet-btn {
  width: 100%;
  background: linear-gradient(135deg, #3dc45a, #2aa646);
  color: #fff; font-weight: 700; font-size: 14px;
  border: none; border-radius: 8px; padding: 11px;
  cursor: pointer; transition: opacity 0.2s;
}
.place-bet-btn:hover { opacity: 0.9; }

/* ── Mobile FAB ── */
.mob-betslip-fab {
  position: fixed;
  bottom: 80px; right: 16px;
  z-index: 300;
  width: 52px; height: 52px;
  border-radius: 50%;
  background: #3dc45a;
  border: none; color: #fff; cursor: pointer;
  align-items: center; justify-content: center;
  box-shadow: 0 4px 18px rgba(61,196,90,0.4);
}
.mob-betslip-fab svg { width: 24px; height: 24px; }

.fab-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: #e03030; color: #fff;
  font-size: 10px; font-weight: 700;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Overlay */
.slideup-overlay {
  position: fixed;
  top: 0;
  height: 15vh;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(1px);
}

/* ── Mobile drawer ── */
.mob-betslip-drawer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 400;
  background: var( --secondary-gradient-background-color2);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
}

.mob-betslip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px;
  font-size: 15px; font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.mob-betslip-header button {
  background: none; border: none;
  color: rgba(255,255,255,0.5);
  font-size: 18px; cursor: pointer;
}

.slide-up-enter-active,
.slide-up-leave-active { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
.slide-up-enter-from,
.slide-up-leave-to    { transform: translateY(100%); }
</style>