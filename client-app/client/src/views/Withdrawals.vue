<template>
  <div class="page-wrapper">

    <div class="container">

      <div class="page-hero">
        <div class="hero-tag">Withdrawal</div>
        <h1>Withdrawal <span class="text-accent">Request</span></h1>
        <p>Enter the amount you want to withdraw, pick your preferred crypto, and enter your wallet address.</p>
      </div>

      <!-- STEP 1: AMOUNT + CURRENCY SELECT -->
      <div class="step-block">
        <div class="step-label">
          <span class="step-num">01</span>
          Enter Amount, Wallet Address &amp; Select Currency
        </div>

        <div class="amount-currency-card">
          <!-- USD input -->
          <div class="amount-row">
            <div class="amount-field">
              <input
                v-model="amount
              "
                type="number"
                min="0"
                placeholder="Enter amount"
                class="usd-input"
              />
              <span class="usd-label">{{user_store.user.currency}}</span>
            </div>
          </div>

             <!-- wallet address -->
          <div class="amount-row">
            <div class="amount-field">
              <input
                v-model="wallet"
                type="text"
                min="0"
                placeholder="Wallet Adress"
                class="usd-input"
              />
              <span class="usd-label">{{activeCoin.ticker}}</span>
            </div>
          </div>


          <div class="divider"></div>

          <!-- Coin selector -->
          <div class="coin-tabs">
            <button
              v-for="coin in coins"
              :key="coin.id"
              class="coin-tab"
              :class="{ active: selected === coin.id }"
              @click="selected = coin.id"
            >
              <img :src="coin.symbol" class="coin-img" />
              <span class="coin-name">{{ coin.name }}</span>
              <span class="coin-ticker">{{ coin.ticker }}</span>
            </button>
          </div>

          <p class="rate-note">
            Choose a payment system
          </p>
        </div>
      </div>

      <button class="submit-btn" :disabled="!canSubmit" @click="submitWithdrawal">
         Submit Request
      </button>

      <p class="form-note">Withdrawals are reviewed and credited within 24hrs after network confirmation.</p>
     
     </div>


    <footer class="site-footer">
      <span class="footer-logo">{{settings_store.settings.website}}</span>
      <span class="footer-note">18+ · Bet Responsibly</span>
    </footer>

  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useInteractiveStore } from '@/stores/interactive'
import { useSettingsStore } from '@/stores/settings'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import API from '../api/index'
import btcImg from '../assets/static_images/banners/BTC.png'
import ethImg from '../assets/static_images/banners/ETH.png'
import tethImg from '../assets/static_images/banners/TETH.png'

const settings_store = useSettingsStore()
const interactive_store = useInteractiveStore()

const user_store = useUserStore()
 
const amount = ref('')
const wallet = ref('')
const justCopied = ref(false)
const selected = ref('btc')

const coins = ref([
  {
    id: 'btc',
    name: 'Bitcoin',
    ticker: 'BTC',
    symbol: btcImg,
    network: 'Bitcoin Network',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    ticker: 'ETH',
    symbol: ethImg,
    network: 'ERC-20',
  },
  {
    id: 'usdt',
    name: 'Tether',
    ticker: 'USDT',
    symbol: tethImg,
    network: 'TRC-20',
  },
])



const activeCoin = computed(() => {

  const coin = coins.value.find(c => c.id === selected.value)
  
  if (!coin) return null
  
  return { ...coin }

})

const canSubmit = computed(() =>

  Number(amount.value) > 0 && wallet.value

)

 
async function submitWithdrawal() {

  if (!canSubmit.value) return

  interactive_store.toggle_loading_overlay(true)

  try {

    const res = await API.submit_withdrawal({amount: amount.value, payment_method: selected.value, wallet: wallet.value});
    
    interactive_store.backend_message = "Your withdrawal is been proccessed."

    interactive_store.display_success_alert_box()

    window.location.replace('/') // to transaction history page
  
  } catch (err) {
    
    console.log(err);
  
  }

  interactive_store.toggle_loading_overlay(false)

}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(to right bottom, #003122, #0f1513);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  --surface: rgba(255, 255, 255, 0.04);
}
 
 

/* CONTAINER */
.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 56px 24px 80px;
  flex: 1;
}

/* HERO */
.page-hero { margin-bottom: 48px; }

.hero-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color1);
  border: 1px solid var(--color2);
  background: var(--secondary-gradient-background-color2);
  padding: 4px 14px;
  border-radius: 4px;
  margin-bottom: 16px;
}

h1 {
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #ffffff;
  margin-bottom: 14px;
}

.text-accent {
  background: linear-gradient(135deg, #01d796, #00c084);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-hero p {
  font-size: 14.5px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 300;
}

/* STEPS */
.step-block { margin-bottom: 40px; }

.step-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 18px;
  letter-spacing: -0.01em;
}

.step-num {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color1);
  background: var(--secondary-gradient-background-color2);
  border: 1px solid var(--color2);
  padding: 3px 9px;
  border-radius: 4px;
}

/* AMOUNT + CURRENCY CARD */
.amount-currency-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 26px;
}

.amount-row { margin-bottom: 16px; }

.amount-field {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 0 14px;
  gap: 8px;
}


.usd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  padding: 14px 0;
  width: 100%;
  -moz-appearance: textfield;
}

.usd-input::-webkit-outer-spin-button,
.usd-input::-webkit-inner-spin-button { -webkit-appearance: none; }

.usd-input::placeholder { color: rgba(255,255,255,0.15); }

.usd-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 20px;
}

/* COIN TABS */
.coin-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.coin-tab {
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 0.2s, background 0.2s;
  color: #fff;
}

.coin-tab:hover { border-color: var(--border-strong); }

.coin-tab.active {
  border-color: var(--color1);
  background: var(--secondary-gradient-background-color2);
}

.coin-img {
  object-fit: contain;
  height: 44px;
  width: 100%;
}

.coin-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.rate-note {
  margin-top: 16px;
  font-size: 11.5px;
  color: rgba(255,255,255,0.25);
  font-weight: 300;
  text-align: right;
}

/* FORM */

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* SUBMIT */
.submit-btn {
  background: var(--color1);
  color: #002a1c;
  border: none;
  border-radius: 10px;
  padding: 15px 28px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.form-note {
  font-size: 12px;
  color: var(--border-strong);
  font-weight: 300;
  line-height: 1.6;
  margin-top: 20px;
  text-align: center;
}

/* FOOTER */
.site-footer {
  padding: 20px 40px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.1);
}

.footer-logo {
  font-size: 15px;
  font-weight: 700;
  color: var(--color1);
}

.footer-note {
  font-size: 12px;
  color: var(--border-strong);
  font-weight: 300;
}

/* RESPONSIVE */
@media (max-width: 580px) {
  .container { padding: 40px 16px 60px; }
  .form-row { grid-template-columns: 1fr; }
  .site-footer { flex-direction: column; gap: 6px; padding: 18px; }
}
</style>