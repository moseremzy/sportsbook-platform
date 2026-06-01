<template>
<div class = "auth-box">
<h1>Forgot Password</h1>
<p>Enter your email and we'll send you a link to reset your password.</p>
<form class="auth-form" @submit.prevent="validation">
<div class="input-group">
    <font-awesome-icon
    class="fa-solid fa-envelope icons"
    icon="fa-solid fa-envelope"
    />
    <input type="email" v-model = "formvalues.email" placeholder="Email" required />
    <p class="err">{{formvalues_err.email_err}}</p>
</div>
 
<button type="submit" @click="SendMail" class="submit-btn">
    Submit
</button>
</form>
</div>
</template>


<script setup>
import API from '../api/index';
import { useRoute, useRouter } from 'vue-router'
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch, nextTick } from 'vue'
import MIDDLEWARES from "../middlewares/middlewares"
import { useUserStore } from '@/stores/user'
import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()
const user_store = useUserStore()


const route = useRoute()
const router = useRouter()
 

let formvalues = reactive({
    email: ""
})

let formvalues_err = reactive({
    email_err: ""
})


if (user_store.isAuthenticated) { //if user no get session redirect to login

    router.push({ name: "home" })

}

     

/* hook */

onUpdated(() => {

   emailvalidated()

})

/* hook */

 
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
                
async function SendMail() {

if (emailvalidated()) {

    interactive_store.toggle_loading_overlay(true)
    
    try {

    const response = await API.send_reset_pass_email(formvalues);

    interactive_store.backend_message = response.message
    
    interactive_store.display_success_alert_box()

    formvalues.email = ""

    } catch (error) {

       console.log(error)
        
    }

  }

  interactive_store.toggle_loading_overlay(false)
    
}

</script>


<style scoped>
.auth-box {
  background: var(--color2);
  color: #fff;
  border-radius: 14px;
  padding: 20px 20px;
  width: 100%;
  margin: 50px auto;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
}

.auth-box h1 {
   margin: 0;
   font-size: 17px;
}

.auth-box p {
    font-size: 15px;
    margin: 5px 0;
}
 
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

