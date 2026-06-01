<template>

    <div class="page-wrapper">
        <header class="site-header">
        <div class="logo">{{settings_store.settings.website}}</div>
        <div class="header-badge">Customer Support</div>
        </header>

        <div class="container">
        <!-- FORM -->
        <div class="form-card">
            <div class="form-row">
            <div class="form-group">
                <label>Full Name</label>
                <div class="input-wrap" :class="{ focused: focus === 'name', error: errors.name }">
                <span class="input-icon"><font-awesome-icon
                    class="fa-solid fa-user icons"
                    icon="fa-solid fa-user"
                    /></span>
                <input
                    v-model="form.name"
                    type="text"
                    placeholder="John Doe"
                    @focus="focus = 'name'"
                    @blur="focus = ''; validate('name')"
                />
                </div>
                <span class="error-msg" v-if="errors.name">{{ errors.name }}</span>
            </div>

            <div class="form-group">
                <label>Phone Number</label>
                <div class="input-wrap" :class="{ focused: focus === 'phone', error: errors.phone }">
                <span class="input-icon"><font-awesome-icon
                    class="fa-solid fa-phone icons"
                    icon="fa-solid fa-phone"
                    /></span>
                <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    @focus="focus = 'phone'"
                    @blur="focus = ''; validate('phone')"
                />
                </div>
                <span class="error-msg" v-if="errors.phone">{{ errors.phone }}</span>
            </div>
            </div>

            <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrap" :class="{ focused: focus === 'email', error: errors.email }">
                <span class="input-icon"><font-awesome-icon
                    class="fa-solid fa-envelope icons"
                    icon="fa-solid fa-envelope"
                    /></span>
                <input
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                @focus="focus = 'email'"
                @blur="focus = ''; validate('email')"
                />
            </div>
            <span class="error-msg" v-if="errors.email">{{ errors.email }}</span>
            </div>

            <div class="form-group">
            <label>Message</label>
            <div class="input-wrap textarea-wrap" :class="{ focused: focus === 'message', error: errors.message }">
                <textarea
                v-model="form.message"
                rows="5"
                placeholder="Describe your issue or question..."
                @focus="focus = 'message'"
                @blur="focus = ''; validate('message')"
                ></textarea>
            </div>
            <div class="char-count" :class="{ warn: form.message.length > 450 }">
                {{ form.message.length }} / 500
            </div>
            <span class="error-msg" v-if="errors.message">{{ errors.message }}</span>
            </div>

            <button class="submit-btn" @click="submitForm">
              Send Message
            </button>
        </div>

        </div>

  </div>
</template>

<script setup>

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import API from "../api/index";
import { useInteractiveStore } from '@/stores/interactive'
import { useSettingsStore } from '@/stores/settings'

const settings_store = useSettingsStore()
const interactive_store = useInteractiveStore()

const focus = ref('')

const form = reactive({
  name: '',
  phone: '',
  email: '',
  message: '',
})

const errors = reactive({
  name: '',
  phone: '',
  email: '',
  message: '',
})

const validate = (field) => {
  errors[field] = ''
  if (field === 'name' && !form.name.trim())
    errors.name = 'Full name is required.'
  if (field === 'phone' && !form.phone.trim())
    errors.phone = 'Phone number is required.'
  if (field === 'email') {
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Enter a valid email address.'
  }
  if (field === 'message') {
    if (!form.message.trim()) errors.message = 'Please enter your message.'
    else if (form.message.length > 500) errors.message = 'Message cannot exceed 500 characters.'
  }
}

async function submitForm () {

  try {
  
  ['name', 'phone', 'email', 'message'].forEach(validate)
  
  const hasErrors = Object.values(errors).some(e => e)
  
  if (hasErrors) {

    interactive_store.backend_message = response.message
  
    interactive_store.display_success_alert_box(true)

    return

  }  

  interactive_store.toggle_loading_overlay(true)

  const response = await API.contact_us(form);

  interactive_store.backend_message = response.message

  interactive_store.display_success_alert_box(true)

  clear_fields()
  
 } catch (error) {
    
    console.log(error)

 }

 interactive_store.toggle_loading_overlay(false)

}


function clear_fields() {
    form.email = ""
    form.phone = ""
    form.name = ""
    form.message = ""
}
</script>

<style scoped>
.events-page {
  background: #0a1f10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
}

/* ── Main layout ── */
.main-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 0;
}

.page-wrapper {
  width: 100%;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  --surface: rgba(255, 255, 255, 0.05);
}

/* HEADER */
.site-header {
  padding: 18px 40px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--secondary-gradient-background-color2);
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
  max-width: 620px;
  margin: 0 auto;
  padding: 56px 24px 80px;
  flex: 1;
  width: 100%;
}

 
/* FORM CARD */
.form-card {
  background: var( --secondary-gradient-background-color2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(247, 245, 245, 0.603);
}

/* INPUT */
.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 14px;
  transition: border-color 0.2s;
}

.input-wrap.focused { border-color: var(--color2); }
.input-wrap.error   { border-color: rgba(255, 80, 80, 0.5); }

.input-icon {
  font-size: 15px;
  flex-shrink: 0;
  opacity: 0.45;
  line-height: 1;
}

.input-wrap input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
  padding: 13px 0;
  width: 100%;
}

.input-wrap input::placeholder { color: rgba(255, 255, 255, 0.2); }

/* TEXTAREA */
.textarea-wrap {
  align-items: flex-start;
  padding: 14px;
}

.textarea-wrap textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
  resize: none;
  width: 100%;
  line-height: 1.7;
  font-family: var(--font-family);
}

.textarea-wrap textarea::placeholder { color: rgba(255, 255, 255, 0.2); }

.char-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  text-align: right;
  font-weight: 300;
}

.char-count.warn { color: rgba(255, 160, 60, 0.8); }

/* ERROR */
.error-msg {
  font-size: 12px;
  color: rgba(255, 90, 90, 0.9);
  font-weight: 400;
}

/* SUBMIT */
.submit-btn {
  width: 100%;
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
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.85;
  cursor: default;
  transform: none;
}

.success-text { color: #002a1c; }

/* FOOTER */
.site-footer {
  padding: 20px 40px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
}

.footer-logo {
  font-size: 15px;
  font-weight: 700;
  color: var(--color1);
}

.footer-note {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.18);
  font-weight: 300;
}

/* RESPONSIVE */
@media (max-width: 560px) {
  .site-header  { padding: 14px 18px; }
  .container    { padding: 40px 16px 60px; }
  .form-row     { grid-template-columns: 1fr; }
  .contact-strip { grid-template-columns: 1fr; }
  .form-card    { padding: 24px 18px; }
  .site-footer  { flex-direction: column; gap: 6px; padding: 18px; }
}
</style>