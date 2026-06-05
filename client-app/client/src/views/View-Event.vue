<template>
  <div class="events-page">

    <!-- ═══════════════════════════════════════════
         MOBILE: Top bar
    ════════════════════════════════════════════ -->
    <div class="mobile-topbar mobile-only">
      <button class="mob-back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
        Back
      </button>
      <button class="mob-search-btn" @click="mobileSearchOpen = !mobileSearchOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </button>
    </div>

    <!-- Mobile Search Bar -->
    <div class="mobile-search-bar mobile-only" v-if="mobileSearchOpen">
      <input v-model="marketSearch" placeholder="Search markets..." class="mob-search-input" />
    </div>

    <!-- ═══════════════════════════════════════════
         MAIN LAYOUT
    ════════════════════════════════════════════ -->
    <div class="main-layout">

      <!-- ── LEFT SIDEBAR ── -->
      <EventSidebar :sports="groupedSports" base-path="/events" />

      <div class="view-event">

        <!-- Loading -->
        <div v-if="loading" class="state-screen">
          <div class="spinner"></div>
          <span>Loading event...</span>
        </div>

        <!-- Error -->
        <div v-else-if="!event" class="state-screen">
          <span style="font-size:32px">📭</span>
          <span>Event not found.</span>
        </div>

        <template v-else>

          <!-- ── MATCH CARD ── -->
          <div class="match-card" :class="{ 'is-live': event.status === 'live' }">

            <!-- TOP BAR -->
            <div class="card-top">
              <div class="league">
                <img v-if="event.league_logo" :src="`http://localhost:9000${event.league_logo}`" alt="" />
                <span>{{ event.sport_name }}. {{ event.league_name }}</span>
              </div>
              <div class="top-actions">
                <i class="fa-regular fa-star"></i>
              </div>
            </div>

            <!-- MOBILE ONLY: standalone time -->
            <div class="match-time mobile-only" v-if="event.status !== 'live'">
              <h1>{{ formatTime(event.start_time) }}</h1>
            </div>

            <!-- TEAMS ROW -->
            <div class="teams">

              <div class="team team-home">
                <img v-if="event.home_logo" :src="event.home_logo" :alt="event.home_team" />
                <span class="team-initial" v-else>{{ event.home_team?.[0] }}</span>
                <span>{{ event.home_team }}</span>
              </div>

              <!-- CENTER BLOCK -->
              <div class="center-block">

                <!-- LIVE -->
                <div v-if="event.status === 'live'" class="live-score-card">
                  <div class="score">
                    <span class="home-score">{{ event.home_score }}</span>
                    <span class="separator">:</span>
                    <span class="away-score">{{ event.away_score }}</span>
                  </div>
                  <div class="match-status">
                    <span>{{ currentPeriodLabel }}</span>
                    <span class="dot"></span>
                  </div>
                  <!-- Period scores -->
                  <div v-if="event.periods && Object.keys(event.periods).length" class="period-scores-row">
                    <div
                      v-for="(scores, period) in event.periods"
                      :key="period"
                      class="period-col"
                      :class="{ 'is-fulltime': period === 'fulltime' }"
                    >
                      <span class="period-label">{{ formatMatchPeriod(period, event.sport_slug) }}</span>
                      <span class="period-vals">{{ scores.home }} - {{ scores.away }}</span>
                    </div>
                  </div>
                </div>

                <!-- PREMATCH -->
                <div v-else class="prematch-time">
                  <h2 class="desktop-only">{{ formatTime(event.start_time) }}</h2>
                  <span class="match-date">{{ formatDate(event.start_time) }}</span>
                  <!-- Countdown -->
                  <div class="countdown" v-if="countdown">
                    <div class="time-box"><h2>{{ countdown.days }}</h2><small>days</small></div>
                    <span>:</span>
                    <div class="time-box"><h2>{{ countdown.hours }}</h2><small>hours</small></div>
                    <span>:</span>
                    <div class="time-box"><h2>{{ countdown.minutes }}</h2><small>min</small></div>
                    <span>:</span>
                    <div class="time-box"><h2>{{ countdown.seconds }}</h2><small>sec</small></div>
                  </div>
                </div>

              </div>

              <div class="team team-away">
                <img v-if="event.away_logo" :src="event.away_logo" :alt="event.away_team" />
                <span class="team-initial" v-else>{{ event.away_team?.[0] }}</span>
                <span>{{ event.away_team }}</span>
              </div>

            </div>
          </div>

          <!-- ═══════════════════════════════════════════
               MARKET TAB BAR
          ════════════════════════════════════════════ -->
          <div class="market-tabbar">
            <button class="tab-arrow" @click="scrollMarketsLeft">
              <font-awesome-icon icon="fa-solid fa-chevron-left"/>
            </button>
            <div class="market-tabs-inner" ref="marketsScroll">

               
              <button
                v-for="market in filteredMarkets"
                :key="market.id"
                class="market-item"
                :class="{ active: activeMarketId === market.id }"
                @click="activeMarketId = market.id"
              >
                {{ market.market_slug }}
              </button>
            </div>
            <button class="tab-arrow" @click="scrollMarketsRight">
              <font-awesome-icon icon="fa-solid fa-chevron-right"/>
            </button>
          </div>

          <!-- Desktop market search -->
          <div class="market-search-wrap desktop-only">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input v-model="marketSearch" placeholder="Search markets..." class="market-search-input" />
          </div>

          <!-- ── MARKET SELECTIONS ── -->
          <div class="markets-panel">

            <div v-if="!activeMarket" class="state-screen">
              <span>Select a market above</span>
            </div>

            <div v-else class="market-card">
              <div class="market-card-header">
                <span class="market-card-name">{{ activeMarket.market_slug }}</span>
              </div>
              <div class="selections-grid" :class="gridClass(activeMarket.selections)">
                <button
                  v-for="sel in activeMarket.selections"
                  :key="sel.id"
                  class="odd-btn"
                  :class="{ selected: events_store.isBetSelected(sel.id), suspended: sel.status === 'suspended' }"
                  :disabled="sel.status === 'suspended'"
                  @click="events_store.toggleBet(eventForBet, sel, { leagueId: event.league_slug, leagueName: event.league_name, market_slug: activeMarket.market_slug, sportSlug: event.sport_slug })"
                >
                  <span class="odd-label">
                    {{ HELPER.formatSelectionName(sel.name, event.sport_slug) }}
                    <template v-if="sel.line_value !== null && sel.line_value !== undefined">
                      {{ sel.line_value }}
                    </template>
                  </span>
                  <span class="odd-value">{{ sel.status === 'suspended' ? '–' : parseFloat(sel.odd).toFixed(2) }}</span>
                </button>
              </div>
            </div>

          </div>

        </template>
      </div>

      <!-- ── RIGHT: BETSLIP ── -->
      <Betslip/>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API from '../api/index'
import HELPER from '../middlewares/middlewares'
import { useInteractiveStore } from '../stores/interactive'
import { useCountriesStore } from '../stores/countries'
import { usesportsStore } from '../stores/sports'
import { useLeaguesStore } from '../stores/leagues'
import { useEventsStore } from '../stores/events'
import EventSidebar from '../components/EventSidebar.vue'
import Betslip from '../components/Betslip.vue'

const route  = useRoute()
const router = useRouter()

const interactive_store = useInteractiveStore()
const countries_store   = useCountriesStore()
const sports_store      = usesportsStore()
const leagues_store     = useLeaguesStore()
const events_store      = useEventsStore()

// ── State ─────────────────────────────────────────────
const event          = ref(null)
const loading        = ref(false)
const activeMarketId = ref(null)
const marketSearch   = ref('')
const mobileSearchOpen = ref(false)
const marketsScroll  = ref(null)
let pollInterval = null

// ── Fetch event ───────────────────────────────────────
async function fetchEvent() {

  loading.value = true
  
  try {

    const res = await API.fetch_event(route.params.id)
    
    event.value = res.data ?? null

    if (event.value?.markets?.length) {
      
      activeMarketId.value = event.value.markets[0].id
    
    }
  
  } finally {
    
    loading.value = false
  
  }

}

// Replace your existing watch with this
watch(() => route.params.id, async () => {

  loading.value = true
  
  try {
    
    const res = await API.fetch_event(route.params.id)
    
    event.value = res.data ?? null
    
    if (event.value?.markets?.length) {
      activeMarketId.value = event.value.markets[0].id
    }
  
  } finally {
    
    loading.value = false
  
  }
  
  startPolling() // restart poll for new event

}, { immediate: true })


// ── Filtered markets (search) ─────────────────────────
const filteredMarkets = computed(() => {
  if (!event.value?.markets) return []
  const q = marketSearch.value.trim().toLowerCase()
  if (!q) return event.value.markets
  return event.value.markets.filter(m => m.name.toLowerCase().includes(q))
})

// ── Active market ─────────────────────────────────────
const activeMarket = computed(() =>
  filteredMarkets.value.find(m => m.id === activeMarketId.value) ?? null
)

// Auto-select first when search filters change
watch(filteredMarkets, (list) => {
  if (list.length && !list.find(m => m.id === activeMarketId.value)) {
    activeMarketId.value = list[0].id
  }
})

// ── Event shaped for toggleBet ────────────────────────
const eventForBet = computed(() => ({
  id:         event.value?.id,
  home:       event.value?.home_team,
  away:       event.value?.away_team,
  home_logo:  event.value?.home_logo,
  away_logo:  event.value?.away_logo,
  status:     event.value?.status,
  home_score: event.value?.home_score,
  away_score: event.value?.away_score,
}))

// ── Period / label helpers ────────────────────────────
function formatMatchPeriod(period, sport) {
  const maps = {
    football:   { p1: '1H', p2: '2H', fulltime: 'FT', overtime: 'ET' },
    basketball: { p1: 'Q1', p2: 'Q2', p3: 'Q3', p4: 'Q4', fulltime: 'FT', overtime: 'OT' },
    baseball:   { p1: '1I', p2: '2I', p3: '3I', p4: '4I', p5: '5I', p6: '6I', p7: '7I', p8: '8I', p9: '9I', fulltime: 'FT', overtime: 'EI' },
  }
  return maps[sport]?.[period] ?? period
}

const currentPeriodLabel = computed(() => {
  if (!event.value?.periods) return 'LIVE'
  const keys = Object.keys(event.value.periods).filter(p => p !== 'fulltime')
  const last = keys.at(-1)
  if (!last) return 'LIVE'
  const map = {
    football:   { p1: '1st Half', p2: '2nd Half', fulltime: 'Fulltime', overtime: 'Extra Time' },
    basketball: { p1: 'Q1', p2: 'Q2', p3: 'Q3', p4: 'Q4', fulltime: 'Fulltime', overtime: 'OT' },
    baseball:   { p1: '1st Inning', p2: '2nd Inning', p3: '3rd Inning', p4: '4th Inning', p5: '5th Inning', p6: '6th Inning', p7: '7th Inning', p8: '8th Inning', p9: '9th Inning', fulltime: 'Fulltime', overtime: 'Extra Inning' },
  }
  return map[event.value.sport_slug]?.[last] ?? last
})

// ── Date / time helpers ───────────────────────────────
function formatTime(dt) {
  if (!dt) return '–'
  return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(dt) {
  if (!dt) return '–'
  return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '.')
}

// ── Selections grid class ─────────────────────────────
function gridClass(selections) {
  if (!selections?.length) return 'grid-3'
  const n = Math.min(selections.length, 3)
  return `grid-${n}`
}

// ── Countdown ─────────────────────────────────────────
const countdown = ref(null)
let countdownTimer = null

function updateCountdown() {
  if (!event.value?.start_time || event.value.status !== 'pending') {
    countdown.value = null
    return
  }
  const diff = new Date(event.value.start_time) - Date.now()
  if (diff <= 0) { countdown.value = null; return }
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  countdown.value = {
    days:    String(days).padStart(2, '0'),
    hours:   String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

watch(event, () => {
  clearInterval(countdownTimer)
  updateCountdown()
  if (event.value?.status === 'pending') {
    countdownTimer = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => clearInterval(countdownTimer))

// ── Grouped sports (sidebar) ──────────────────────────
const groupedSports = computed(() =>
  sports_store.sports.map(sport => ({
    id:   sport.id,
    slug: sport.slug,
    name: sport.name,
    icon: sport.img,
    count: leagues_store.leagues.filter(l => l.sport_id === sport.id).length,
    countries: countries_store.countries
      .filter(c => leagues_store.leagues.some(l => l.sport_id === sport.id && l.country_id === c.id))
      .map(c => ({
        id:   c.id,
        slug: c.slug,
        name: c.name,
        flag: c.flag,
        leagues: leagues_store.leagues
          .filter(l => l.sport_id === sport.id && l.country_id === c.id)
          .map(l => ({ id: l.id, slug: l.slug, name: l.name, logo: l.logo })),
      })),
  }))
)

// ── Market tab scroll ─────────────────────────────────
const smoothScroll = (el, distance) => {
  const start = el.scrollLeft
  const target = start + distance
  const duration = 500
  const startTime = performance.now()
  const step = (now) => {
    const p = Math.min((now - startTime) / duration, 1)
    const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
    el.scrollLeft = start + (target - start) * ease
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const scrollMarketsLeft  = () => marketsScroll.value && smoothScroll(marketsScroll.value, -200)
const scrollMarketsRight = () => marketsScroll.value && smoothScroll(marketsScroll.value, 200)




function startPolling() {

  stopPolling()
  
  pollInterval = setInterval(async () => {
    
    try {
      
      const res = await API.fetch_event(route.params.id)
      
      event.value = res.data ?? null
    
    } catch (err) {
      
      console.error('Polling error:', err)
    
    }
  }, 5 * 60 * 1000)
}

function stopPolling() {
  
  clearInterval(pollInterval)

}


onUnmounted(() => {
  stopPolling()
  clearInterval(countdownTimer)
})

</script>

<style scoped>
.events-page {
  background: #0a1f10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
}

/* ── Visibility helpers ── */
.desktop-only { display: none !important; }
.mobile-only  { display: none !important; }
@media (min-width: 1025px) { .desktop-only { display: flex !important; } }
@media (max-width: 1024px) { .mobile-only  { display: flex !important; } }

/* ── Mobile top bar ── */
.mobile-topbar {
  background: #0d2416;
  padding: 10px 12px;
  height: 60px;
  gap: 8px;
  align-items: center;
}

.mob-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  background: var(--color2);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.mob-search-btn {
  width: 42px; height: 42px;
  background: var(--color2);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mob-search-btn svg { width: 18px; height: 18px; }

.mobile-search-bar { padding: 8px 12px; background: #0d2416; }
.mob-search-input {
  width: 100%;
  background: #163320;
  border: 1px solid rgba(32,110,80,0.1);
  color: #fff;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

/* ── Main layout ── */
.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 0;
}

.view-event {
  margin: 10px;
  width: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.view-event::-webkit-scrollbar { display: none; }

@media (max-width: 1024px) {
  .main-layout { height: unset; justify-content: center; width: 95%; margin: 0 auto; }
  .view-event  { overflow: unset; margin: 8px; }
}

/* ── State screen ── */
.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  color: rgba(255,255,255,0.35);
  font-size: 14px;
}

.spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(61,196,90,0.15);
  border-top-color: #3dc45a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════
   MATCH CARD
══════════════════════════════ */
.match-card {
  width: 100%;
  background: linear-gradient(180deg, #005b3b 0%, #014b31 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-sizing: border-box;
}
.match-card.is-live {
  background: linear-gradient(180deg, #1a0505 0%, #2d0a0a 50%, #014b31 100%);
}

/* ── Card top ── */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.league {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}
.league img { width: 20px; height: 20px; object-fit: contain; }

.top-actions {
  display: flex;
  gap: 14px;
  font-size: 16px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
}
.top-actions i:hover { color: #fbbf24; }

/* ── Mobile time ── */
.match-time h1 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 12px 58px;
}

/* ── Teams ── */
.teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.team {
  display: flex;
  align-items: center;
  gap: 10px;
}
.team img { width: 26px; height: 26px; object-fit: contain; }
.team span { font-size: 15px; font-weight: 700; }

.team-initial {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  flex-shrink: 0;
}

/* ── Center block ── */
.center-block {
  display: flex;
  align-items: center;
}

/* LIVE */
.live-score-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 24px;
  font-weight: 900;
}
.home-score { color: #2f9cff; }
.separator  { color: rgba(255,255,255,0.5); }
.away-score { color: #8cff4d; }

.match-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.12);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  width: fit-content;
}
.dot {
  width: 6px; height: 6px;
  background: #e03030;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }

/* Period scores breakdown */
.period-scores-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.period-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: rgba(255,255,255,0.07);
  border-radius: 6px;
  padding: 4px 8px;
  min-width: 36px;
}
.period-col.is-fulltime {
  background: rgba(224,48,48,0.15);
  border: 1px solid rgba(224,48,48,0.25);
}
.period-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.06em;
}
.period-col.is-fulltime .period-label { color: rgba(224,48,48,0.8); }
.period-vals {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
}

/* PREMATCH */
.prematch-time {
  display: flex;
  text-align: center;
  flex-direction: column;
  gap: 6px;
}
.prematch-time h2 {
  margin: 0 auto;
  display: block;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}
.match-date {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  font-weight: 500;
}

/* Countdown */
.countdown {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 10px 14px;
  width: fit-content;
  margin-top: 8px;
}
.time-box { text-align: center; }
.time-box h2 { margin: 0; font-size: 20px; font-weight: 800; line-height: 1; }
.time-box small { font-size: 10px; color: rgba(255,255,255,0.6); }
.countdown > span { font-size: 18px; font-weight: 700; margin-top: -8px; color: rgba(255,255,255,0.5); }

/* ══════════════════════════════
   DESKTOP MATCH CARD
══════════════════════════════ */
@media (min-width: 1025px) {
  .match-card { padding: 20px 24px; }

  .card-top {
    justify-content: center;
    position: relative;
    margin-bottom: 24px;
  }
  .top-actions { position: absolute; right: 0; }

  .teams {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-bottom: 0;
  }

  .team-home { flex-direction: row-reverse; flex: 1; justify-content: flex-start; }
  .team-away { flex-direction: row; flex: 1; justify-content: flex-start; }
  .team img { width: 36px; height: 36px; }
  .team span { font-size: 16px; }

  .center-block {
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .live-score-card { align-items: center; }
  .score { font-size: 32px; }
  .countdown { margin: 16px auto 0; }
}

/* ══════════════════════════════
   MARKET TAB BAR
══════════════════════════════ */
.market-tabbar {
  background: var(--secondary-gradient-background-color2);
  border-radius: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  padding: 10px 8px;
}

.market-tabs-inner {
  display: flex;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 4px;
}
.market-tabs-inner::-webkit-scrollbar { display: none; }

.market-item {
  display: flex;
  align-items: center;
  border: 0;
  border-radius: 8px;
  padding: 8px 18px;
  background: #00533a;
  color: rgba(255,255,255,0.75);
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  min-width: max-content;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
}
.market-item:hover  { background: #006b4a; color: #fff; }
.market-item.active { background: var(--color1); color: #002a1c; }

.tab-arrow {
  padding: 5px 10px;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab-arrow:hover { background: rgba(255,255,255,0.12); }

/* Market search (desktop) */
.market-search-wrap {
  position: relative;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  width: 14px; height: 14px;
  color: rgba(255,255,255,0.3);
  pointer-events: none;
}
.market-search-input {
  width: 100%;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  padding: 9px 14px 9px 34px;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.market-search-input:focus { border-color: var(--color2); }
.market-search-input::placeholder { color: rgba(255,255,255,0.2); }

/* ══════════════════════════════
   MARKETS PANEL
══════════════════════════════ */
.markets-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 40px;
}

.market-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  color: #000;
}

.market-card-header {
  padding: 10px 16px;
  background: var(--secondary-gradient-background);
  color: #fff;
}
.market-card-name {
  font-size: 13px;
  font-weight: 700;
}

/* ── Selections grid ── */
.selections-grid {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
}
.selections-grid.grid-3 { grid-template-columns: repeat(3, 1fr); }
.selections-grid.grid-2 { grid-template-columns: repeat(2, 1fr); }
.selections-grid.grid-1 { grid-template-columns: repeat(1, 1fr); }

@media (max-width: 480px) {
  .selections-grid.grid-3 { grid-template-columns: repeat(2, 1fr); }
}

/* ── Odd button ── */
.odd-btn {
  height: 52px;
  background: linear-gradient(160deg, #f7faf7 0%, #eef3ee 100%);
  border: 1px solid #d4e4d4;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.16s ease;
  padding: 0 8px;
  position: relative;
  overflow: hidden;
}
.odd-btn:hover:not(:disabled) {
  border-color: #b0c43d;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(61,196,90,0.18);
}

.odd-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }

.odd-btn.selected {
  background: linear-gradient(160deg, #b0c43d 0%, #96a82d 100%);
  border-color: #a6a82d;
  box-shadow: 0 3px 10px rgba(171,196,61,0.35);
}

.odd-btn.suspended {
  opacity: 0.4;
  cursor: not-allowed;
}

.odd-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(0,0,0,0.38);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}
.odd-btn.selected .odd-label { color: rgba(255,255,255,0.75); }

.odd-value {
  font-size: 15px;
  font-weight: 800;
  color: #1a3320;
  line-height: 1;
  letter-spacing: -0.01em;
}
.odd-btn.selected .odd-value { color: #fff; }
</style>