<template>
<form class="auth-form" @submit.prevent="validation">
<div class = "field-group">
    <div class="input-group">
    <font-awesome-icon
    class="fa-solid fa-user icons"
    @click="interactive_store.toggle_main_nav(true)"
    icon="fa-solid fa-user"
    />
    <input type="text" v-model = "formvalues.fullname" placeholder="Full Name" required />
    </div>
    <p class = "err">{{formvalues_err.fullname_err}}</p>
</div>

<div class = "field-group">
    <div class="input-group">
    <font-awesome-icon
    class="fa-solid fa-envelope icons"
    @click="interactive_store.toggle_main_nav(true)"
    icon="fa-solid fa-envelope"
    />
    <input type="email" v-model = "formvalues.email" placeholder="Email" required />
    </div>
    <p class = "err">{{formvalues_err.email_err}}</p>
</div>

<div class = "field-group">
<div class="input-group">
    <font-awesome-icon
        class="fa-solid fa-phone icons"
        @click="interactive_store.toggle_main_nav(true)"
        icon="fa-solid fa-phone"
    />
    <vue-tel-input
        v-model = "formvalues.phone"
        mode="international"
        :default-country="'us'"
        placeholder="Enter your phone number"
        @validate="phonevalidated"
    />
    </div>
    <p class = "err">{{formvalues_err.phone_err}}</p>
</div>

<div class = "field-group">
    <div class="input-group">
    <font-awesome-icon
    class="fa-solid fa-lock icons"
    @click="interactive_store.toggle_main_nav(true)"
    icon="fa-solid fa-lock"
    />
    <input type="password" v-model = "formvalues.password" placeholder="Password" required />
    </div>
    <p class = "err">{{formvalues_err.password_err}}</p>
</div>

<div class = "field-group">
    <div class="input-group">
    <font-awesome-icon
    class="fa-solid fa-lock icons"
    @click="interactive_store.toggle_main_nav(true)"
    icon="fa-solid fa-lock"
    />
    <input type="password" v-model = "formvalues.confirm_password" placeholder="Confirm Password" required />
    </div>
    <p class = "err">{{formvalues_err.confirm_password_err}}</p>
</div>

<div class="checkbox-group">
  <label>
    <input type="checkbox" v-model="formvalues.accept_terms" required />
    I have read and agree to the
    <span class="link-text">Terms & Conditions</span>
  </label>
</div>

<div class="checkbox-group">
  <label>
    <input type="checkbox" v-model="formvalues.is_adult" required />
    I confirm that I am 18 years or older
  </label>
</div>

<button type="submit" class="submit-btn">
    Sign Up
</button>
</form>
</template>


<script setup>
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch} from 'vue'
import MIDDLEWARES from "../middlewares/middlewares"
import API from "../api/index.js";
import 'vue-tel-input/vue-tel-input.css'
import { VueTelInput } from 'vue-tel-input'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useInteractiveStore } from '@/stores/interactive'

const user_store = useUserStore()
const interactive_store = useInteractiveStore()
 

const route = useRoute()
const router = useRouter()


let formvalues = reactive({
    fullname: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    accept_terms: false,
    is_adult: false
})

let formvalues_err = reactive({
    fullname_err: "",
    phone_err: "",
    email_err: "",
    password_err: "",
    confirm_password_err: ""
})


if (user_store.isAuthenticated) { //if user no get session redirect to login

    router.push({ name: "home" })

}



/* Hooks */

onUpdated(() => {

    fullnamevalidated()

    phonevalidated()

    emailvalidated()

    passwordvalidated()

    confirmpasswordvalidated()

})


onMounted(() => {

    MIDDLEWARES.allowScroll()
    
})


onUpdated(() => {

    MIDDLEWARES.allowScroll()
    
})

/* Hook */



function fullnamevalidated() {

    let pattern = /^[A-Za-z ]+$/;

    if (formvalues.fullname === "") {

        formvalues_err.fullname_err = "Please fill field";

    } else if (pattern.test(formvalues.fullname) === false) {

        formvalues_err.fullname_err = "fullname can only contain letters"
    
    } else { 
        
        formvalues_err.fullname_err = ""
    
        return true;
    }
}


function phonevalidated() {
  if (formvalues.phone === "") {
    formvalues_err.phone_err = "Please fill field"
    return false
  }

  const phoneNumber = parsePhoneNumberFromString(formvalues.phone)
  if (!phoneNumber || !phoneNumber.isValid()) {
    formvalues_err.phone_err = "Invalid phone number format"
    return false
  }

  formvalues_err.phone_err = ""
  return true
}


function emailvalidated() {

    let pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (formvalues.email === "") {
    
       formvalues_err.email_err = "Please fill field";
    
    } else if (pattern.test(formvalues.email) === false) {
       
       formvalues_err.email_err = "Invalid email"
    
    } else {
       
       formvalues_err.email_err = ""
      
       return true;
    
    }
}

function passwordvalidated() {
    
    let pass_length  = formvalues.password.length;
    
    if (formvalues.password === "") {
    
        formvalues_err.password_err = "Please fill field";
    
    } else if (pass_length < 7 || pass_length > 15) {
    
        formvalues_err.password_err = "Must be between 7 and 15 characters long"
    
    } else {
        
        formvalues_err.password_err = ""
    
        return true        
   }

}


function confirmpasswordvalidated() {
    
    if (formvalues.password !== formvalues.confirm_password) {

        formvalues_err.confirm_password_err = "Must correspond with password";      
      
    } else {
        
        formvalues_err.confirm_password_err = ""
    
        return true        
   }

}


async function validation() {
          
    if (fullnamevalidated() && phonevalidated() && emailvalidated() && passwordvalidated() && confirmpasswordvalidated()) {

    interactive_store.toggle_loading_overlay(true)
   
    try {

    const data = {
      fullname: formvalues.fullname,
      phone: formvalues.phone,
      email: formvalues.email,
      password: formvalues.confirm_password
    }
        
    const response = await API.register(data); 

    user_store.logged_In(response.user, response.isAuthenticated)
        
    interactive_store.backend_message = `Welcome ${response.user.fullname}`

    interactive_store.display_success_alert_box()

    router.push({name: 'home'})
    
    } catch (error) {

    if (error.response?.data?.message === "email already exists") {

    interactive_store.backend_message = error.response.data.message

    interactive_store.display_error_modal_box(true)
    
    }
  }
 }
    interactive_store.toggle_loading_overlay(false)
}
</script>

<style scoped>
/* Input Fields */
.field-group {
  margin-bottom: 14px;
}

.input-group {
  display: flex;
  align-items: center;
  background: rgb(197, 196, 196);
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid var(--color1);
}

.input-group .icons {
  margin-right: 10px;
  color: #888;
  font-size: 15px;
}
.input-group input {
  background: transparent;
  border: none;
  outline: none;
  color: black;
  width: 100%;
  font-size: 14px;
}

.vue-tel-input {
  display: flex !important;
  width: 95% !important;
  margin: 16px auto 0 auto;
  color: black !important;
}

.checkbox-group {
  margin-top: 10px;
  margin-bottom: 10px;
}

.checkbox-group label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: white;
  line-height: 1.5;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  margin-top: 3px;
  accent-color: var(--color1);
  cursor: pointer;
}

.link-text {
  color: var(--color1);
  font-weight: 600;
  cursor: pointer;
}

.link-text:hover {
  text-decoration: underline;
}

/* Submit Button */
.submit-btn {
  background: var(--color1);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}
.submit-btn:hover {
  background: var(--color1);
}

p.err {
  color: rgb(240, 128, 128);
  margin-top: 5px;
  font-size: 11px;
  font-weight: bold;
  text-align: left;
  padding-left: 5px;
}
</style>

