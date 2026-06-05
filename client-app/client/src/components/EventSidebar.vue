<template>
  <aside class="left-sidebar" :class="{ 'mob-open': interactive_store.activeNav === 'event_side_bar' }">
    <div class="mob-overlay" @click="interactive_store.toggleNav()" v-show="interactive_store.activeNav === 'event_side_bar'"/>
    <div class="sidebar-panel">

      <div class="sidebar-top desktop-only">
        <button class="prematch-btn" :class="{ active: matchMode === 'pending' }" @click="setQuery('match_mode', 'pending')">Prematch</button>
        <button class="prematch-btn" :class="{ active: matchMode === 'live' }"     @click="setQuery('match_mode', 'live')">Live</button>
      </div>

      <div class="sidebar-search desktop-only">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input :value="searchQuery" @input="setQuery('q', $event.target.value)" placeholder="Search" />
      </div>

      <div class="overflow-panel">
        <div class="sidebar-section-label">Sports</div>

        <div v-for="sport in sports" :key="sport.id" class="sport-tree">
          <div
            class="sport-tree-header"
            :class="{ active: activeSport === sport.slug }"
            @click="setQuery('sport', activeSport === sport.slug ? null : sport.slug)"
          >
            <img :src="`http://localhost:9000${sport.icon}`" class="sport-tree-icon"/>
            <span class="sport-tree-name">{{ sport.name }}</span>
            <svg class="chevron" :class="{ open: activeSport === sport.slug }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>

          <div v-if="activeSport === sport.slug" class="country-list">
            <div v-for="country in sport.countries" :key="country.id" class="country-item">
              <div
                class="country-header"
                :class="{ open: openCountries.includes(country.slug) }"
                @click="toggleCountry(country.slug)"
              >
                <img :src="`http://localhost:9000${country.flag}`" class="country-flag"/>
                <span class="country-name">{{ country.name }}</span>
                <svg class="chevron" :class="{ open: openCountries.includes(country.slug) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>

              <div v-if="openCountries.includes(country.slug)" class="league-list">
                <div
                  v-for="league in country.leagues"
                  :key="league.id"
                  class="league-item"
                  :class="{ active: activeLeague === league.slug }"
                  @click="setQuery('league', activeLeague === league.slug ? null : league.slug)"
                >
                  <img v-if="league.logo" :src="`http://localhost:9000${league.logo}`" class="league-logo" />
                  <span v-else class="league-logo-placeholder"></span>
                  {{ league.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </aside>
</template>

<script setup>
import { ref, computed }           from 'vue'
import { useRoute, useRouter }     from 'vue-router'
import { useInteractiveStore }     from '../stores/interactive'

const route  = useRoute()
const router = useRouter()

const interactive_store = useInteractiveStore()

const props = defineProps({
  sports:   { type: Array, required: true },
  basePath: { type: String, default: '' },   // ← add this
})

// read active values straight from the URL
const activeSport  = computed(() => route.query.sport       || null)
const activeLeague = computed(() => route.query.league      || null)
const matchMode    = computed(() => route.query.match_mode  || 'pending')
const searchQuery  = computed(() => route.query.q           || '')

// country open/close is local UI state only — not a filter
const openCountries = ref([])

function toggleCountry(slug) {
  const idx = openCountries.value.indexOf(slug)
  if (idx === -1) openCountries.value.push(slug)
  else openCountries.value.splice(idx, 1)
}

function setQuery(key, value) {

  const q = { ...route.query }

  if (value === null || value === undefined) delete q[key]

  else q[key] = value

  if (key === 'sport') {
    delete q.league
    openCountries.value = []
  }

  if (key === 'league') {
    interactive_store.toggleNav(null)
  }

  // ── If a base path is given, reroute there instead of staying put
  if (props.basePath) {
    router.push({ path: props.basePath, query: q })
  } else {
    router.push({ query: q })
  }
}
</script>

<style scoped>
.desktop-only { display: none !important; }
@media (min-width: 1025px) { .desktop-only { display: flex !important; } }

.left-sidebar {
  margin: 0 0 50px 0;
  width: 270px;
  flex-shrink: 0;
  background: var(--color2);
  border-right: 1px solid rgba(255,255,255,0.07);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
  border-bottom-right-radius: 10px;
}

.overflow-panel {
  width: 100%;
  overflow-y: auto;
  height: 100vh;
  scrollbar-width: none;
}
.overflow-panel::-webkit-scrollbar { display: none; }

@media (max-width: 1024px) {
  .left-sidebar {
    position: fixed;
    inset: 0;
    z-index: 200;
    width: 100%;
    background: transparent;
    pointer-events: none;
    display: block !important;
  }
  .left-sidebar.mob-open { pointer-events: all; }

  .mob-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
  }

  .sidebar-panel {
    position: absolute;
    padding: 40px 0;
    top: 0; left: 0; bottom: 0;
    width: 280px;
    background: var(--color2);
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    pointer-events: all;
  }
  .left-sidebar.mob-open .sidebar-panel { transform: translateX(0); }
}

@media (min-width: 1025px) {
  .sidebar-panel { height: 100%; }
  .mob-overlay   { display: none !important; }
}

.sidebar-top {
  padding: 12px;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.prematch-btn {
  flex: 1;
  padding: 7px 0;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.prematch-btn.active { background: var(--color1); color: #fff; }

.sidebar-slider {
  padding: 10px 14px;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.settings-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  font-size: 16px;
}

.slider-label {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
  line-height: 1.3;
}
.slider-label small { font-size: 10px; }
.time-slider { flex: 1; accent-color: #208a37; cursor: pointer; }

.sidebar-search {
  padding: 10px 14px;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sidebar-search svg { width: 16px; height: 16px; color: rgba(255,255,255,0.4); flex-shrink: 0; }
.sidebar-search input {
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  width: 100%;
  outline: none;
}
.sidebar-search input::placeholder { color: rgba(255,255,255,0.35); }

.sidebar-section-label {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tree-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sport-tree-header:hover,
.sport-tree-header.active { background: rgba(61,196,90,0.1); }
.sport-tree-icon {
  width: 20px;
  height: 14px;
  object-fit: contain;
  border-radius: 2px;
  flex-shrink: 0;
}
.sport-tree-icon svg { width: 100%; height: 100%; }
.sport-tree-name { flex: 1; font-size: 13.5px; font-weight: 600; color: #fff; }

.chevron {
  width: 16px; height: 16px;
  color: rgba(255,255,255,0.4);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.chevron.open { transform: rotate(180deg); }

.country-list { background: rgba(0,0,0,0.15); }

.country-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px 9px 26px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.country-header:hover { background: rgba(255,255,255,0.05); }
.country-flag {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}
.country-name { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); }

.league-list { background: rgba(0,0,0,0.1); }
.league-item {
  padding: 8px 16px 8px 44px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  display: flex;        /* ← add this */
  align-items: center;  /* ← add this */
  gap: 8px;             /* ← add this */
}
.league-logo {
  width: 16px;
  height: 16px;
  object-fit: contain;
  border-radius: 2px;
  flex-shrink: 0;
}
.league-logo-placeholder {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.league-item:hover  { background: rgba(255,255,255,0.05); color: #fff; }
.league-item.active { color: #3dc45a; background: rgba(61,196,90,0.08); }
</style>