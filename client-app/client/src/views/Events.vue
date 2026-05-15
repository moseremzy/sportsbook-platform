<template>
  <div class="events-page">

    <!-- ═══════════════════════════════════════════
         SPORTS TAB BAR
    ════════════════════════════════════════════ -->
    <div class="sports-tabbar">
      <button class="tab-arrow" @click="scrollSportsLeft">
        <font-awesome-icon icon="fa-solid fa-chevron-left"/>
      </button>
      <div class="sports-tabs-inner" ref="sportsScroll">
        <button
          v-for="sport in sports"
          :key="sport.id"
          class="sport-item"
          :class="{ active: activeSport === sport.id }"
          @click="selectSport(sport.id)"
        >
          <span class="sport-item-icon" v-html="sport.icon"></span>
          <span class="sport-item-name">{{ sport.name }}</span>
        </button>
      </div>
      <button class="tab-arrow" @click="scrollSportsRight">
        <font-awesome-icon icon="fa-solid fa-chevron-right"/>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════
         MOBILE: Top bar
    ════════════════════════════════════════════ -->
    <div class="mobile-topbar mobile-only">
      <button class="mob-all-sports-btn" @click="interactive_store.toggleNav('event_side_bar')">
        <span class="hamburger-icon">&#9776;</span> All Sports
      </button>
      <button class="mob-open-live-btn">Open Live</button>
      <button class="mob-search-btn" @click="mobileSearchOpen = !mobileSearchOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </button>
    </div>

    <!-- Mobile Search Bar -->
    <div class="mobile-search-bar mobile-only" v-if="mobileSearchOpen">
      <input v-model="searchQuery" placeholder="Search events..." class="mob-search-input" />
    </div>

    <!-- Mobile time slider -->
    <div class="mobile-slider-row mobile-only">
      <span class="slider-label">{{ sliderDays }} days<br><small>Events</small></span>
      <input type="range" min="1" max="7" v-model="sliderDays" class="time-slider" />
    </div>

    <!-- ═══════════════════════════════════════════
         MAIN LAYOUT
    ════════════════════════════════════════════ -->
    <div class="main-layout">

      <!-- ── LEFT SIDEBAR (reusable component) ── -->
      <EventSidebar
        :sports="sports"
        :activeSport="activeSport"
        :activeCountry="activeCountry"
        :activeLeague="activeLeague"
        :matchMode="matchMode"
        :sliderHours="sliderHours"
        :searchQuery="searchQuery"
        @select-sport="selectSport"
        @toggle-country="toggleCountry"
        @select-league="selectLeague"
        @update:matchMode="matchMode = $event"
        @update:sliderHours="sliderHours = $event"
        @update:searchQuery="searchQuery = $event"
      />

      <!-- ── CENTER: EVENTS ── -->
      <div class = "events-panel-cover">
      <div class="events-panel">
        <!-- Popular Events (mobile) -->
        <div class="popular-events mobile-only" v-if="popularEvent">
          <div class="popular-header">
            <span class="popular-title">Popular Events</span>
          </div>

          <div class="event-tabbar">
            <button class="tab-arrow" @click="scrollEventsLeft">
              <font-awesome-icon icon="fa-solid fa-chevron-left"/>
            </button>

            <div class="event-scroll" ref="eventsScroll">
              <div class="cards-track" :style="trackStyle">

                <div class="popular-card" v-for="n in 2" :key="n">
                  <div class="popular-card-top">
                    <span class="live-badge">Live</span>
                    <span class="popular-league">{{ popularEvent.league }}</span>
                  </div>
                  <div class="popular-teams">
                    <div class="popular-team">
                      <div class="team-logo-circle">{{ popularEvent.home[0] }}</div>
                      <span>{{ popularEvent.home }}</span>
                    </div>
                    <div class="popular-score">{{ popularEvent.score }}</div>
                    <div class="popular-team">
                      <div class="team-logo-circle">{{ popularEvent.away[0] }}</div>
                      <span>{{ popularEvent.away }}</span>
                    </div>
                  </div>
                  <div class="odds-btn-body" :class="market.layout">
                     <OddsButton :outcomes = market.outcomes />
                  </div>
                  <div class="popular-more">+{{ popularEvent.more }}</div>
                </div>

              </div>
            </div>

            <button class="tab-arrow" @click="scrollEventsRight">
              <font-awesome-icon icon="fa-solid fa-chevron-right"/>
            </button>
          </div>
        </div>

        <!-- League groups -->
        <div v-for="group in filteredEvents" :key="group.leagueId" class="league-group">
          <div class="league-group-header" @click="toggleGroup(group.leagueId)">
            <svg class="chevron-sm" :class="{ open: !collapsedGroups.includes(group.leagueId) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            <span class="league-group-flag">{{ group.flag }}</span>
            <span class="league-group-name">{{ group.leagueName }}</span>
          </div>

          <div v-if="!collapsedGroups.includes(group.leagueId)">
            <div class="odds-header desktop-only">
              <span></span>
              <span>1</span>
              <span>X</span>
              <span>2</span>
            </div>

            <div v-for="event in group.events" :key="event.id" class="event-row">
              <div class="event-meta">
                <span class="event-time">{{ event.time }} {{ event.date }}</span>
                <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div class="event-teams-odds">
                <div class="event-teams">
                  <div class="team-row">
                    <span class="team-logo-sm">{{ event.home[0] }}</span>
                    <span class="team-name">{{ event.home }}</span>
                  </div>
                  <div class="team-row">
                    <span class="team-logo-sm">{{ event.away[0] }}</span>
                    <span class="team-name">{{ event.away }}</span>
                  </div>
                </div>
                <span class="event-more">+{{ event.more }}</span>
                <div class="odds-btn-body" :class="market.layout">
                  <OddsButton :outcomes = market.outcomes />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredEvents.length === 0" class="no-events">
          No events found for the selected filter.
        </div>
      </div>
      </div>

      <!-- ── RIGHT: BETSLIP (reusable component) ── -->
      <Betslip
        :betslip="betslip"
        :betMode="betMode"
        :betAmount="betAmount"
        :totalCoeff="totalCoeff"
        @remove-bet="removeBet"
        @place-bet="placeBet"
        @update:betAmount="betAmount = $event"
      />

    </div>
  </div>
</template>

<script setup>
import { useInteractiveStore } from '../stores/interactive';
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import EventSidebar from '../components/EventSidebar.vue'
import Betslip from '../components/Betslip.vue'
import OddsButton from '../components/OddsButton.vue'
const interactive_store = useInteractiveStore()

// ── Refs ──────────────────────────────────────────────
const sportsScroll = ref(null)
const eventsScroll = ref(null)

const market = reactive({
  name: "Winner",
  layout: "grid-3",
  outcomes: [
    { label: null, odds: 1.85 },
    { label: null, odds: 3.4 },
    { label: null, odds: 4.1 }
  ]
})

// ── Sports data ───────────────────────────────────────
const sports = [
  {
    id: 'football', name: 'Football', count: 36,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 6.32 2.26M12 2a10 10 0 0 0-6.32 2.26M2.26 8.68A10 10 0 0 1 12 2M21.74 8.68A10 10 0 0 0 12 2M12 22a10 10 0 0 1-9.74-13.32M12 22a10 10 0 0 0 9.74-13.32M8 12l2 5 4-2 2-5-4-2z"/></svg>`,
    countries: [
      { id: 'england', name: 'England',  leagues: [{ id: 'epl', name: 'Premier League' }] },
      { id: 'spain',   name: 'Spain',    leagues: [{ id: 'laliga', name: 'La Liga' }] },
      { id: 'germany', name: 'Germany',  leagues: [{ id: 'bundesliga', name: 'Bundesliga' }] },
    ]
  },
  {
    id: 'basketball', name: 'Basketball', count: 14,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M4.93 4.93a10 10 0 0 1 14.14 0M4.93 19.07a10 10 0 0 0 14.14 0"/></svg>`,
    countries: [
      { id: 'usa-bball', name: 'USA', leagues: [{ id: 'nba', name: 'NBA' }, { id: 'ncaa', name: 'NCAA' }] },
    ]
  },
  {
    id: 'baseball', name: 'Baseball', count: 9,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M5 5c2 2 2 10 0 14M19 5c-2 2-2 10 0 14M12 2c1 3 1 14 0 20"/></svg>`,
    countries: [
      { id: 'usa-base', name: 'USA', leagues: [{ id: 'mlb', name: 'MLB' }, { id: 'milb', name: 'Minor League' }] },
    ]
  }
]

// ── Events data ───────────────────────────────────────
const allEvents = [
  {
    leagueId: 'epl', leagueName: 'England. Premier League', sportId: 'football', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    events: [
      { id: 'e1', time: '15:00', date: '11.05', home: 'Manchester City', away: 'Arsenal',       odds: [2.10, 3.40, 3.20], more: 210 },
      { id: 'e2', time: '17:30', date: '11.05', home: 'Chelsea',         away: 'Liverpool',      odds: [2.85, 3.20, 2.55], more: 198 },
      { id: 'e3', time: '20:00', date: '11.05', home: 'Tottenham',       away: 'Manchester Utd', odds: [2.40, 3.10, 2.90], more: 175 },
    ]
  },
  {
    leagueId: 'laliga', leagueName: 'Spain. La Liga', sportId: 'football', flag: '🇪🇸',
    events: [
      { id: 'e4', time: '19:00', date: '11.05', home: 'Real Madrid', away: 'Barcelona', odds: [2.20, 3.50, 3.10], more: 320 },
      { id: 'e5', time: '21:30', date: '11.05', home: 'Atletico',    away: 'Sevilla',   odds: [1.95, 3.40, 3.80], more: 145 },
    ]
  },
  {
    leagueId: 'bundesliga', leagueName: 'Germany. Bundesliga', sportId: 'football', flag: '🇩🇪',
    events: [
      { id: 'e6', time: '18:30', date: '11.05', home: 'Bayern Munich', away: 'Dortmund',   odds: [1.75, 3.80, 4.50], more: 280 },
      { id: 'e7', time: '20:30', date: '11.05', home: 'Leipzig',       away: 'Leverkusen', odds: [2.60, 3.20, 2.70], more: 130 },
    ]
  },
  {
    leagueId: 'nba', leagueName: 'USA. NBA', sportId: 'basketball', flag: '🇺🇸',
    events: [
      { id: 'e8', time: '01:00', date: '12.05', home: 'LA Lakers', away: 'Golden State', odds: [1.90, null, 1.95], more: 88 },
      { id: 'e9', time: '03:30', date: '12.05', home: 'Boston',    away: 'Miami Heat',   odds: [1.65, null, 2.25], more: 76 },
    ]
  },
  {
    leagueId: 'ncaa', leagueName: 'USA. NCAA', sportId: 'basketball', flag: '🇺🇸',
    events: [
      { id: 'e10', time: '23:00', date: '11.05', home: 'Duke', away: 'Kentucky', odds: [1.80, null, 2.05], more: 42 },
    ]
  },
  {
    leagueId: 'mlb', leagueName: 'USA. MLB', sportId: 'baseball', flag: '🇺🇸',
    events: [
      { id: 'e11', time: '22:10', date: '11.05', home: 'NY Yankees', away: 'Boston Red Sox', odds: [1.85, null, 1.98], more: 65 },
      { id: 'e12', time: '00:40', date: '12.05', home: 'LA Dodgers', away: 'SF Giants',      odds: [1.70, null, 2.15], more: 58 },
    ]
  },
  {
    leagueId: 'milb', leagueName: 'USA. Minor League', sportId: 'baseball', flag: '🇺🇸',
    events: [
      { id: 'e13', time: '20:05', date: '11.05', home: 'Durham Bulls', away: 'Norfolk Tides', odds: [1.95, null, 1.88], more: 22 },
    ]
  },
]

const popularEvent = {
  league: 'Football. Brazil. Campeonato Brasileiro ...',
  home: 'Clube do Remo', away: 'Sociedade Esportiva Palmeiras',
  score: '1 : 1', odds: [18, 1.66, 2.46], more: 194,
}

// ── Sports tab bar scroll ─────────────────────────────
const smoothScroll = (el, distance) => {
  const start    = el.scrollLeft
  const target   = start + distance
  const duration = 1300
  const startTime = performance.now()
  const step = (currentTime) => {
    const elapsed  = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = progress < 0.5
      ? 16 * progress ** 5
      : 1 - Math.pow(-2 * progress + 2, 5) / 2
    el.scrollLeft = start + (target - start) * ease
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const scrollSportsLeft  = () => sportsScroll.value && smoothScroll(sportsScroll.value, -200)
const scrollSportsRight = () => sportsScroll.value && smoothScroll(sportsScroll.value,  200)

// ── Popular events carousel ───────────────────────────
const POPULAR_CARDS_COUNT = 2
const activeCardIndex = ref(0)
const cardWidth = ref(0)

const updateCardWidth = () => {
  if (!eventsScroll.value) return
  const containerWidth = eventsScroll.value.offsetWidth
  cardWidth.value = window.innerWidth >= 1025
    ? containerWidth / 2
    : containerWidth
}

onMounted(() => {
  updateCardWidth()
  window.addEventListener('resize', updateCardWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateCardWidth)
})

const scrollEventsLeft  = () => { if (activeCardIndex.value > 0) activeCardIndex.value-- }
const scrollEventsRight = () => { if (activeCardIndex.value < POPULAR_CARDS_COUNT - 1) activeCardIndex.value++ }

const trackStyle = computed(() => ({
  transform:  `translateX(${-activeCardIndex.value * cardWidth.value}px)`,
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  display:    'flex',
  width:      '100%',
  willChange: 'transform',
}))

// ── App state ─────────────────────────────────────────
const activeSport         = ref('football')
const activeCountry       = ref(null)
const activeLeague        = ref(null)
const matchMode           = ref('prematch')
const betMode             = ref('ordinary')
const searchQuery         = ref('')
const sliderHours         = ref(3)
const sliderDays          = ref(7)
const collapsedGroups     = ref([])
const mobileSidebarOpen   = ref(false)
const mobileBetslipOpen   = ref(false)
const mobileSearchOpen    = ref(false)
const betslip             = ref([])
const betAmount           = ref('')
const selectedOdds        = ref({})

function selectSport(id) {
  activeSport.value   = id
  activeCountry.value = null
  activeLeague.value  = null
}

function toggleCountry(id) {
  activeCountry.value = activeCountry.value === id ? null : id
  activeLeague.value  = null
}

function selectLeague(id) {
  activeLeague.value = activeLeague.value === id ? null : id
}

function toggleGroup(id) {
  const idx = collapsedGroups.value.indexOf(id)
  if (idx === -1) collapsedGroups.value.push(id)
  else collapsedGroups.value.splice(idx, 1)
}

// ── Filtering ─────────────────────────────────────────
const filteredEvents = computed(() => {
  let groups = allEvents.filter(g => g.sportId === activeSport.value)
  if (activeLeague.value) groups = groups.filter(g => g.leagueId === activeLeague.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    groups = groups
      .map(g => ({ ...g, events: g.events.filter(e => e.home.toLowerCase().includes(q) || e.away.toLowerCase().includes(q)) }))
      .filter(g => g.events.length > 0)
  }
  return groups
})

// ── Betslip ───────────────────────────────────────────
const outcomeLabels = ['1', 'X', '2']
const winnerLabels  = (event, oi) => oi === 0 ? event.home : oi === 2 ? event.away : 'Draw'

function isOddSelected(eventId, oi) {
  return !!selectedOdds.value[`${eventId}_${oi}`]
}

function toggleOdd(event, oi, group) {
  const key = `${event.id}_${oi}`
  if (selectedOdds.value[key]) {
    delete selectedOdds.value[key]
    const idx = betslip.value.findIndex(b => b.key === key)
    if (idx !== -1) betslip.value.splice(idx, 1)
  } else {
    outcomeLabels.forEach((_, i) => {
      const k = `${event.id}_${i}`
      if (selectedOdds.value[k]) {
        delete selectedOdds.value[k]
        const idx = betslip.value.findIndex(b => b.key === k)
        if (idx !== -1) betslip.value.splice(idx, 1)
      }
    })
    selectedOdds.value[key] = true
    betslip.value.push({
      key,
      league:       group.leagueName,
      home:         event.home,
      away:         event.away,
      outcomeLabel: outcomeLabels[oi],
      odd:          event.odds[oi],
      winner:       winnerLabels(event, oi),
    })
  }
  selectedOdds.value = { ...selectedOdds.value }
}

function removeBet(i) {
  const bet = betslip.value[i]
  delete selectedOdds.value[bet.key]
  selectedOdds.value = { ...selectedOdds.value }
  betslip.value.splice(i, 1)
}

function placeBet() {
  // Handle place bet logic here
}

const totalCoeff = computed(() =>
  betslip.value.reduce((acc, b) => +(acc * b.odd).toFixed(2), 1)
)
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
    overflow-y: auto;
    height: 60px;
  gap: 8px;
  align-items: center;
}

.mob-all-sports-btn {
  flex: 1;
  background: var(--color2);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}

.mob-open-live-btn {
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
  border: 1px solid rgba(32, 110, 80, 0.1);
  color: #fff;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 14px;
}

.mobile-slider-row {
  padding: 10px 16px;
  background: #0d2416;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* ── Sports tab bar ── */
.sports-tabbar {
  background: #0d2416;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  padding: 20px 8px 10px;
}

.sports-tabs-inner {
  display: flex;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.sports-tabs-inner::-webkit-scrollbar { display: none; }

.sport-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 0;
  margin: 0 5px;
  border-radius: 10px;
  padding: 12px 24px;
  background: rgba(102,109,102,0.116);
  color: white;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: max-content;
}
.sport-item:hover { color: #fff; }
.sport-item.active { color: #fff; border-bottom-color: #3dc45a; }
.sport-item-icon { width: 28px; height: 28px; }
.sport-item-icon svg { width: 100%; height: 100%; }
.sport-item-name { font-size: 13px; font-weight: 600; }

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

/* ── Main layout ── */
.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 0;
}

.events-panel-cover {
  width: 100%;
  overflow-y: auto;
  background-color: var(--primary-gradient-background);
  height: 120vh;
  margin: 0;
  scrollbar-width: none;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.events-panel-cover::-webkit-scrollbar{
  display:none;
}

/* ── Events panel ── */
.events-panel {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}


/* ── Popular events ── */
.popular-events {
  display: flex;
  flex-direction: column;
  background: #1a3622;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
}

.popular-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 8px;
}
.popular-title { font-size: 15px; font-weight: 700; }

.event-tabbar {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 0 14px;
  overflow: hidden;
}

.event-scroll {
  flex: 1;
  overflow: hidden;
}

.cards-track {
  display: flex;
}

.popular-card {
  min-width: calc(100% - 20px);
  margin: 0 10px;
  background: var(--color2);
  border-radius: 10px;
  padding: 14px;
}

@media (max-width: 1024px) {
  .popular-card { min-width: calc(100% - 20px); }
  .events-panel-cover {
  width: 100%;
  overflow: unset;
  max-height: unset;
  height: unset;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
}

.popular-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.live-badge {
  background: #e03030;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.popular-league {
  flex: 1;
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popular-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 8px;
}

.popular-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}

.team-logo-circle {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 900;
  flex-shrink: 0;
}

.popular-score {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #fff;
}

.odds-btn-body {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

/* 3 outcomes (1X2) */
.odds-btn-body.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* 2 outcomes */
.odds-btn-body.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* many outcomes (dynamic wrapping) */
.odds-btn-body.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
}


.popular-more {
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
}

/* ── League group ── */
.league-group {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  color: black;
}

.league-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--secondary-gradient-background);
  color: white;
  cursor: pointer;
  user-select: none;
}

.chevron-sm {
  width: 16px; height: 16px;
  color: white;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.chevron-sm.open       { transform: rotate(0deg); }
.chevron-sm:not(.open) { transform: rotate(-90deg); }

.league-group-flag { font-size: 16px; }
.league-group-name { flex: 1; font-size: 13.5px; font-weight: 700; }

.odds-header {
  padding: 6px 16px 4px;
  font-size: 11px;
  width: 100%;
  justify-content: flex-end;
  gap: 8px;
}
.odds-header span:first-child { flex: 1; }
.odds-header span { color: black; min-width: 52px; font-weight: bold; text-align: center; }


/* ── Event row ── */
.event-row {
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-meta { display: flex; align-items: center; gap: 6px; }
.event-time { font-size: 11.5px; color: black; font-weight: bold; }
.calendar-icon { width: 14px; height: 14px; color: black; }

.event-teams-odds { display: flex; align-items: center; gap: 8px; }
.event-teams { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.team-row { display: flex; align-items: center; gap: 7px; }

.team-logo-sm {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(32, 31, 31, 0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}

.team-name { font-size: 13px; font-weight: 500; color: rgba(44, 43, 43, 0.9); }
.event-more { font-size: 11px; color: rgba(255,255,255,0.45); white-space: nowrap; min-width: 38px; text-align: center; }

.no-events {
  text-align: center;
  display: block;
  width: 50%;
  margin: 10px auto;
  padding: 48px 16px;
  color: rgba(255,255,255,0.35);
  font-size: 14px;
}

.slider-label {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
  line-height: 1.3;
}
.slider-label small { font-size: 10px; }
.time-slider { flex: 1; accent-color: #3dc45a; cursor: pointer; }
</style>