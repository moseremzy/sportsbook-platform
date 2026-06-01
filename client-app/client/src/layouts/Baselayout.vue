<template>

  <div class="base-layout">

    <LoadingOverlay />

    <SuccessAlertBox>{{interactive_store.backend_message}}</SuccessAlertBox>
    
    <ErrorAlertBox>{{interactive_store.backend_message}}</ErrorAlertBox>

    <Header />

    <div class="main-layout">

      <LeftSideBar />

      <main class="body-content">
        <router-view />
      </main>

      <RightSideBar />

    </div>

    <Footer />

    <BottomTab />

  </div>

</template>

<script setup>
import { useInteractiveStore } from '../stores/interactive'
import { ref } from 'vue' 
import LoadingOverlay from "../components/modals/loading_overlay.vue"
import Header from "../components/layout/Header.vue"
import LeftSideBar from "@/components/layout/LeftSideBar.vue"
import RightSideBar from "@/components/layout/RightSideBar.vue"
import Footer from "../components/layout/Footer.vue"
import BottomTab from "../components/layout/BottomTab.vue"
import SuccessAlertBox from '@/components/alert_box/success.vue';
import ErrorAlertBox from '@/components/alert_box/error.vue';

const interactive_store = useInteractiveStore()
</script>

<style scoped>
  .base-layout {
    background-color: var(--bg);
    min-height: 100vh;
  }
</style>