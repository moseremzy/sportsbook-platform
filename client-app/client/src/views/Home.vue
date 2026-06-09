<template>
  <div class="home-page">

    <!-- ═══════════════════════════════════════════════
         TOP LEAGUES (desktop only)
    ════════════════════════════════════════════════ -->
    <section class="top-leagues desktop-only">
      <div class="section-header">
        <span class="section-title">TOP LEAGUES</span>
        <router-link to="/events?match_mode=pending" class="section-link">All</router-link>
      </div>
      <div class="auto-scroll-track" ref="leaguesTrack">
        <div class="auto-scroll-inner">
          <router-link to = "/events?match_mode=pending"
            v-for="(league, i) in leagues"
            :key="i"
            class="league-card"
          >
            <div class="league-icon">
              <img :src="`https://${settings_store.settings.website}.win${league.img}`" :alt="league.name" />
            </div>
            <div class="league-label">
              <span class="league-sport">{{ league.sport }}</span>
              <span class="league-name">{{ league.name }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         MATCHES + CASINO TABS ROW
    ════════════════════════════════════════════════ -->
    <section class="tabs-row">
      <!-- Matches / Live Sport -->
      <div class="tab-block">
        <div class="tab-block-header">
          <button class="tab-pill">Matches</button>
          <button class="tab-pill tab-pill--live">
            <span class="live-dot"/>LIVE Sport
          </button>
        </div>
        <div class="tab-scroll-wrap">
          <router-link to = "/events" class="tab-chips auto-scroll-inner" :style="scrollStyle('sports')">
              <div v-for="(s, i) in matchSportsLoop" :key="i" class="chip">
                <img :src="`https://${settings_store.settings.website}.win${s.img}`" class="chip-icon" :alt="s.name" />
                {{ s.name }}
              </div>
          </router-link>
        </div>
      </div>

      <!-- Casino / Live Casino -->
      <div class="tab-block">
        <div class="tab-block-header">
          <button class="tab-pill">Casino</button>
          <button class="tab-pill tab-pill--live">
          <span class="live-dot"/>LIVE Casino
          </button>
        </div>
        <div class="tab-scroll-wrap">
          <router-link to = "/coming-soon" class="tab-chips auto-scroll-inner" :style="scrollStyle('casino')">
              <div v-for="(p, i) in casinoLoop" :key="i" class="chip">
                <img :src="p.img" class="chip-icon" :alt="p.name" />
                {{ p.name }}
              </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         SPORTS ARE TRENDING
    ════════════════════════════════════════════════ -->
    <section class="trending-section">
      <div class="section-title-row">
        <span class="flame-icon">🔥</span>
        <span class="section-title">Sports are trending</span>
      </div>
      <div class="cards-scroll-wrap">
        <div class="cards-inner auto-scroll-inner">
          <router-link to = "/events"
            v-for="(sport, i) in trendingSports"
            :key="i"
            class="sport-card"
            :style="{ '--card-color': sport.color }"
          >
            <img :src="sport.img" :alt="sport.name" class="sport-card-img" />
            <!-- <span class="sport-card-label">{{ sport.name }}</span> -->
          </router-link>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'


import basebCard from '../assets/static_images/SPORTS/baseball.jpg'
import basketbCard from '../assets/static_images/SPORTS/basketball.jpg'
import footbCard from '../assets/static_images/SPORTS/football.jpg'

import { useLeaguesStore } from "../stores/leagues"
import { usesportsStore } from "../stores/sports"
import { useSettingsStore } from '../stores/settings'

const leagues_store = useLeaguesStore()
const sports_store = usesportsStore()
const settings_store = useSettingsStore()

// ── Data ─────────────────────────────────────────────
const leagues = computed(() => {

  return leagues_store.leagues.map(league => {

    const sport = sports_store.sports.find(
      s => s.id === league.sport_id
    )

    return {
      id: league.id,
      name: league.name,
      slug: league.slug,
      img: league.logo, //league.logo,
      sport: sport?.name || "Unknown"
    }

  })

})


const matchSports = computed(() => {
    
    return sports_store.sports?.map((s) => {
    return {
           name: s.name,
           img: s.img
         }
    })

})


const trendingSports = computed(() => {

  const map = {
    football: {
      color: "#c0392b",
      img: footbCard
    },
    basketball: {
      color: "#c0392b",
      img: basketbCard
    },
    baseball: {
      color: "#c0392b",
      img: basebCard
    }
  }

  return sports_store.sports
    .filter(s =>
      ["football", "basketball", "baseball"].includes(s.slug)
    )
    .map(s => {
      const extra = map[s.slug]

      return {
        id: s.id,
        name: s.name.toUpperCase(),
        slug: s.slug,
        color: extra?.color,
        img: extra?.img
      }
    })

})

const casinoProviders = [
  { name: 'VibraGaming',   img: 'https://placehold.co/20x20/fff/333?text=V' },
  { name: 'Espressogames', img: 'https://placehold.co/20x20/fff/333?text=E' },
  { name: 'SmartSoft',     img: 'https://placehold.co/20x20/fff/333?text=S' },
  { name: 'Turbogames',    img: 'https://placehold.co/20x20/fff/333?text=T' },
  { name: 'Pragmatic',     img: 'https://placehold.co/20x20/fff/333?text=P' },
  { name: 'Playngo',       img: 'https://placehold.co/20x20/fff/333?text=P' },
  { name: 'EGT',           img: 'https://placehold.co/20x20/fff/333?text=E' },
]
 
// ── Tabs ──────────────────────────────────────────────
const matchTab  = ref('matches')
const casinoTab = ref('casino')

// ── Duplicated lists for infinite seamless scroll ─────
const matchSportsLoop    = computed(() => [...matchSports.value,         ...matchSports.value])
const casinoLoop         = computed(() => [...casinoProviders,     ...casinoProviders])

// px offset per track
const offsets = reactive({
  leagues: 0, sports: 0, casino: 0, trendingSports: 0, trendingGames: 0,
})

// px width of one item (card + gap) per track
const itemWidths = {
  leagues: 130, sports: 120, casino: 138, trendingSports: 160, trendingGames: 150,
}

// full width of one copy of each list
const loopWidths = computed(() => ({
  leagues:        leagues.length         * itemWidths.leagues,
  sports:         matchSports.value.length     * itemWidths.sports,
  casino:         casinoProviders.length * itemWidths.casino,
  trendingSports: trendingSports.length  * itemWidths.trendingSports
}))

// disable transition per track during silent reset
const transitioning = reactive({
  leagues: true, sports: true, casino: true, trendingSports: true, trendingGames: true,
})

function scrollStyle(track) {
  return {
    transform:  `translateX(-${offsets[track]}px)`,
    transition: transitioning[track] ? 'transform 0.75s cubic-bezier(0.4,0,0.2,1)' : 'none',
  }
}

function step(track) {
  offsets[track] += itemWidths[track]
  if (offsets[track] >= loopWidths.value[track]) {
    setTimeout(() => {
      transitioning[track] = false
      offsets[track] = 0
      requestAnimationFrame(() => requestAnimationFrame(() => { transitioning[track] = true }))
    }, 800)
  }
}

let intervals = []

onMounted(() => {
  ['leagues','sports','casino','trendingSports'].forEach(track => {
    intervals.push(setInterval(() => step(track), 7000))
  })
})

onUnmounted(() => intervals.forEach(clearInterval))
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────── */
.home-page {
  padding: 35px 20px 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #fff;
}

/* ── Helpers ────────────────────────────────────────── */
.desktop-only { display: none; }
@media (min-width: 1025px) {
  .desktop-only { display: block; }
}

/* Overflow hidden wrapper so we only see the visible window */
.auto-scroll-track,
.tab-scroll-wrap,
.cards-scroll-wrap {
  overflow: hidden;
  width: 100%;
}

/* The inner row that actually moves */
.auto-scroll-inner {
  display: flex;
  flex-wrap: nowrap;
  will-change: transform;
}

/* ── Section headers ─────────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #fff;
}

.section-link {
  font-size: 12px;
  color: white;
  text-decoration: none;
  font-weight: 600;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.flame-icon { font-size: 18px; }

/* ── TOP LEAGUES ─────────────────────────────────────── */
.top-leagues {
  background: url('@/assets/static_images/green-gradient.svg');
  border-radius: 8px;
  padding: 14px 16px;
  border: 1px solid rgba(255,255,255,0.07);
}

.league-card {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  margin: 0 0 0 10px;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  min-width: 120px;
  flex-shrink: 0;
  cursor: pointer;
  padding: 16px 10px;
  border-radius: 10px;
  transition: background 0.2s;
}

.league-card:hover { background: rgba(255,255,255,0.06); }

.league-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.12);
}

.league-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.league-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.league-sport {
  font-size: 12px;
  color: white;
}

.league-name {
  font-size: 15px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}

/* ── TABS ROW ────────────────────────────────────────── */
.tabs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 640px) {
  .tabs-row {
    grid-template-columns: 1fr;
  }
}

.tab-block {
  background: url('@/assets/static_images/green-gradient.svg');
  border-radius: 8px;
  padding: 12px 14px;
  border: 1px solid rgba(255,255,255,0.07);
  overflow: hidden;
}

.tab-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  gap: 8px;
}

.tab-pill {
  background: none;
  border: none;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0;
  transition: all 0.2s;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.tab-pill.active {
  color: #fff;
  border-bottom-color: #4cde80;
}

.tab-pill--live {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-pill--live.active { border-bottom-color: #ff4444; }

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff4444;
  flex-shrink: 0;
  animation: pulse-dot 1.4s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

.tab-chips {
  text-decoration: none;
  gap: 8px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 110px;
  cursor: pointer;
  transition: background 0.2s;
}

.chip:hover { background: rgba(255,255,255,0.12); }

.chip-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

/* ── TRENDING SPORTS CARDS ───────────────────────────── */
.trending-section {
  background: #0d2416;
  border-radius: 8px;
  padding: 14px 16px;
  border: 1px solid rgba(255,255,255,0.06);
}

.cards-inner {
  gap: 10px;
}

.sport-card {
  position: relative;
  min-width: 150px;
  height: 195px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.sport-card:hover { transform: scale(1.03); }

.sport-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.sport-card-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 13px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.06em;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  text-transform: uppercase;
}

/* ── TRENDING GAMES ──────────────────────────────────── */
.games-inner {
  gap: 10px;
}

.game-card {
  min-width: 140px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s;
  background: #112a18;
}

.game-card:hover { transform: scale(1.03); }

.game-card-img {
  width: 100%;
  height: 185px;
  object-fit: cover;
  display: block;
}

.game-card-info {
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.game-name {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-provider {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
}

/* ── Responsive tweaks ───────────────────────────────── */
@media (max-width: 640px) {
  .sport-card  { min-width: 130px; height: 170px; }
  .game-card   { min-width: 120px; }
  .game-card-img { height: 160px; }
  .chip        { min-width: 100px; }
}
</style>