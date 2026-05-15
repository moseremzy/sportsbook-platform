<template>
  <div class="events-page">

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

    <!-- ═══════════════════════════════════════════
         MAIN LAYOUT
    ════════════════════════════════════════════ -->
    <div class="main-layout">

      <!-- ── LEFT SIDEBAR ── -->
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

      <div class="view-event">

        <!-- ── MATCH CARD ── -->
        <div class="match-card">

          <!-- TOP BAR: league centered, actions right -->
          <div class="card-top">
            <div class="league">
              <img src="../assets/static_images/LEAGUES/UCL.png" alt="">
              <span>Football. UEFA Champions League</span>
            </div>
            <div class="top-actions">
              <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
              <i class="fa-regular fa-star"></i>
            </div>
          </div>

          <!-- MOBILE ONLY: standalone time -->
          <div class="match-time mobile-only">
            <h1>17:00</h1>
          </div>

          <!-- TEAMS ROW (score sits between teams on desktop) -->
          <div class="teams">
            <div class="team team-home">
              <img src="https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg" alt="">
              <span>Paris Saint-Germain</span>
            </div>

            <!-- CENTER: score (live) or time+date (prematch) -->
            <div class="center-block">
              <!-- LIVE: show score -->
              <div class="live-score-card">
                <div class="score">
                  <span class="home-score">0</span>
                  <span class="separator">:</span>
                  <span class="away-score">1</span>
                </div>
                <div class="match-status">
                  <span>2 Half</span>
                  <span class="dot"></span>
                </div>
              </div>

              <!-- PREMATCH: show time + date (swap with above when needed) -->
              <!--
              <div class="prematch-time">
                <h2>17:00</h2>
                <span class="match-date">30.05</span>
              </div>
              -->
            </div>

            <div class="team team-away">
              <img src="https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg" alt="">
              <span>Arsenal</span>
            </div>
          </div>

          <!-- COUNTDOWN -->
          <div class="countdown">
            <div class="time-box">
              <h2>16</h2>
              <small>days</small>
            </div>
            <span>:</span>
            <div class="time-box">
              <h2>02</h2>
              <small>hours</small>
            </div>
            <span>:</span>
            <div class="time-box">
              <h2>05</h2>
              <small>minutes</small>
            </div>
            <span>:</span>
            <div class="time-box">
              <h2>08</h2>
              <small>seconds</small>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════
             MARKET TAB BAR
        ════════════════════════════════════════════ -->
        <div class="market-tabbar">
          <button class="tab-arrow" @click="scrollSportsLeft">
            <font-awesome-icon icon="fa-solid fa-chevron-left"/>
          </button>
          <div class="market-tabs-inner" ref="sportsScroll">
            <button
              v-for="sport in sports"
              :key="sport.id"
              class="market-item"
              :class="{ active: activeSport === sport.id }"
              @click="selectSport(sport.id)"
            >
              <span class="market-item-name">{{ sport.name }}</span>
            </button>
          </div>
          <button class="tab-arrow" @click="scrollSportsRight">
            <font-awesome-icon icon="fa-solid fa-chevron-right"/>
          </button>
        </div>

        <!-- Market Card -->
        <MarketCard />

      </div>

      <!-- ── RIGHT: BETSLIP ── -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EventSidebar from '../components/EventSidebar.vue'
import Betslip from '../components/Betslip.vue'
import MarketCard from '../components/MarketCard.vue'

const interactive_store = useInteractiveStore()

const sportsScroll = ref(null)
const eventsScroll = ref(null)

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

const smoothScroll = (el, distance) => {
  const start     = el.scrollLeft
  const target    = start + distance
  const duration  = 1300
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

const POPULAR_CARDS_COUNT = 2
const activeCardIndex = ref(0)
const cardWidth = ref(0)

const updateCardWidth = () => {
  if (!eventsScroll.value) return
  const containerWidth = eventsScroll.value.offsetWidth
  cardWidth.value = window.innerWidth >= 1025 ? containerWidth / 2 : containerWidth
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

const activeSport       = ref('football')
const activeCountry     = ref(null)
const activeLeague      = ref(null)
const matchMode         = ref('prematch')
const betMode           = ref('ordinary')
const searchQuery       = ref('')
const sliderHours       = ref(3)
const sliderDays        = ref(7)
const collapsedGroups   = ref([])
const mobileSidebarOpen = ref(false)
const mobileBetslipOpen = ref(false)
const mobileSearchOpen  = ref(false)
const betslip           = ref([])
const betAmount         = ref('')
const selectedOdds      = ref({})

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

function placeBet() {}

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
  height: 60px;
  gap: 8px;
  align-items: center;
  overflow-y: auto;
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
  border: 1px solid rgba(32,110,80,0.1);
  color: #fff;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 14px;
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
}
.view-event::-webkit-scrollbar { display: none; }

/* ══════════════════════════════
   MATCH CARD
══════════════════════════════ */
.match-card {
  width: 100%;
  background: linear-gradient(180deg, #005b3b 0%, #014b31 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  position: relative;
  box-sizing: border-box;
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
  font-size: 14px;
  font-weight: 600;
}

.league img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.top-actions {
  display: flex;
  gap: 14px;
  font-size: 16px;
  color: white;
  cursor: pointer;
}

/* ── Mobile time ── */
.match-time h1 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 12px;
}

/* ── Teams (mobile: column) ── */
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

.team img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.team span {
  font-size: 15px;
  font-weight: 700;
}

/* ── Center block (score or time) ── */
.center-block {
  display: flex;
  align-items: center;
}

.live-score-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
  font-weight: 800;
}

.home-score { color: #2f9cff; }
.separator  { color: white; }
.away-score { color: #8cff4d; }

.match-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.12);
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

/* prematch center block */
.prematch-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.prematch-time h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

.match-date {
  font-size: 13px;
  color: rgba(255,255,255,0.65);
}

/* ── Countdown ── */
.countdown {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 12px 16px;
  width: fit-content;
  margin-top: 16px;
}

.time-box { text-align: center; }

.time-box h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.time-box small {
  font-size: 11px;
  color: rgba(255,255,255,0.75);
}

.countdown > span {
  font-size: 20px;
  font-weight: 700;
  margin-top: -8px;
}

/* ══════════════════════════════
   DESKTOP MATCH CARD
══════════════════════════════ */
@media (min-width: 1025px) {
  .match-card {
    text-align: center;
    padding: 20px 24px;
  }

  /* league centered, actions absolute right */
  .card-top {
    justify-content: center;
    position: relative;
    margin-bottom: 24px;
  }

  .top-actions {
    position: absolute;
    right: 0;
  }

  /* teams: horizontal row */
  .teams {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-bottom: 0;
  }

  /* home: name on left, logo facing center */
  .team-home {
    flex-direction: row-reverse;
    flex: 1;
    justify-content: flex-start;
  }

  /* away: logo facing center, name on right */
  .team-away {
    flex-direction: row;
    flex: 1;
    justify-content: flex-start;
  }

  .team img { width: 32px; height: 32px; }
  .team span { font-size: 16px; }

  /* center block stacked vertically */
  .center-block {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .live-score-card {
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .score { font-size: 28px; font-weight: 900; }

  /* countdown centered */
  .countdown { margin: 20px auto 0; }
}

/* ══════════════════════════════
   MARKET TAB BAR
══════════════════════════════ */
.market-tabbar {
  background: var(--secondary-gradient-background-color2);
  border-radius: 10px;
  margin: 10px 0;
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
}
.market-tabs-inner::-webkit-scrollbar { display: none; }

.market-item {
  display: flex;
  align-items: center;
  border: 0;
  margin: 0 4px;
  border-radius: 8px;
  padding: 8px 20px;
  background: #00533a;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: max-content;
}

.market-item:hover { background: #006b4a; }
.market-item.active { background-color: var(--color1); }
.market-item-name { font-size: 13px; font-weight: 600; }

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
</style>