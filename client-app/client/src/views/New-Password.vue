<template>
<div class = "auth-box">
<h1>Create New Password</h1> 
<form class="auth-form" @submit.prevent="validation">
<div class="input-group">
    <input type="password" v-model = "form.password" placeholder="New Password" required />
    <p class="err">{{error.password}}</p>
</div>

<div class="input-group">
    <input type="password" v-model = "form.new_password" placeholder="Confirm Password" required />
    <p class="err">{{error.new_password}}</p>
</div>
 
<button type="submit" @click="ResetPassword" class="submit-btn">
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
 
let form = reactive({
    password: "", 
    new_password: "",
    token: route.params.id
})

let error = reactive({
    password: "",
    new_password: ""
})


form.token = route.params.id


if (user_store.isAuthenticated) { //if user no get session redirect to login

    router.push({ name: "home" })

}




/* Hooks */

onUpdated(() => {

    passwordvalidated()
            
    newpasswordvalidated()
    
})

/* hook */

   function passwordvalidated() {

        let pass_length = form.password.length;

        if (form.password === "") {
        
            error.password = "Please fill field";
        
        } else if (pass_length < 7 || pass_length > 15) {
        
            error.password = "Must be between 7 and 15 characters long"
        
        } else {
        
            error.password = ""
        
            return true; 
        
        }
    }

   function newpasswordvalidated() {

        if (form.new_password === form.password) {

            error.new_password = ""
            
            return true
        
        } else {
            
            error.new_password = "Must match password"
        
        }

    }

    async function ResetPassword() {
        
        if (passwordvalidated() && newpasswordvalidated()) {
            
          interactive_store.toggle_loading_overlay(true)

          try {

            const response = await API.reset_password(form);

            interactive_store.backend_message = "Password Reset Successful"
        
            interactive_store.display_success_alert_box()
            
            router.push({name: "sign-in"})

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

