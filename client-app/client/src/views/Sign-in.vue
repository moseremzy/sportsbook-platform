<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2>Welcome to <span class="brand">{{settings_store.settings.website}}</span></h2>
      <p class="subtitle">
        Log in or create an account to begin your betting experience
      </p>

             <!-- Tabs -->
        <div class="tab-container">
          <button
            v-for="(component, name) in tabs"
            :key="name"
            class="tab"
            :class="{ active: currentTab === name }"
            @click="currentTab = name"
          >
            {{ name }}
          </button>
        </div>
        <!-- Render selected tab component -->
        <component :is="tabs[currentTab]" />
    </div>
</div>
</template>

<script setup>
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue"; // Make sure you have this file
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch} from 'vue'
import MIDDLEWARES from "../middlewares/middlewares"
import { useInteractiveStore } from '@/stores/interactive'
import { useSettingsStore } from '@/stores/settings'

const interactive_store = useInteractiveStore()
const settings_store = useSettingsStore()

let currentTab = ref("Login");

const tabs = reactive({
  Login: Login,
  Register: Register,
});

/* Hooks */

onMounted(() => {
    
    MIDDLEWARES.allowScroll()

})


onUpdated(() => {

    MIDDLEWARES.allowScroll()
    
})


</script>

<style scoped>

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 20px;
}

.auth-box {
  background: var(--color2);
  color: #fff;
  border-radius: 14px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
}

.brand {
  color: var(--primary-blue);
}

.subtitle {
  color: #aaa;
  font-size: 14px;
  margin-bottom: 25px;
}

/* Tabs */
.tab-container {
  display: flex;
  background: rgb(3, 51, 35);
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}
.tab {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  color: #888;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.tab.active {
  background: var(--color1);
  color: #fff;
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-box {
    padding: 20px;
  }
}
</style>