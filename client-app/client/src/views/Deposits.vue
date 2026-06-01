<template>
  <div class="page-wrapper">

    <header class="site-header">
      <div class="logo">{{settings_store.settings.website}}</div>
      <div class="header-badge">Crypto Deposit</div>
    </header>

    <div class="container">

      <div class="page-hero">
        <div class="hero-tag">Funding</div>
        <h1>Deposit <span class="text-accent">Crypto</span></h1>
        <p>Enter the amount you want to deposit, pick your preferred crypto, and send the exact equivalent to the wallet address shown.</p>
      </div>

      <!-- STEP 1: AMOUNT + CURRENCY SELECT -->
      <div class="step-block">
        <div class="step-label">
          <span class="step-num">01</span>
          Enter Amount &amp; Select Currency
        </div>

        <div class="amount-currency-card">
          <!-- USD input -->
          <div class="amount-row">
            <div class="amount-field">
              <!-- <span class="usd-prefix">{{user_store.user.currency}}</span> -->
              <input
                v-model="amount"
                type="number"
                min="0"
                placeholder="0.00"
                class="usd-input"
              />
              <span class="usd-label">{{user_store.user.currency}}</span>
            </div>
          </div>

          <!-- Conversion display -->
          <div class="conversion-row" v-if="amount > 0 && activeCoin">
            <span class="conversion-equals">=</span>
            <span class="conversion-value">
              <strong>{{ user_store.formattedPrice(amount)}}</strong>
            </span>
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
        </div>
      </div>

      <!-- STEP 2: WALLET ADDRESS -->
      <div class="step-block" v-if="activeCoin && amount > 0">
        <div class="step-label">
          <span class="step-num">02</span>
          Send to This Address
        </div>

        <div class="wallet-card">
          <div class="wallet-top">
            <div class="wallet-coin-info">
              <div>
                <span class="wallet-coin-name">{{ activeCoin.name }}</span>
                <span class="wallet-network">{{ activeCoin.network }}</span>
              </div>
            </div>
            <div class="send-amount-pill">
              Send exactly <strong>{{ user_store.formattedPrice(amount) }} worth of {{ activeCoin.ticker }}</strong>
            </div>
          </div>

          <div class="address-label-text">Wallet Address</div>
          <div class="address-box">
            <span class="address-text">{{ activeCoin.address }}</span>
            <button class="copy-btn" @click="copyAddress(activeCoin.address)" :class="{ copied: justCopied }">
              {{ justCopied ? '✓ Copied' : 'Copy' }}
            </button>
          </div>

          <p class="address-warning">
            ⚠ Only send <strong>{{ activeCoin.ticker }}</strong> on the <strong>{{ activeCoin.network }}</strong> network. Sending other assets will result in permanent loss.
          </p>
        </div>
      </div>

      <!-- STEP 2 LOCKED STATE -->
      <div class="step-block" v-else>
        <div class="step-label">
          <span class="step-num">02</span>
          Send to This Address
        </div>
        <div class="locked-card">
          <span class="lock-icon">🔒</span>
          <p>Enter a deposit amount above to reveal the wallet address.</p>
        </div>
      </div>

      <!-- STEP 3: UPLOAD PROOF -->
      <div class="step-block">
        <div class="step-label">
          <span class="step-num">03</span>
          Upload Payment Proof
        </div>

        <div class="upload-form">
          <div class="form-row">
            <div class="form-group">
              <label>Amount Sent</label>
              <div class="amount-wrap">
                <input :value="user_store.formattedPrice(amount)" readonly placeholder="Auto-filled" />
              </div>
            </div>
          </div>

          <div
            class="drop-zone"
            :class="{ 'is-over': isDragging, 'is-filled': uploadedFile }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input ref="fileInput" type="file" accept="image/*,.pdf" style="display:none" @change="handleFileChange" />

            <div v-if="!uploadedFile" class="drop-empty">
              <div class="drop-icon-wrap">
                <span class="drop-arrow">↑</span>
              </div>
              <p>Drop screenshot here</p>
              <span class="drop-hint">or click to browse · JPG, PNG · max 10MB</span>
            </div>

            <div v-else class="drop-filled">
              <span class="file-type-icon">🖼</span>
              <div class="file-meta">
                <span class="file-name">{{ uploadedFile.name }}</span>
                <span class="file-size">{{ fileSize }}</span>
              </div>
              <button class="remove-file" @click.stop="uploadedFile = null">✕</button>
            </div>
          </div>

          <button class="submit-btn" :disabled="!canSubmit" @click="submitDeposit">
            Submit Deposit
          </button>

          <p class="form-note">Deposits are reviewed and credited within 15–30 minutes after network confirmation.</p>
        </div>
      </div>

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
import API from '../api/index'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import btcImg from '../assets/static_images/banners/BTC.png'
import ethImg from '../assets/static_images/banners/ETH.png'
import tethImg from '../assets/static_images/banners/TETH.png'


const interactive_store = useInteractiveStore()
const settings_store = useSettingsStore()

const user_store = useUserStore()

const amount = ref('')
const justCopied = ref(false)
const uploadedFile = ref(null)
const isDragging  = ref(false)
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
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  },
  {
    id: 'usdt',
    name: 'Tether',
    ticker: 'USDT',
    symbol: tethImg,
    network: 'TRC-20',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
  },
])


const activeCoin = computed(() => {
  
  const coin = coins.value.find(c => c.id === selected.value)
  
  if (!coin) return null
  
  return { ...coin }

})


const copyAddress = (addr) => {

  navigator.clipboard.writeText(addr)
  
  justCopied.value = true
  
  setTimeout(() => (justCopied.value = false), 2000)

}


const fileSize = computed(() => {

  if (!uploadedFile.value) return ''
  
  const kb = uploadedFile.value.size / 1024
  
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`

})

const canSubmit = computed(() =>

  parseFloat(amount.value) > 0 && uploadedFile.value 

)

const handleDrop = (e) => {

  isDragging.value = false
  
  const file = e.dataTransfer.files[0]
  
  if (file) uploadedFile.value = file

}

const handleFileChange = (e) => {
 
  const file = e.target.files[0]
  
  if (file) uploadedFile.value = file

}

const submitDeposit = async () => {

  if (!canSubmit.value) return;

  interactive_store.toggle_loading_overlay(true)

  const formData = new FormData();

  formData.append("amount", amount.value);
  formData.append("payment_method", selected.value);
  formData.append("d_proof", uploadedFile.value);

  try {

    const res = await API.submit_deposit(formData);
    
    interactive_store.backend_message = "Your deposit is been proccessed."

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

/* HEADER */
.site-header {
  padding: 18px 40px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color1);
}

.header-badge {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  border: 1px solid var(--border);
  padding: 4px 14px;
  border-radius: 20px;
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

.usd-prefix {
  font-size: 20px;
  font-weight: 600;
  color: var(--color1);
  flex-shrink: 0;
}

.usd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28px;
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

/* CONVERSION ROW */
.conversion-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px 14px;
  background: rgba(1, 215, 150, 0.06);
  border: 1px solid rgba(1, 215, 150, 0.15);
  border-radius: 8px;
}

.conversion-equals {
  font-size: 18px;
  color: rgba(255,255,255,0.3);
  font-weight: 300;
}

.conversion-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.conversion-value strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--color1);
}

.conversion-ticker {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.06em;
}

.conversion-rate {
  margin-left: auto;
  font-size: 11.5px;
  color: rgba(255,255,255,0.3);
  font-weight: 400;
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

.coin-ticker {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  font-weight: 400;
  letter-spacing: 0.06em;
}

.rate-note {
  margin-top: 16px;
  font-size: 11.5px;
  color: rgba(255,255,255,0.25);
  font-weight: 300;
  text-align: right;
}

.rate-time {
  color: rgba(255,255,255,0.45);
  font-weight: 500;
}

/* WALLET CARD */
.wallet-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 26px;
}

.wallet-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}

.wallet-coin-info { display: flex; align-items: center; gap: 12px; }

.wallet-coin-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.wallet-network {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  font-weight: 400;
  margin-top: 2px;
}

.send-amount-pill {
  font-size: 13px;
  color: var(--color1);
  background: rgba(1, 215, 150, 0.08);
  border: 1px solid rgba(1, 215, 150, 0.2);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 400;
  white-space: nowrap;
}

.send-amount-pill strong { font-weight: 700; }

.address-label-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--border-strong);
  margin-bottom: 8px;
}

.address-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.address-text {
  font-size: 12.5px;
  color: rgba(255,255,255,0.75);
  word-break: break-all;
  flex: 1;
  letter-spacing: 0.01em;
}

.copy-btn {
  font-size: 12px;
  font-weight: 600;
  color: var(--color1);
  background: var(--secondary-gradient-background-color2);
  border: 1px solid var(--color2);
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s;
}

.copy-btn.copied {
  color: #fff;
  background: rgba(1,215,150,0.2);
  border-color: var(--color1);
}

.address-warning {
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--border-strong);
  font-weight: 400;
}

.address-warning strong { color: rgba(255,255,255,0.45); font-weight: 600; }

/* LOCKED CARD */
.locked-card {
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 14px;
  padding: 36px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.lock-icon { font-size: 28px; opacity: 0.4; }

.locked-card p {
  font-size: 14px;
  color: rgba(255,255,255,0.3);
  font-weight: 300;
}

/* FORM */
.upload-form { display: flex; flex-direction: column; gap: 18px; }

 
.form-group { display: flex; flex-direction: column; gap: 8px; }

.form-group label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--border-strong);
}

.form-group input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  color: #fff;
  font-weight: 400;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
}

.form-group input[readonly] {
  color: var(--color1);
  cursor: default;
}

.form-group input:focus { border-color: var(--color2); }
.form-group input::placeholder { color: rgba(255,255,255,0.2); }

.amount-wrap { position: relative; }
.amount-wrap input { padding-right: 56px; }

.amount-ticker {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 600;
  color: var(--color1);
  letter-spacing: 0.06em;
  pointer-events: none;
}

/* DROP ZONE */
.drop-zone {
  background: var(--surface);
  border: 1.5px dashed var(--border-strong);
  border-radius: 12px;
  padding: 36px 24px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;
}

.drop-zone:hover,
.drop-zone.is-over {
  border-color: var(--color2);
  background: var(--secondary-gradient-background-color2);
}

.drop-zone.is-filled {
  border-style: solid;
  border-color: var(--color2);
  padding: 18px 24px;
  text-align: left;
}

.drop-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; }

.drop-icon-wrap {
  width: 44px;
  height: 44px;
  background: var(--border);
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-arrow { font-size: 20px; color: var(--color1); }

.drop-empty p { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.45); }

.drop-hint { font-size: 12px; color: var(--border-strong); font-weight: 300; }

.drop-filled { display: flex; align-items: center; gap: 14px; }

.file-type-icon { font-size: 26px; }

.file-meta { flex: 1; display: flex; flex-direction: column; gap: 3px; }

.file-name { word-break: break-all; font-size: 14px; font-weight: 500; color: #fff; }

.file-size { font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 300; }

.remove-file {
  font-size: 13px;
  color: var(--border-strong);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s;
}

.remove-file:hover { color: #ff5555; }

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
  .site-header { padding: 14px 18px; }
  .container { padding: 40px 16px 60px; }
  .form-row { grid-template-columns: 1fr; }
  .wallet-top { flex-direction: column; align-items: flex-start; }
  .conversion-row { flex-wrap: wrap; }
  .conversion-rate { margin-left: 0; width: 100%; }
  .site-footer { flex-direction: column; gap: 6px; padding: 18px; }
}
</style>