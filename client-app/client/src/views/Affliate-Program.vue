<template>
  <div class="page-wrapper">

    <header class="site-header">
      <div class="logo">
        {{settings_store.settings.website}}<span class="accent">BET</span>
      </div>
    </header>

    <div class="container">

      <div class="hero">
        <div class="hero-tag">Affiliate Program</div>
        <h1>{{settings_store.settings.website}} <span class="accent">Affiliate</span> Program</h1>
        <p class="hero-desc">
          If you have an audience, a channel (Telegram, Instagram, YouTube, TikTok), or experience
          in traffic acquisition, we invite you to join the {{settings_store.settings.website}} affiliate program — an
          international platform for sports betting and entertainment.
        </p>
      </div>

      <div class="two-col">

        <div class="card">
          <h2>What we offer our partners</h2>
          <ul>
            <li v-for="offer in offers" :key="offer">
              <span class="bullet">✦</span>
              {{ offer }}
            </li>
          </ul>
        </div>

        <div class="card">
          <h2>Who this is for</h2>
          <ul>
            <li v-for="who in audience" :key="who">
              <span class="bullet">✦</span>
              {{ who }}
            </li>
          </ul>
        </div>

      </div>

      <div class="cta-box">
        <p>To join the affiliate program and discuss terms, contact us:</p>
        <a :href="`mailto:${settings_store.settings.email}`" class="tg-btn">
            {{settings_store.settings.email}}
        </a>
      </div>

    </div>

    <footer class="site-footer">
      <span>18+ · Bet Responsibly</span>
    </footer>

  </div>
</template>

<script setup>

import { useSettingsStore } from '../stores/settings'

import { ref } from 'vue'

const settings_store = useSettingsStore()

const offers = ref([
  'Transparent cooperation terms and stable payouts',
  'Individual conditions tailored to your traffic sources',
  'Partner support and clear reporting',
  'The opportunity to scale your income as your traffic grows',
])

const audience = ref([
  'Owners of Telegram and Instagram channels',
  'Media buyers and traffic specialists',
  'Bloggers and influencers with betting audiences',
  'Sports and betting-related websites and communities',
])
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  color: #ddd9ce;
  display: flex;
  flex-direction: column;
}

.accent { color: #d4a832; }

/* HEADER */
.site-header {
  padding: 18px 40px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.logo {
  font-size: 22px;
  letter-spacing: 0.1em;
  color: #ddd9ce;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon { color: #d4a832; }

/* CONTAINER */
.container {
  max-width: 780px;
  margin: 0 auto;
  padding: 64px 24px 80px;
  flex: 1;
}

/* HERO */
.hero { margin-bottom: 52px; }

.hero-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #d4a832;
  border: 1px solid rgba(212, 168, 50, 0.3);
  padding: 4px 14px;
  border-radius: 4px;
  margin-bottom: 20px;
}

h1 {
  font-size: clamp(20px, 7vw, 62px);
  letter-spacing: 0.03em;
  line-height: 1.05;
  color: #eae6d8;
  margin-bottom: 20px;
}

.hero-desc {
  font-size: 15px;
  line-height: 1.8;
  color: #8a8780;
  font-weight: 300;
  max-width: 620px;
}

/* TWO COL */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  background: #131417;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 30px 28px;
}

.card h2 {
  font-size: 20px;
  letter-spacing: 0.06em;
  color: #eae6d8;
  margin-bottom: 22px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card li {
  display: flex;
  gap: 12px;
  font-size: 14px;
  line-height: 1.65;
  color: #8a8780;
  font-weight: 300;
}

.bullet {
  color: #d4a832;
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 5px;
}

/* CTA */
.cta-box {
  background: #131417;
  border: 1px solid rgba(212, 168, 50, 0.2);
  border-radius: 12px;
  padding: 36px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cta-box p {
  font-size: 15px;
  color: #8a8780;
  font-weight: 300;
  line-height: 1.6;
  max-width: 380px;
}

.tg-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: #d4a832;
  color: #0c0d10;
  font-size: 16px;
  letter-spacing: 0.08em;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.tg-btn:hover { opacity: 0.85; }

/* FOOTER */
.site-footer {
  padding: 20px 40px;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  letter-spacing: 0.08em;
  color: #3e3c38;
}

/* RESPONSIVE */
@media (max-width: 580px) {
  .site-header { padding: 16px 20px; }
  .container { padding: 48px 18px 60px; }
  .two-col { grid-template-columns: 1fr; }
  .cta-box { flex-direction: column; align-items: flex-start; }
  .site-footer { flex-direction: column; gap: 6px; text-align: center; }
}
</style>