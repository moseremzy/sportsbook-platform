<template>
  <header class="site-header">
    <div class="header-left">
      <button class="hamburger desktop-only" @click.stop="interactive_store.toggleNav('left_side_bar')" aria-label="Menu">
        <span/><span/><span/>
      </button>
      <a href="/" class="logo">
        <img src="../../assets/static_images/logo.png" alt="Viking Bet" class="logo-img" />
        <span class="logo-text">{{settings_store.settings.website.toUpperCase()}}</span>
      </a>
    </div>

    <div class="header-right">
      <template v-if="user_store.isAuthenticated">
        <div class="balance">
          <span class="balance-label">Balance</span>
          <span class="balance-value">{{ user_store.formattedPrice(user_store.user.balance) }}</span>
        </div>
        <button class="icon-btn profile-btn" @click.stop="interactive_store.toggleNav('right_side_bar')" aria-label="Profile">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </button>
        <router-link to = "/account/deposits" class="deposit-btn">Deposit</router-link>
      </template>

      <template v-else>
        <router-link to = "/sign-in" class="auth-btn signin-btn">Sign In</router-link>
        <router-link to = "/sign-in" class="auth-btn signup-btn">Sign Up</router-link>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInteractiveStore } from '@/stores/interactive';
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '../../stores/settings'

const settings_store = useSettingsStore()
const user_store = useUserStore()
const interactive_store = useInteractiveStore()


</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 900;
  background: var(--color2);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  height: 60px;                  /* ✅ fixed height */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 12px;
  overflow: hidden;              /* ✅ prevents logo from bleeding out */
}

/* ── Left ── */
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 100%;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.hamburger:hover {
  background: rgba(255,255,255,0.06);
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
}

.deposit-btn {
  display: none;
}

@media (min-width: 1025px) {
  .hamburger.desktop-only {
    display: flex;
  }
  .deposit-btn {
    display: block;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  height: 100%;
}

.logo-img {
  height: 42px;                  /* ✅ fits inside 60px header */
  width: auto;
  object-fit: contain;
  display: block;
}

.logo-img[src] ~ .logo-text { display: none; }

.logo-text {
  font-size: 20px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: 0.08em;
  font-style: italic;
}

/* ── Right ── */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.balance-label {
  font-size: 10px;
  color: rgb(184, 182, 182);
  letter-spacing: 0.04em;
}

.balance-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.08);
  border: none;
  border-radius: 50%;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.14);
  color: var(--text);
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.deposit-btn {
  background: var(--color1);
  color: var(--text);
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  letter-spacing: 0.02em;
}

.deposit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.auth-btn {
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: 8px;
  padding: 7px 18px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}

.signin-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.85);
}

.signin-btn:hover {
  border-color: rgba(255,255,255,0.5);
  color: var(--text);
}

.signup-btn {
  background: linear-gradient(135deg, #3dc45a, #2aa646);
  border: none;
  color: var(--text);
}

.signup-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>