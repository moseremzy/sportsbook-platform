<template>

  <div class="page-wrapper">

    <header class="site-header">
      <div class="logo">{{settings_store.settings.website}}</div>
      <div class="header-badge">Account Settings</div>
    </header>

    <div class="container">

      <!-- AVATAR -->
      <div class="avatar-section">
        <div class="avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="account-chip">Account #{{ information.id }}</div>
      </div>

      <!-- PERSONAL DATA -->
      <div class="section-block">
        <h2 class="section-title">Personal data</h2>

        <div class="field-group">
          <div class="input-wrap">
            <input v-model="information.email" type="email" placeholder="Email address" />
          </div>
            <p class = "err">{{information_err.email_err}}</p>
        </div>

         <div class = "field-group">
          <div class="input-wrap phone-wrap">
            <vue-tel-input
              v-model = "information.phone"
              mode="international"
              :default-country="'us'"
              class="phone-input"
              placeholder="Enter your phone number"
              @validate="phonevalidated"
            />
          </div>
          <p class = "err">{{information_err.phone_err}}</p>
        </div>
      </div>
    

      <!-- CHANGE PASSWORD -->
      <div class="section-block">
        <h2 class="section-title">Change password</h2>
        <div class="field-group">
          <div class="input-wrap password-wrap">
            <input v-model="information.old_pass" type="password" placeholder="Old password" />
          </div>
            <p class = "err">{{information_err.old_pass_err}}</p>
        </div>

        <div class = "field-group">
          <div class="input-wrap password-wrap">
            <input v-model="information.new_pass" type="password" placeholder="New password" />
          </div>
          <p class = "err">{{information_err.new_pass_err}}</p>
        </div>

        <div class = "field-group">
          <div class="input-wrap password-wrap">
            <input v-model="information.confirm_pass" type="password" placeholder="Confirm new password" />
          </div>
          <p class = "err">{{information_err.confirm_pass_err}}</p>
        </div>
      </div>

      <!-- SAVE -->
      <button class="save-btn" @click="save_settings">
        Save
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onUpdated, onMounted, onUnmounted } from 'vue'
import 'vue-tel-input/vue-tel-input.css'
import API from '../api/index'
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { VueTelInput } from 'vue-tel-input'
import { useUserStore } from '@/stores/user'
import { useInteractiveStore } from '@/stores/interactive'
import { useSettingsStore } from '@/stores/settings'


const interactive_store = useInteractiveStore()
const user_store = useUserStore()
const settings_store = useSettingsStore()

const information = reactive({
  id: "",
  phone: "",
  email: "",
  old_pass: "",
  new_pass: "",
  confirm_pass: "",
})

let information_err = reactive({
    phone_err: "",
    email_err: "",
    old_pass_err: "",
    new_pass_err: "",
    confirm_pass_err: ""
})


// Initialize from store
watch(() => user_store.user, (newUser) => {
  if (newUser) {
    information.id = newUser.id || ""
    information.phone = newUser.phone || ""
    information.email = newUser.email || ""
  }
}, { immediate: true })


const userInitial = computed(() => user_store.user?.fullname.charAt(0).toUpperCase())

/* Hooks */

onUpdated(() => {

    phonevalidated()

    emailvalidated()

    newpassvalidated()

    confirmpassvalidated()

})

function phonevalidated() {
  if (information.phone === "") {
    information_err.phone_err = "Please fill field"
    return false
  }

  const phoneNumber = parsePhoneNumberFromString(information.phone)
  if (!phoneNumber || !phoneNumber.isValid()) {
    information_err.phone_err = "Invalid phone number format"
    return false
  }

  information_err.phone_err = ""
  return true
}


function emailvalidated() {

    let pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (information.email === "") {
    
       information_err.email_err = "Please fill field";
    
    } else if (pattern.test(information.email) === false) {
       
       information_err.email_err = "Invalid email"
    
    } else {
       
       information_err.email_err = ""
      
       return true;
    
    }
}



function newpassvalidated() {
    
    let pass_length  = information.new_pass.length;
    
    if (pass_length > 0 && pass_length < 7 || pass_length > 15) {
    
        information_err.new_pass_err = "Must be between 7 and 15 characters long"
    
    } else {
        
        information_err.new_pass_err = ""
    
        return true        
   }

}


function confirmpassvalidated() {
    
    if (information.new_pass !== information.confirm_pass) {

        information_err.confirm_pass_err = "Must correspond with password";      
      
    } else {
        
        information_err.confirm_pass_err = ""
    
        return true        
   }

}


async function save_settings() {

    if (phonevalidated() && emailvalidated()) {

      interactive_store.toggle_loading_overlay(true)

      try {

      const response = await API.save_settings(information);

      // ✅ Refresh user data from store
      await user_store.fetch_user()

      interactive_store.backend_message = "Your profile was updated succesfully"
      
      interactive_store.display_success_alert_box()
        
      } catch (error) {

      console.log(error)
        
      }     
        
    }  

    interactive_store.toggle_loading_overlay(false)

}



</script>

<style scoped>

.page-wrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  --surface: rgba(255, 255, 255, 0.05);
  --surface-2: rgba(255, 255, 255, 0.08);
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
  max-width: 460px;
  margin: 40px auto 20px auto;
  padding: 8px 24px 30px;
  background: var( --secondary-gradient-background-color2);
  flex: 1;
  border-radius: 14px;
  border: 1px solid var(--color2);
  width: 100%;
  height: 100%;
}

/* AVATAR */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--color1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  font-weight: 700;
  color: #003122;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 3px solid transparent;
  transition: border-color 0.2s;
}

.avatar:hover {
  border-color: var(--color1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

/* overlay shown on hover */
.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 22px;
  line-height: 1;
}

.avatar-hint {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 300;
  margin-bottom: 8px;
}

.account-chip {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.03em;
  width: 100%;
  text-align: center;
}

/* SECTIONS */
.section-block { margin-bottom: 32px; }

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 14px;
  letter-spacing: -0.01em;
}

/* FIELD GROUP */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* INPUT WRAP */
.input-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  transition: border-color 0.2s;
  position: relative;
}

.input-wrap:focus-within { border-color: var(--color2); }

.input-wrap input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
  padding: 14px 0;
  width: 100%;
}

.input-wrap input::placeholder { color: rgba(255, 255, 255, 0.3); }

/* PHONE — let vue-tel-input fill the wrap */
.phone-wrap {padding: 10px 5px; }

.vue-tel-input {
  width: 100% !important;
  margin: 0;
  border-radius: 5px;
  color: black !important;
}

/* PASSWORD */
.password-wrap { padding-right: 8px; }

/* SAVE */
.save-btn {
  width: 100%;
  background: var(--color1);
  color: #002a1c;
  border: none;
  border-radius: 10px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s, transform 0.15s;
}

.save-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
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
  color: rgba(255,255,255,0.18);
  font-weight: 300;
}

p.err {
  color: rgb(240, 128, 128);
  margin-bottom: 5px;
  font-size: 11px;
  font-weight: bold;
  text-align: left;
  padding-left: 5px;
}

/* RESPONSIVE */
@media (max-width: 520px) {
  .site-header { padding: 14px 18px; }
  .container { padding: 36px 16px 60px; }
  .site-footer { flex-direction: column; gap: 6px; padding: 18px; }
}
</style>