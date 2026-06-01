<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-show="interactive_store.activeNav === 'right_side_bar'"
      class="sidebar-overlay"
      @click="interactive_store.toggleNav()"
    />
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide-right" v-if="user_store.isAuthenticated">
    <aside v-show="interactive_store.activeNav === 'right_side_bar'" class="right-sidebar">
      <!-- Avatar -->
      <div class="profile-header">
        <div class="avatar">{{ userInitial }}</div>
      </div>

      <!-- Balance card -->
      <div class="balance-card">
        <span class="balance-label">Balance</span>
        <span class="balance-amount">{{user_store.formattedPrice(user_store.user.balance)}}</span>
      </div>

      <!-- Deposit button -->
      <router-link to = "/account/deposits" @click="interactive_store.toggleNav()" class="deposit-btn">Deposit</router-link>

      <!-- Menu items -->
      <nav class="sidebar-nav">
        <router-link to ="/account/withdrawals" exact-active-class = "nav-item--active" class="nav-item" @click="interactive_store.toggleNav()">Withdrawal Request</router-link>
        <router-link to ="/account/transactions" exact-active-class = "nav-item--active" class="nav-item" @click="interactive_store.toggleNav()">Transaction History</router-link>
        <router-link to ="/account/bet-history" exact-active-class = "nav-item--active" class="nav-item" @click="interactive_store.toggleNav()">My bets</router-link>
        <router-link to ="/account/settings" exact-active-class = "nav-item--active" class="nav-item" @click="interactive_store.toggleNav()">Settings</router-link>
        <router-link to ="/support" exact-active-class = "nav-item--active" class="nav-item" @click="interactive_store.toggleNav()">Support</router-link>
        <router-link to ="#" class="nav-item nav-item--exit" @click="logout">Exit</router-link>
      </nav>
    </aside>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import API from '../../api/index'
import { useInteractiveStore } from '@/stores/interactive';
import { useUserStore } from '@/stores/user';

const interactive_store = useInteractiveStore()
const user_store = useUserStore()

const userInitial = computed(() => user_store.user?.fullname.charAt(0).toUpperCase())

 async function logout() {

  try {

   interactive_store.toggle_loading_overlay(true)

   const response = await API.logout()

   user_store.logged_Out()

   interactive_store.backend_message = "Logged out successfully"

   interactive_store.display_success_alert_box();

   window.location.assign("/")

  } catch (error) {

    console.log(error)
    
  }

  interactive_store.toggle_loading_overlay(false)

}
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
.right-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  width: 260px;
  background: #0d1b2e;
  border-left: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

/* Avatar */
.profile-header {
  display: flex;
  justify-content: center;
  padding: 32px 16px 20px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3dc45a, #2aa646);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 20px rgba(61,196,90,0.3);
}

/* Balance card */
.balance-card {
  margin: 0 14px 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.balance-amount {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* Deposit button */
.deposit-btn {
  margin: 0 14px 20px;
  background: linear-gradient(135deg, #3dc45a, #2aa646);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  border: none;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  letter-spacing: 0.02em;
  width: calc(100% - 28px);
}

.deposit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nav-item {
  display: block;
  padding: 13px 20px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}

.nav-item--active {
  border-left-color: #3dc45a;
  color: #fff;
  background: rgba(61,196,90,0.06);
}

.nav-item--premium {
  color: #f0c040;
}

.nav-item--premium:hover {
  background: rgba(240,192,64,0.08);
  color: #f5d060;
}

.nav-item--exit {
  color: rgba(255,90,90,0.8);
  margin-top: 4px;
}

.nav-item--exit:hover {
  background: rgba(255,90,90,0.07);
  color: #ff6b6b;
}

/* Live chat bubble */
.chat-bubble {
  position: fixed;
  bottom: 20px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3dc45a, #2da84a);
  color: #fff;
  border-radius: 24px;
  padding: 10px 16px 10px 12px;
  font-size: 12.5px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(61,196,90,0.35);
  cursor: pointer;
  z-index: 1002;
  white-space: nowrap;
  transition: transform 0.15s;
}

.chat-bubble:hover {
  transform: scale(1.03);
}

.chat-bubble svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to    { opacity: 0; }

.slide-right-enter-active,
.slide-right-leave-active { transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); }
.slide-right-enter-from,
.slide-right-leave-to    { transform: translateX(100%); }
</style>