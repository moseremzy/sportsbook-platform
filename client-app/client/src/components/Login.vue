<template>
<form class="auth-form" @submit.prevent="validation">

<div class="input-group">
    <font-awesome-icon
    class="fa-solid fa-envelope icons"
    @click="interactive_store.toggle_main_nav(true)"
    icon="fa-solid fa-envelope"
    />
    <input type="email" v-model = "formvalues.email" placeholder="Email" required />
    <p class="err">{{formvalues_err.email_err}}</p>
</div>

<div class="input-group">
     <font-awesome-icon
    class="fa-solid fa-lock icons"
    @click="interactive_store.toggle_main_nav(true)"
    icon="fa-solid fa-lock"
    />
    <input type="password" v-model = "formvalues.password" placeholder="Password" required />
    <p class="err">{{formvalues_err.password_err}}</p>
</div>

<div class="forgot-wrap">
  <router-link to="/forgot-password" class="forgot-link">
    Forgot your password?
  </router-link>
</div>

<button type="submit" class="submit-btn">
    Sign In
</button>
</form>
</template>


<script setup>
import { onMounted, onUnmounted, onUpdated, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API from "../api/index.js";
import { useInteractiveStore } from '@/stores/interactive'
import { useUserStore } from '@/stores/user'
const interactive_store = useInteractiveStore()
const user_store = useUserStore()
 
const route = useRoute()
const router = useRouter()
        
let formvalues = reactive({
    email: "",
    password: ""
})

let formvalues_err = reactive({
    email_err: "",
    password_err: ""
})


/* Hooks */

onUpdated(() => {
    emailvalidated()
    passwordvalidated()
})

/* Hooks */  


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
  
  if (formvalues.password !== "") {

      formvalues_err.password_err = ""
      
      return true
    
    } else {
    
      formvalues_err.password_err = "Please fill field"
      
      return false
    
}

}


async function validation() {
    
    if (emailvalidated() && passwordvalidated()) {

    interactive_store.toggle_loading_overlay(true)

    try { //if success
      
    const response = await API.login(formvalues);
  
    user_store.logged_In(response.user, response.isAuthenticated)

    interactive_store.backend_message = `Welcome ${response.user.fullname}`

    interactive_store.display_success_alert_box()

    if (interactive_store.page_to_go) {

      return window.location.replace(`/account/${interactive_store.page_to_go}`)
    
    }

    router.push({name: 'home'})

    } catch (error) {

    console.log(error)
     
    }
  }
  interactive_store.toggle_loading_overlay(false)
}
</script>


<style scoped>
/* Input Fields */
.input-group {
  display: flex;
  align-items: center;
  background: rgb(197, 196, 196);
  border-radius: 8px;
  margin-bottom: 14px;
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
  color: red;
  margin: 2px 0 0 0;
  font-size: 11px
}

/* Forgot Password */
.forgot-wrap {
  text-align: right;
  margin: 5px 0 10px;
}

.forgot-link {
  font-size: 12px;
  color: #9ca3af; /* soft grey */
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #fff; /* bright on hover */
  text-decoration: underline;
}


</style>

