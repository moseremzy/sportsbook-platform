<template>
  <aside class="left-sidebar" :class="{ 'mob-open': interactive_store.activeNav === 'event_side_bar' }">
    <div class="mob-overlay" @click="interactive_store.toggleNav()" v-show="interactive_store.activeNav === 'event_side_bar'"/>
    <div class="sidebar-panel">
      <div class="sidebar-top desktop-only">
        <button class="prematch-btn" :class="{ active: matchMode === 'prematch' }" @click="$emit('update:matchMode', 'prematch')">Prematch</button>
        <button class="prematch-btn" :class="{ active: matchMode === 'live' }" @click="$emit('update:matchMode', 'live')">Live</button>
      </div>

      <div class="sidebar-slider desktop-only">
        <span class="slider-label">{{ sliderHours }} hours<br><small>Events</small></span>
        <input type="range" min="1" max="12" :value="sliderHours" @input="$emit('update:sliderHours', +$event.target.value)" class="time-slider" />
        <button class="settings-btn">⚙</button>
      </div>

      <div class="sidebar-search desktop-only">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" placeholder="Search" />
      </div>
    
      <div class = "overflow-panel">
      <div class="sidebar-section-label">Sports</div>

      <div v-for="sport in sports" :key="sport.id" class="sport-tree">
        <div
          class="sport-tree-header"
          :class="{ active: activeSport === sport.id }"
          @click="$emit('select-sport', activeSport === sport.id ? null : sport.id)"
        >
          <span class="sport-tree-icon" v-html="sport.icon"></span>
          <span class="sport-tree-name">{{ sport.name }} {{ sport.count }}</span>
          <svg class="chevron" :class="{ open: activeSport === sport.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>

        <div v-if="activeSport === sport.id" class="country-list">
          <div v-for="country in sport.countries" :key="country.id" class="country-item">
            <div
              class="country-header"
              @click="$emit('toggle-country', country.id)"
              :class="{ active: activeCountry === country.id }"
            >
              <span class="country-flag">{{ country.flag }}</span>
              <span class="country-name">{{ country.name }}</span>
              <svg class="chevron" :class="{ open: activeCountry === country.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>

            <div v-if="activeCountry === country.id" class="league-list">
              <div
                v-for="league in country.leagues"
                :key="league.id"
                class="league-item"
                :class="{ active: activeLeague === league.id }"
                @click="$emit('select-league', league.id); $emit('update:mobileSidebarOpen', false)"
              >
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
import { useInteractiveStore } from '../stores/interactive';

const interactive_store = useInteractiveStore()
defineProps({
  sports:            { type: Array,   required: true },
  activeSport:       { type: String,  default: null },
  activeCountry:     { type: String,  default: null },
  activeLeague:      { type: String,  default: null },
  matchMode:         { type: String,  default: 'prematch' },
  sliderHours:       { type: Number,  default: 3 },
  searchQuery:       { type: String,  default: '' },
})

defineEmits([
  'select-sport',
  'toggle-country',
  'select-league',
  'update:matchMode',
  'update:sliderHours',
  'update:searchQuery',
])
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
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.overflow-panel::-webkit-scrollbar{
  display:none;
}

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
    /* height: 100vh; */
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

.collapse-btn {
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.6);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

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
  border: 1px solid red;
  background: none; border: none; color: #fff;
  font-size: 13px; width: 100%; outline: none;
}
.sidebar-search input::placeholder { color: rgba(255,255,255,0.35); }

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sidebar-item:hover { background: rgba(255,255,255,0.05); }
.sidebar-item-icon { font-size: 16px; }

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
.sport-tree-icon { width: 20px; height: 20px; flex-shrink: 0; }
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
.country-header:hover,
.country-header.active { background: rgba(255,255,255,0.05); }
.country-flag { font-size: 16px; }
.country-name { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); }

.league-list { background: rgba(0,0,0,0.1); }
.league-item {
  padding: 8px 16px 8px 44px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.league-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.league-item.active { color: #3dc45a; background: rgba(61,196,90,0.08); }
</style>