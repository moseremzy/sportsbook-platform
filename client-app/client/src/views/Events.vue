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
          v-for="sport in groupedSports"
          :key="sport.id"
          class="sport-item"
          :class="{ active: activeSport === sport.slug }"
          @click="setQuery('sport', sport.slug)"
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
      <button v-if="route.query.match_mode === 'pending'" class="mob-open-live-btn" @click="setQuery('match_mode', 'live')">Open Live</button>
      <button v-if="route.query.match_mode === 'live'" class="mob-open-live-btn" @click="setQuery('match_mode', 'pending')">Open Prematch</button>
      <button class="mob-search-btn" @click="mobileSearchOpen = !mobileSearchOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </button>
    </div>

    <!-- Mobile Search Bar -->
    <div class="mobile-search-bar mobile-only" v-if="mobileSearchOpen">
      <input :value="searchQuery" @input="setQuery('q', $event.target.value)" placeholder="Search events..." class="mob-search-input" />
    </div>

    <!-- ═══════════════════════════════════════════
         MAIN LAYOUT
    ════════════════════════════════════════════ -->
    <div class="main-layout">

      <!-- ── LEFT SIDEBAR ── -->
      <EventSidebar :sports="groupedSports" />

      <!-- ── CENTER: EVENTS ── -->
      <div class="events-panel-cover">
        <div class="events-panel">

          <!-- Loading state -->
          <div v-if="loading" class="state-screen">
            <div class="spinner"></div>
            <span>Loading events...</span>
          </div>

          <!-- Empty state -->
          <div v-else-if="filteredEvents.length === 0" class="no-events">
            No events found for the selected filter.
          </div>

          <!-- League groups -->
          <template v-else>
            <div v-for="group in filteredEvents" :key="group.leagueId" class="league-group">
              <div class="league-group-header" @click="toggleGroup(group.leagueId)">
                <svg class="chevron-sm" :class="{ open: !collapsedGroups.includes(group.leagueId) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                <span class="league-group-flag">{{ group.flag }}</span>
                <span class="league-group-name">{{ group.leagueName }}</span>
              </div>

              <div v-if="!collapsedGroups.includes(group.leagueId)">
                <!-- <div class="odds-header desktop-only">
                  <span></span>
                  <span>1</span>
                  <span>X</span>
                  <span>2</span>
                </div> -->

                <div v-for="event in group.events" :key="event.id" class="event-row" :class="{ 'is-live': event.status === 'live' }">
                  <div class="event-meta">
                    <span v-if="event.status === 'live'" class="live-badge-sm">
                      <span class="live-dot-sm"></span> LIVE
                      <span v-if="event.periods && Object.keys(event.periods).length" class="live-period">
                        {{ formatMatchPeriod(getSortedLastPeriod(event.periods), group.sportSlug) }}
                      </span>
                    </span>
                    <template v-else>
                      <span class="event-time">{{ event.time }} {{ event.date }}</span>
                    </template>
                    <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  </div>
                  <div class="event-teams-odds">
                    <div class="event-teams" @click="goToEvent(event.id)">
                     <div class="team-row">
                      <span class="team-logo-sm">
                        <img v-if="event.home_logo" :src="event.home_logo" :alt="event.home" />
                        <template v-else>{{ event.home[0] }}</template>
                      </span>
                      <span class="team-name">{{ event.home }}</span>
                      <span v-if="event.status === 'live'" class="scores-row">
                        <!-- Total score leftmost -->
                        <span class="period-score is-fulltime">{{ event.home_score }}</span>
                        <!-- Then period breakdown -->
                        <span
                          v-for="[period, scores] in getSortedPeriods(event.periods)"
                          :key="period"
                          class="period-score"
                          :class="{ 'is-fulltime': period === 'fulltime' }"
                        >{{ scores.home }}</span>
                      </span>
                    </div>
                    <div class="team-row">
                      <span class="team-logo-sm">
                        <img v-if="event.away_logo" :src="event.away_logo" :alt="event.away" />
                        <template v-else>{{ event.away[0] }}</template>
                      </span>
                      <span class="team-name">{{ event.away }}</span>
                      <span v-if="event.status === 'live'" class="scores-row">
                      <span class="period-score is-fulltime">{{ event.away_score }}</span>
                      <span
                        v-for="[period, scores] in getSortedPeriods(event.periods)"
                        :key="period"
                        class="period-score"
                        :class="{ 'is-fulltime': period === 'fulltime' }"
                      >{{ scores.away }}</span>
                    </span>
                    </div>
                    </div>

  
                    <div v-if="!event.selections || event.selections.length === 0" class="odds-btn-body grid-3">
                      <span class="odd-empty"><span class="odd-label">1</span><span>–</span></span>
                      <span class="odd-empty"><span class="odd-label">X</span><span>–</span></span>
                      <span class="odd-empty"><span class="odd-label">2</span><span>–</span></span>
                    </div>
                    <div v-else class="odds-btn-body" :class="'grid-' + Math.min(event.selections.length, 3)">
                      <button
                        v-for="sel in event.selections.slice(0, 3)"
                        :key="sel.id"
                        class="odd-btn"
                        :class="{ selected: events_store.isBetSelected(sel.id) }"
                        @click="events_store.toggleBet(event, sel, {...group, market_slug: ''})"
                      >
                        <span class="odd-label">{{ HELPER.formatSelectionName(sel.name, group.sportSlug) }}</span>
                        <span class="odd-value">{{ sel.odd.toFixed(2) }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>

      <!-- ── RIGHT: BETSLIP ── -->
      <Betslip/>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useRoute, useRouter} from 'vue-router'
import API from '../api/index'
import HELPER from '../middlewares/middlewares'
import { useInteractiveStore } from '../stores/interactive'
import { useCountriesStore } from '../stores/countries'
import { usesportsStore } from '../stores/sports'
import { useLeaguesStore } from '../stores/leagues'
import { useEventsStore } from '../stores/events'
import EventSidebar from '../components/EventSidebar.vue'
import Betslip from '../components/Betslip.vue'

const route   = useRoute()
const router  = useRouter()

const interactive_store = useInteractiveStore()
const countries_store   = useCountriesStore()
const sports_store      = usesportsStore()
const leagues_store     = useLeaguesStore()
const events_store = useEventsStore()

// ── State ─────────────────────────────────────────────
const allEvents        = ref([])
const loading          = ref(false)
const collapsedGroups  = ref([])
const mobileSearchOpen = ref(false)

let pollInterval = null

// ── URL helpers ───────────────────────────────────────
const activeSport  = computed(() => route.query.sport  || '')
const activeLeague = computed(() => route.query.league || null)
const searchQuery  = computed(() => route.query.q      || '')

function setQuery(key, value) {
  const q = { ...route.query }
  if (value === null || value === undefined) delete q[key]
  else q[key] = value
  if (key === 'sport') { delete q.country; delete q.league }
  router.push({ query: q })
}

function goToEvent(id) {
  router.push({ path: `/view-event/${id}` })
}

// ── Fetch events ──────────────────────────────────────
watch(() => route.query, async (query) => {
  loading.value = true
  try {
    const res = await API.fetch_events(query)
    allEvents.value = res.data ?? []
  } finally {
    loading.value = false
  }
}, { immediate: true, deep: true })

// ── Filtered events ───────────────────────────────────
const filteredEvents = computed(() => {
  let groups = allEvents.value

  if (activeSport.value) {
    groups = groups.filter(g => g.sportSlug === activeSport.value)
  }

  if (activeLeague.value) {
    groups = groups.filter(g => g.leagueId === activeLeague.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    groups = groups
      .map(g => ({
        ...g,
        events: g.events.filter(
          e => e.home.toLowerCase().includes(q) || e.away.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.events.length > 0)
  }

  return groups
})



function formatMatchPeriod(period, sport) {

  // FOOTBALL
  if (sport === 'football') {

    const map = {
      p1: '1st Half',
      p2: '2nd Half',
      fulltime: 'Fulltime',
      overtime: 'Extra Time',
    }

    return map[period] || period
  }

  // BASKETBALL
  if (sport === 'basketball') {

    const map = {
      p1: 'Q1',
      p2: 'Q2',
      p3: 'Q3',
      p4: 'Q4',
      fulltime: 'Finished',
      overtime: 'Extra Time'
    }

    return map[period] || period
  }

  // BASEBALL
  if (sport === 'baseball') {

    const map = {
      p1: '1st Inning',
      p2: '2nd Inning',
      p3: '3rd Inning',
      p4: '4th Inning',
      p5: '5th Inning',
      p6: '6th Inning',
      p7: '7th Inning',
      p8: '8th Inning',
      p9: '9th Inning',
      fulltime: 'Finished',
      overtime: 'Extra Inning'
    }

    return map[period] || period
  }

  return period
}


function getSortedLastPeriod(periods) {
  return Object.keys(periods)
    .filter(p => p !== 'fulltime')
    .sort((a, b) => {
      const n = k => parseInt(k.replace('p', '')) || 0
      return n(a) - n(b)
    })
    .at(-1)
}


function getSortedPeriods(periods) {
  return Object.entries(periods).sort((a, b) => {
    if (a[0] === 'fulltime') return -1
    if (b[0] === 'fulltime') return 1
    if (a[0] === 'overtime') return 1   // overtime rightmost (after regular periods)
    if (b[0] === 'overtime') return -1
    const n = k => parseInt(k.replace('p', '')) || 0
    return n(b[0]) - n(a[0])  // descending: p7 before p6 before p5...
  })
}

// ── Grouped sports ────────────────────────────────────
const groupedSports = computed(() =>
  sports_store.sports.map(sport => ({
    id:   sport.id,
    slug: sport.slug,
    name: sport.name,
    icon: sport.icon,
    count: leagues_store.leagues.filter(l => l.sport_id === sport.id).length,
    countries: countries_store.countries
      .filter(c =>
        leagues_store.leagues.some(l => l.sport_id === sport.id && l.country_id === c.id)
      )
      .map(c => ({
        id:   c.id,
        slug: c.slug,
        name: c.name,
        leagues: leagues_store.leagues
          .filter(l => l.sport_id === sport.id && l.country_id === c.id)
          .map(l => ({ id: l.id, slug: l.slug, name: l.name })),
      })),
  }))
)

// ── Collapse ──────────────────────────────────────────
function toggleGroup(id) {
  const idx = collapsedGroups.value.indexOf(id)
  if (idx === -1) collapsedGroups.value.push(id)
  else collapsedGroups.value.splice(idx, 1)
}
 

// ── Sports tab scroll ─────────────────────────────────
const sportsScroll = ref(null)

const smoothScroll = (el, distance) => {
  const start = el.scrollLeft
  const target = start + distance
  const duration = 1300
  const startTime = performance.now()
  const step = (now) => {
    const p = Math.min((now - startTime) / duration, 1)
    const ease = p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2
    el.scrollLeft = start + (target - start) * ease
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const scrollSportsLeft  = () => sportsScroll.value && smoothScroll(sportsScroll.value, -200)
const scrollSportsRight = () => sportsScroll.value && smoothScroll(sportsScroll.value,  200)



onMounted(() => {
  
  pollInterval = setInterval(async () => {
    
    try {

      const res = await API.fetch_events(route.query)
      
      allEvents.value = res.data ?? []
    
    } catch (err) {
      
      console.error('Polling error:', err)
    }
  }, 5 * 60 * 1000) // every 5 minutes
})

onUnmounted(() => {
  
  clearInterval(pollInterval)

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
.sport-item:hover  { color: #fff; }
.sport-item.active { color: #fff; border-bottom-color: #3dc45a; }
.sport-item-icon   { width: 28px; height: 28px; }
.sport-item-icon svg { width: 100%; height: 100%; }
.sport-item-name   { font-size: 13px; font-weight: 600; }

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
  scrollbar-width: none;
}
.events-panel-cover::-webkit-scrollbar { display: none; }

@media (max-width: 1024px) {
  .events-panel-cover {
    overflow: unset;
    max-height: unset;
    height: unset;
  }
 .period-score {
    display: none;
  }
  .period-score.is-fulltime {
    display: block;
  }
}

/* ── Events panel ── */
.events-panel {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── State screens ── */
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
  border-top: 1px solid rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.event-row.is-live { background: rgba(239,68,68,0.04); }

.event-meta    { display: flex; align-items: center; gap: 6px; }
.event-time    { font-size: 11.5px; color: black; font-weight: bold; }
.calendar-icon { width: 14px; height: 14px; color: black; }

.live-badge-sm {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  color: #e03030;
  letter-spacing: 0.04em;
}

.live-dot-sm {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #e03030;
  animation: pulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

.event-teams-odds { display: flex; align-items: center; gap: 8px; }
.event-teams      { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.team-row         { cursor: pointer; display: flex; align-items: center; gap: 7px; }

.team-logo-sm {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(32,31,31,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
  overflow: hidden;
}
.team-logo-sm img { width: 100%; height: 100%; object-fit: contain; }

.team-name  { font-size: 13px; font-weight: 500; color: rgba(44,43,43,0.9); flex: 1; }

.live-score {
  font-size: 13px;
  font-weight: 800;
  color: #e03030;
  min-width: 16px;
  text-align: right;
}

.live-period {
  font-size: 10px;
  font-weight: 700;
  color: rgba(224, 48, 48, 0.75);
  background: rgba(224, 48, 48, 0.08);
  border: 1px solid rgba(224, 48, 48, 0.2);
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  margin-left: 4px;
}

.scores-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.period-score {
  font-size: 12px;
  font-weight: 700;
  color: rgba(80, 80, 80, 0.6);
  min-width: 16px;
  text-align: center;
  padding: 1px 5px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.period-score.is-fulltime {
  color: #e03030;
  background: rgba(224, 48, 48, 0.08);
  font-size: 13px;
}

.event-more {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  white-space: nowrap;
  min-width: 38px;
  text-align: center;
  background: rgba(0,0,0,0.25);
  border: none;
  border-radius: 5px;
  padding: 4px 6px;
  cursor: pointer;
  font-weight: 600;
}
.event-more:hover { background: rgba(0,0,0,0.4); color: #fff; }

/* ── Odds buttons ── */
.odds-btn-body        { display: grid; gap: 5px; }
.odds-btn-body.grid-3 { grid-template-columns: repeat(3, minmax(52px, 1fr)); }
.odds-btn-body.grid-2 { grid-template-columns: repeat(2, minmax(52px, 1fr)); }
.odds-btn-body.grid-1 { grid-template-columns: repeat(1, minmax(52px, 1fr)); }

/* placeholder */
.odd-empty {
  height: 48px;
  background: #f0f2f0;
  border: 1px solid #e0e4e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0 6px;
}
.odd-empty .odd-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(0,0,0,0.25);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}
.odd-empty span:last-child {
  font-size: 14px;
  font-weight: 700;
  color: rgba(0,0,0,0.18);
  line-height: 1;
}

/* real odd button */
.odd-btn {
  height: 48px;
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
  padding: 0 6px;
  position: relative;
  overflow: hidden;
}
.odd-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(61,196,90,0) 0%, rgba(61,196,90,0.06) 100%);
  opacity: 0;
  transition: opacity 0.16s;
}
.odd-btn:hover {
  background: linear-gradient(160deg, #edfaf0 0%, #d9f2e0 100%);
  border-color: #b0c43d;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(61,196,90,0.18);
}
.odd-btn:hover::after { opacity: 1; }
.odd-btn:active { transform: translateY(0); box-shadow: none; }

.odd-btn.selected {
  background: linear-gradient(160deg, #b0c43d 0%, #96a82d 100%);
  border-color: #a6a82d;
  box-shadow: 0 3px 10px rgba(171, 196, 61, 0.35);
}
.odd-btn.selected::after { opacity: 0; }

.odd-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(0,0,0,0.38);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}
.odd-btn:hover .odd-label   { color: rgba(171, 199, 69, 0.7); }
.odd-btn.selected .odd-label { color: rgba(255,255,255,0.75); }

.odd-value {
  font-size: 14px;
  font-weight: 800;
  color: #1a3320;
  line-height: 1;
  letter-spacing: -0.01em;
}
.odd-btn:hover .odd-value    { color: black; }
.odd-btn.selected .odd-value { color: #ffffff; }

/* ── No events ── */
.no-events {
  text-align: center;
  display: block;
  width: 50%;
  margin: 10px auto;
  padding: 48px 16px;
  color: rgba(255,255,255,0.35);
  font-size: 14px;
}
</style>