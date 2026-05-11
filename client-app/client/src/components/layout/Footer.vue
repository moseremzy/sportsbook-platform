<template>
  <footer class="site-footer">
    <!-- Main links section -->
    <div class="footer-top">
      <div class="footer-col">
        <h4>OUR PRODUCTS</h4>
        <ul>
          <li><router-link to="#">Bets</router-link></li>
          <li><router-link to="#">LIVE Sport</router-link></li>
          <li><router-link to="#">Casinos</router-link></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>INFORMATION</h4>
        <ul>
          <li><router-link to="#">Betting Terms &amp; Conditions</router-link></li>
          <li><router-link to="#">Gambling Rules</router-link></li>
          <li><router-link to="#">Affiliate program</router-link></li>
          <li><router-link to="#">License</router-link></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>CONTACT US</h4>
        <ul>
          <li><router-link to="mailto:support@primeodds.com">support@primeodds.com</router-link></li>
        </ul>
      </div>

      <div class="footer-col footer-col--lang">
        <h4>LANGUAGE</h4>
        <div class="lang-selector">
          <span>EN</span>
          <svg viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z"/></svg>
        </div>
      </div>
    </div>

    <div class="footer-divider"/>

    <!-- Sports leagues -->
    <div class="footer-logos">
      <div class="logo-item nba"><img src = "../../assets/static_images/banners/NBA.png"></div>
      <div class="logo-item mlb"><img src = "../../assets/static_images/banners/MLB.png"></div>
      <div class="logo-item ucl"><img src = "../../assets/static_images/banners/UCL.png"></div>
      <div class="logo-item wimbledon"><img src = "../../assets/static_images/banners/TENNIS.png"></div>
      <div class="logo-item bundesliga"><img src = "../../assets/static_images/banners/BUNDESLIGA.png"></div>
      <div class="logo-item premier"><img src = "../../assets/static_images/banners/EPL.png"></div>
      <div class="logo-item laliga"><img src = "../../assets/static_images/banners/LIGA.png"></div>
    </div>

    <div class="footer-divider"/>

    <!-- Payment methods -->
    <div class="footer-payments">
      <div class="pay-item"><img src = "../../assets/static_images/banners/BTC.png"></div>
      <div class="pay-item"><img src = "../../assets/static_images/banners/ETH.png"></div>
      <div class="pay-item"><img src = "../../assets/static_images/banners/TETH.png"></div>
    </div>

    <div class="footer-divider"/>

    <!-- Copyright -->
    <div class="footer-bottom">
      <p>Copyright © 2026, vikingbet.win. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.site-footer {
  background: var(--color2);
  color: rgba(255,255,255,0.75);
  font-size: 13.5px;
  padding: 40px 0 24px;
}

.footer-top {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px 32px;
}

@media (max-width: 900px) {
  .footer-top {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .footer-top {
    grid-template-columns: 1fr;
  }
}

h4 {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 14px;
  text-transform: uppercase;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: #4cde80;
}

.lang-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 16px;
}

.lang-selector svg {
  width: 8px;
  height: 5px;
  opacity: 0.6;
}

.webdev-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #112a18;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.webdev-card:hover {
  border-color: rgba(76,222,128,0.4);
}

.webdev-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.webdev-icon svg {
  width: 100%;
  height: 100%;
}

.webdev-card span {
  font-size: 11.5px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.04em;
  line-height: 1.4;
}

.footer-divider {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 24px;
}

.footer-logos,
.footer-payments {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px 60px;
}

.logo-item {
  color: rgba(255,255,255,0.55);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: color 0.2s;
  cursor: pointer;
}

.logo-item img{
  height: 25px;
}

.logo-item:hover { color: #fff; }

.logo-item.f1    { color: #e10600; font-style: italic; font-size: 15px; }
.logo-item.nba   { color: #c9082a; }
.logo-item.ufc   { color: #d4af37; font-style: italic; font-size: 15px; }
.logo-item.premier { color: #3d185f; }

.pay-item {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: color 0.2s;
  cursor: pointer;
}

.pay-item img{
  height: 25px;
}

.pay-item:hover { color: rgba(255,255,255,0.85); }
.pay-item.visa  { font-style: italic; font-weight: 800; letter-spacing: 0.06em; }

.footer-bottom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  text-align: center;
  color: rgba(255,255,255,0.35);
  font-size: 12px;
}
</style>