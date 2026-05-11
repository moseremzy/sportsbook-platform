<template>
  <!-- Overlay -->
 <Transition name="fade">
    <div
      v-show="interactive_store.activeNav === 'left_side_bar'"
      class="sidebar-overlay"
      @click="interactive_store.toggleNav()"
    />
 </Transition>

  <!-- Sidebar -->
 <Transition name="slide-left">
    <aside v-show="interactive_store.activeNav === 'left_side_bar'" class="left-sidebar">
      <!-- Tab switcher -->
      <div class="tab-switcher">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'bets' }"
          @click="activeTab = 'bets'"
        >BETS</button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'casino' }"
          @click="activeTab = 'casino'"
        >CASINO</button>
      </div>

      <nav class="sidebar-nav">
        <!-- Home -->
        <router-link to="#" class="nav-item nav-item--home" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 12L12 3l9 9"/>
            <path d="M9 21V12h6v9"/>
            <path d="M5 10v11h14V10"/>
          </svg>
          Home
        </router-link>

        <!-- Products section -->
        <div class="nav-section-label">Products</div>

        <router-link to="#" class="nav-item" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="7" height="9" rx="1.5"/>
            <rect x="14" y="3" width="7" height="5" rx="1.5"/>
            <rect x="14" y="12" width="7" height="9" rx="1.5"/>
            <rect x="3" y="16" width="7" height="5" rx="1.5"/>
          </svg>
          Bets
        </router-link>

        <a href="#" class="nav-item" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          LIVE Sport
        </a>

        <router-link to="#" class="nav-item" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="16" rx="2"/>
            <path d="M8 2v4M16 2v4M3 10h18"/>
          </svg>
          My bets
        </router-link>

        <router-link to="#" class="nav-item" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
          </svg>
          Casino
        </router-link>

        <router-link to="#" class="nav-item" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 3H8L6 7h12l-2-4z"/>
          </svg>
          Deposit
        </router-link>

        <!-- Divider -->
        <div class="nav-divider"/>

        <router-link to="#" class="nav-item" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Support
        </router-link>

        <router-link to="#" class="nav-item" @click="interactive_store.toggleNav()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z"/>
          </svg>
          Language
        </router-link>
      </nav>

      <!-- Promo banner at bottom -->
      <div class="promo-banner">
        <img src="../../assets/static_images/roulette_spin.gif" alt="Promotion" class="promo-img"/>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useInteractiveStore } from '@/stores/interactive';
 
const interactive_store = useInteractiveStore()
const activeTab = ref('bets')
</script>

<style scoped>
/* Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(1px);
}

/* Sidebar panel */
.left-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1001;
  width: 240px;
  background: var(--color2);
  border-right: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Desktop only */
@media (max-width: 1024px) {
  .left-sidebar {
    display: none !important;
  }
  .sidebar-overlay {
    display: none !important;
  }
}

/* Tab switcher */
.tab-switcher {
  display: flex;
  padding: 12px 12px 0;
  gap: 6px;
}

.tab-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.45);
}

.tab-btn.active {
  background: rgba(255,255,255,0.13);
  color: #fff;
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  border-radius: 0;
}

.nav-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  opacity: 0.75;
}

.nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: #fff;
}

.nav-item:hover svg {
  opacity: 1;
}

.nav-item--home {
  background: rgba(255,255,255,0.05);
  margin: 8px 10px;
  border-radius: 8px;
}

.nav-item--home:hover {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
}

.nav-section-label {
  padding: 10px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.nav-divider {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 8px 0;
}

/* Promo */
.promo-banner {
  padding: 12px;
  margin-top: auto;
}

.promo-img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
  display: block;
  min-height: 50px;
  background: linear-gradient(135deg, #1a3a6b, #4a1a7a);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to    { opacity: 0; }

.slide-left-enter-active,
.slide-left-leave-active { transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); }
.slide-left-enter-from,
.slide-left-leave-to    { transform: translateX(-100%); }
</style>