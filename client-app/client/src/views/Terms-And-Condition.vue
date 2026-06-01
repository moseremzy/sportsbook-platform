<template>
  <div class="page-wrapper">
    <div class="noise-overlay"></div>

    <header class="site-header">
      <div class="logo-mark">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">{{settings_store.settings.website.toUpperCase()}}<span class="logo-accent">BET</span></span>
      </div>
      <div class="header-badge">Legal Document</div>
    </header>

    <div class="container">
      <div class="hero-section">
        <div class="doc-tag">Terms And Conditions</div>
        <h1>Betting Rules And<br /><span class="gradient-text">User Agreement</span></h1>
        <div class="divider-line"></div>
      </div>

      <nav class="toc">
        <p class="toc-label">Contents</p>
        <ul>
          <li v-for="(section, i) in sections" :key="i">
            <a :href="`#section-${i}`">
              <span class="toc-num">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ section.title }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="intro-box">
        <span class="intro-icon">⚠</span>
        <p>
          Please read these Terms and Conditions carefully before registering an account or placing any bet on
          {{settings_store.settings.website.toUpperCase()}}. By accessing or using our platform, you confirm that you have read, understood, and agreed
          to be bound by these terms. If you do not agree, you must not use our services.
        </p>
      </div>

      <div class="sections-wrapper">
        <section
          v-for="(section, i) in sections"
          :key="i"
          :id="`section-${i}`"
          class="terms-section"
        >
          <div class="section-header">
            <span class="section-number">{{ String(i + 1).padStart(2, '0') }}</span>
            <h2>{{ section.title }}</h2>
          </div>
          <div class="section-body">
            <p v-for="(para, j) in section.paragraphs" :key="j">{{ para }}</p>
            <ul v-if="section.bullets">
              <li v-for="(bullet, k) in section.bullets" :key="k">{{ bullet }}</li>
            </ul>
          </div>
        </section>
      </div>

      <div class="acceptance-box">
        <div class="acceptance-inner">
          <h3>Your Acceptance</h3>
          <p>
            By creating an account, depositing funds, or placing a wager on {{settings_store.settings.website.toUpperCase()}}, you acknowledge that
            you have read these Terms And Conditions in full and agree to be legally bound by them. These terms
            are governed by the laws of the jurisdiction in which {{settings_store.settings.website.toUpperCase()}} is licensed.
          </p>
          <div class="acceptance-meta">
            <span>{{settings_store.settings.website.toUpperCase()}} Ltd. &copy; 2025</span>
            <span class="dot">·</span>
            <span>All rights reserved</span>
            <span class="dot">·</span>
            <span>License No. SZB-2025-001</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
const settings_store = useSettingsStore()

const sections = ref([
  {
    title: 'Eligibility and Account Registration',
    paragraphs: [
      `To use ${settings_store.settings.website.toUpperCase()}, you must be at least 18 years of age, or the legal gambling age in your jurisdiction, whichever is higher. It is your sole responsibility to verify that online sports betting is legal in your country or state of residence before registering.`,
      `When creating an account, you agree to provide accurate, current, and complete information. You may only hold one active account on our platform. Multiple accounts are strictly prohibited and may result in permanent suspension and forfeiture of any funds held.`,
      `${settings_store.settings.website.toUpperCase()} reserves the right to request identity verification documents at any time. Failure to provide satisfactory documentation within the specified timeframe may result in account suspension.`,
    ],
    bullets: [
      'You must not be a resident of any jurisdiction where online gambling is prohibited.',
      'You must not be an employee, contractor, or affiliate of ${settings_store.settings.website.toUpperCase()} or its partners.',
      'You must not be listed on any self-exclusion register applicable in your jurisdiction.',
    ],
  },
  {
    title: 'Deposits, Withdrawals And Payment Methods',
    paragraphs: [
      `${settings_store.settings.website.toUpperCase()} accepts deposits via credit/debit cards, bank transfers, e-wallets, and select cryptocurrencies. All transactions are processed in the currency displayed at the time of deposit. Currency conversion fees may apply and are the sole responsibility of the user.`,
      `Minimum deposit and withdrawal thresholds apply per payment method and are displayed in the Cashier section. Deposits are typically credited instantly; withdrawal processing times vary between 24 hours and 5 business days depending on the selected method and verification status.`,
      `Withdrawals will only be processed to verified accounts. We operate a same-source withdrawal policy — funds must be returned to the original deposit method before alternative withdrawal methods are considered. ${settings_store.settings.website.toUpperCase()} reserves the right to conduct additional fraud checks before approving any withdrawal.`,
    ],
  },
  {
    title: 'Betting Rules and Wager Acceptance',
    paragraphs: [
      `All bets are subject to acceptance by ${settings_store.settings.website.toUpperCase()}. The company reserves the right to decline, limit, or cancel any wager at its sole discretion, with or without explanation. Bets are only confirmed once a unique bet ID has been generated and displayed in your bet slip.`,
      `In the event of an obvious pricing error — commonly referred to as a "palpable error" or "palpable" — ${settings_store.settings.website.toUpperCase()} reserves the right to void affected bets, regardless of whether they have been settled. This includes but is not limited to grossly incorrect odds arising from technical failures or human error.`,
      `Live (in-play) betting markets may be suspended or voided at any time due to material developments, incorrect data feeds, or technical issues. Bets placed after the outcome of an event is determined, or after a significant event has occurred (e.g., a goal, red card, or injury), may be voided.`,
    ],
    bullets: [
      `Maximum bet and payout limits apply per market, event, and user account.`,
      `Arbitrage betting, use of bots, or any form of systematic exploitation of pricing errors is prohibited.`,
      `${settings_store.settings.website.toUpperCase()} reserves the right to limit bet sizes or restrict account access for users identified as advantage players.`,
    ],
  },
  {
    title: `Bonuses, Promotions, and Free Bets`,
    paragraphs: [
      `From time to time, ${settings_store.settings.website.toUpperCase()} may offer welcome bonuses, reload bonuses, free bets, and other promotional incentives. All promotions are subject to specific terms and conditions which will be published alongside the offer. General bonus terms always apply unless superseded by promotion-specific terms.`,
      `Bonus funds and free bets are subject to wagering requirements before any associated winnings can be withdrawn. Unless stated otherwise, standard wagering requirements are 5x the bonus amount on pre-match markets with minimum odds of 1.50. Wagering on certain markets (e.g., virtuals, lotteries) may not contribute toward rollover requirements.`,
      `${settings_store.settings.website.toUpperCase()} reserves the right to withdraw, amend, or cancel any promotion at any time. Abuse of promotional offers — including but not limited to multi-accounting, bonus hunting in coordination with others, or deliberate hedging — will result in the cancellation of bonuses and may result in permanent account closure.`,
    ],
  },
  {
    title: `Responsible Gambling`,
    paragraphs: [
      `${settings_store.settings.website.toUpperCase()} is committed to promoting responsible gambling. We provide a suite of player protection tools including deposit limits, loss limits, session time reminders, reality checks, cool-off periods, and self-exclusion options. These tools are accessible at any time through your Account Settings.`,
      `If you feel that your gambling is becoming problematic, we strongly encourage you to use our self-exclusion feature, which will immediately restrict access to your account for a minimum period of 6 months. During self-exclusion, you will not receive marketing communications.`,
      `${settings_store.settings.website.toUpperCase()} works with and refers users to independent problem gambling support organisations including GamCare, Gamblers Anonymous, and BeGambleAware. Gambling should be viewed as a form of entertainment, not as a source of income.`,
    ],
    bullets: [
      `Never gamble with money you cannot afford to lose.`,
      `Do not chase losses or gamble under the influence of alcohol or other substances.`,
      `Keep track of the time and money you spend gambling.`,
    ],
  },
  {
    title: `Intellectual Property`,
    paragraphs: [
      `All content on the ${settings_store.settings.website.toUpperCase()} platform — including but not limited to software, text, graphics, logos, icons, images, audio clips, digital downloads, and data compilations — is the property of ${settings_store.settings.website.toUpperCase()} Ltd. or its content suppliers and is protected by applicable intellectual property laws.`,
      `You are granted a limited, non-exclusive, non-transferable licence to access and use the platform for personal, non-commercial purposes only. Any reproduction, redistribution, transmission, sale, publication, or commercial exploitation of our content without prior written consent is strictly prohibited.`,
    ],
  },
  {
    title: `Limitation of Liability`,
    paragraphs: [
      `${settings_store.settings.website.toUpperCase()} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of profits, loss of data, or service interruption, even if ${settings_store.settings.website.toUpperCase()} has been advised of the possibility of such damages.`,
      `Our total aggregate liability to you in connection with our services shall not exceed the total net deposits made to your account in the 12 months preceding the event giving rise to the claim. Nothing in these terms shall limit liability for fraud, gross negligence, or any other matter where liability cannot be lawfully excluded.`,
      `The platform is provided on an "as is" and "as available" basis. ${settings_store.settings.website.toUpperCase()} makes no warranties, express or implied, regarding the uninterrupted availability, accuracy, or fitness for purpose of the platform or its content.`,
    ],
  },
  {
    title: `Amendments and Governing Law`,
    paragraphs: [
      `${settings_store.settings.website.toUpperCase()} reserves the right to amend these Terms and Conditions at any time. Where changes are material, users will be notified via email or an in-platform notification at least 7 days before the changes take effect. Continued use of the platform after the effective date of any amendment constitutes acceptance of the revised terms.`,
      `These Terms and Conditions are governed by and construed in accordance with the laws of Malta (or the relevant licensing jurisdiction). Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of that jurisdiction, unless otherwise required by applicable consumer protection law in your country of residence.`,
    ],
  },
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0a0b0d;
  --surface: #111318;
  --surface-2: #181c22;
  --border: rgba(255, 255, 255, 0.07);
  --accent: #f0b429;
  --accent-dim: rgba(240, 180, 41, 0.12);
  --accent-2: #e05c2a;
  --text-primary: #eef0f3;
  --text-secondary: #7a8290;
  --text-muted: #3e4450;
  --number-color: rgba(240, 180, 41, 0.18);
}

.page-wrapper {
  min-height: 100vh;
  background-color: var(--bg);
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(240, 180, 41, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(224, 92, 42, 0.05) 0%, transparent 60%);
  font-family: 'DM Sans', sans-serif;
  color: var(--text-primary);
  position: relative;
  overflow-x: hidden;
}

.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}

/* HEADER */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: rgba(10, 11, 13, 0.88);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.logo-mark {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 18px;
}

.logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 0.08em;
  color: var(--text-primary);
}

.logo-accent {
  color: var(--accent);
}

.header-badge {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 4px 12px;
  border-radius: 20px;
}

/* CONTAINER */
.container {
  max-width: 860px;
  margin: 0 auto;
  padding: 60px 24px 100px;
  position: relative;
  z-index: 1;
}

/* HERO */
.hero-section {
  margin-bottom: 56px;
}

.doc-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(240, 180, 41, 0.25);
  padding: 5px 14px;
  border-radius: 4px;
  margin-bottom: 22px;
}

h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(48px, 8vw, 72px);
  line-height: 1.0;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.gradient-text {
  background: white;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 300;
  margin-bottom: 32px;
  letter-spacing: 0.03em;
}

.divider-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 2px;
}

/* TABLE OF CONTENTS */
.toc {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px 32px;
  margin-bottom: 32px;
}

.toc-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 16px;
}

.toc ul {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
}

.toc a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 400;
  transition: color 0.2s;
  padding: 2px 0;
}

.toc a:hover {
  color: var(--accent);
}

.toc-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  min-width: 22px;
}

/* INTRO BOX */
.intro-box {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: rgba(224, 92, 42, 0.07);
  border: 1px solid rgba(224, 92, 42, 0.2);
  border-left: 3px solid var(--accent-2);
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 56px;
}

.intro-icon {
  font-size: 18px;
  line-height: 1.6;
  flex-shrink: 0;
  opacity: 0.8;
}

.intro-box p {
  font-size: 14px;
  line-height: 1.7;
  color: #b8bdc8;
  font-weight: 300;
}

/* SECTIONS */
.sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.terms-section {
  border-top: 1px solid var(--border);
  padding: 44px 0;
  position: relative;
}

.terms-section:last-child {
  border-bottom: 1px solid var(--border);
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 20px;
  margin-bottom: 24px;
}

.section-number {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 52px;
  line-height: 1;
  color: var(--number-color);
  letter-spacing: 0.02em;
  flex-shrink: 0;
  user-select: none;
  transition: color 0.3s;
}

.terms-section:hover .section-number {
  color: rgba(240, 180, 41, 0.30);
}

h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(22px, 3.5vw, 28px);
  letter-spacing: 0.06em;
  color: var(--text-primary);
  line-height: 1.2;
}

.section-body {
  padding-left: 72px;
}

.section-body p {
  font-size: 14.5px;
  line-height: 1.8;
  color: #9aa0ac;
  font-weight: 300;
  margin-bottom: 14px;
}

.section-body p:last-child {
  margin-bottom: 0;
}

.section-body ul {
  list-style: none;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-body li {
  font-size: 14px;
  line-height: 1.7;
  color: #9aa0ac;
  font-weight: 300;
  padding-left: 20px;
  position: relative;
}

.section-body li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 11px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.6;
}

/* ACCEPTANCE */
.acceptance-box {
  margin-top: 64px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
  position: relative;
}

.acceptance-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
}

.acceptance-inner {
  padding: 40px 40px 36px;
}

.acceptance-inner h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26px;
  letter-spacing: 0.06em;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.acceptance-inner p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  font-weight: 300;
  margin-bottom: 28px;
}

.acceptance-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.dot {
  opacity: 0.4;
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .site-header {
    padding: 14px 20px;
  }

  .container {
    padding: 40px 18px 80px;
  }

  .toc ul {
    grid-template-columns: 1fr;
  }

  .section-body {
    padding-left: 0;
  }

  .section-header {
    flex-direction: column;
    gap: 4px;
  }

  .section-number {
    font-size: 36px;
  }

  .acceptance-inner {
    padding: 28px 24px;
  }
}
</style>