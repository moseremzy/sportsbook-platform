<template>
<div class="market-group">

    <!-- HEADER -->
    <div class="market-group-header">
        <svg
            class="chevron-sm"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path d="M6 9l6 6 6-6"/>
        </svg>

        <span class="market-name">
            Winner
        </span>
    </div>


    <!-- MARKET BODY -->
    <div class="odds-btn-body" :class="market.layout">

    <OddsButton :outcomes = market.outcomes />

    </div>

</div>
</template>

<script setup>

import {reactive} from 'vue'
import OddsButton from '../components/OddsButton.vue'

const market = reactive({
  name: "Winner",
  layout: "grid-1",
  outcomes: [
    { label: "Paris Saint-German", odds: 1.85 },
    { label: "Draw", odds: 3.4 },
    { label: "Arsenal", odds: 4.1 }
  ]
})

</script>

<style scoped>
/* ─────────────────────────────
   MARKET GROUP
───────────────────────────── */
.market-group {
  background: white;
  border-radius: 14px;
  margin: 12px 0;
  overflow: hidden;
  color: black;

  box-shadow:
    0 2px 6px rgba(0,0,0,0.04);
}

/* ─────────────────────────────
   HEADER
───────────────────────────── */
.market-group-header {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 13px 16px;

  background: var(--secondary-gradient-background);

  color: white;

  cursor: pointer;
  user-select: none;
}

.chevron-sm {
  width: 16px;
  height: 16px;
  color: white; 
  transition: transform 0.2s;
  flex-shrink: 0;
}

.market-name {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
}

/* ─────────────────────────────
   MARKET BODY
───────────────────────────── */
.odds-btn-body {
  display: grid;
  gap: 10px;
  padding: 14px;
}

/* 3 outcomes (1X2) */
.odds-btn-body.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* 2 outcomes */
.odds-btn-body.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* many outcomes (dynamic wrapping) */
.odds-btn-body.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
}


</style>