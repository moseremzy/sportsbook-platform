<template>
  <div class="bottom-tab">
    <router-link to="/events?match_mode=pending" exact-active-class = "tab-item--active" class="tab-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="3" y="3" width="7" height="9" rx="1.5"/>
        <rect x="14" y="3" width="7" height="5" rx="1.5"/>
        <rect x="14" y="12" width="7" height="9" rx="1.5"/>
        <rect x="3" y="16" width="7" height="5" rx="1.5"/>
      </svg>
      <span>Bets</span>
    </router-link>

    <!-- <router-link to = "/coming-soon" exact-active-class = "tab-item--active" class="tab-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="9"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
      </svg>
      <span>Casinos</span>
    </router-link> -->

    <router-link to = "/account/deposits" exact-active-class = "tab-item--active" class="tab-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20"/>
      </svg>
      <span>Deposit</span>
    </router-link>

    <router-link to = "/support" exact-active-class = "tab-item--active" class="tab-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="10" r="1" fill="currentColor"/>
        <circle cx="8" cy="10" r="1" fill="currentColor"/>
        <circle cx="16" cy="10" r="1" fill="currentColor"/>
      </svg>
      <span>Support</span>
    </router-link>

    <router-link to = "/account/bet-history" exact-active-class = "tab-item--active" class="tab-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
      <span>My Bets</span>
    </router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
.bottom-tab {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #0d2416;
  border-top: 1px solid rgba(255,255,255,0.08);
  height: 64px;
  align-items: center;
  justify-content: space-around;
  padding: 0 4px;
}

@media (max-width: 1024px) {
  .bottom-tab {
    display: flex;
  }
}

.tab-item {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 10px;
  transition: color 0.2s, background 0.2s;
  min-width: 52px;
}

.tab-item svg {
  width: 22px;
  height: 22px;
}

.tab-item span {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.tab-item--active {
  color: var(--color1);
}
 

/* Live chat bubble — sits in the center area */
.chat-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3dc45a, #2da84a);
  color: #fff;
  border-radius: 24px;
  padding: 8px 14px 8px 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(61,196,90,0.35);
  cursor: pointer;
  transition: transform 0.15s;
}

.chat-bubble:hover {
  transform: scale(1.03);
}

.chat-bubble svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>