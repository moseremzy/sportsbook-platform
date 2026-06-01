<template>

 <div>

   <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>

   <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>

   <LoadingOverlay/>

   <div class = "container">

    <h1>Admin Login</h1>

    <form>
            
        <div>
        <label for = "email">Email</label>
        <input type="email" v-model = "formvalues.email">
        <p class="err">{{formvalues_err.email_err}}</p>
        </div>

        <div>
        <label for = "password">Password</label>
        <input type="password" v-model = "formvalues.password">
        <p class="err">{{formvalues_err.password_err}}</p>
        </div>

        <button type="submit" @click.prevent = "validation" id="loginbtn" :disabled = "disablebtn"><font-awesome-icon v-if = "spinner"  class="fa-solid fa-spinner fa-spin" id = "spinner" icon="fa-solid fa-spinner"/> Login</button>

    </form>

    <div class = "other_form_info">
        <p>Dont have an account? <router-link to = "/register" class = "link">Register</router-link></p>
    </div>

   </div>

 </div>
</template>

<script setup>
import SUCCESSALERTBOX from "@/components/alert_box/success.vue";
import ERRORALERTBOX from "@/components/alert_box/error.vue";
import LoadingOverlay from "../components/modals/loading_overlay.vue";
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MIDDLEWARES from "../middlewares/middlewares"
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'
const interactive_store = useInteractiveStore()
const admin_store = useAdminStore()

import API from "../api/index";


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


onMounted(() => {

    MIDDLEWARES.allowScroll()
    
})


onUpdated(() => {

    MIDDLEWARES.allowScroll()
    
})

/*hook */



function emailvalidated() {

    if (formvalues.email !== "") {

        formvalues_err.email_err = ""

        return true;

    } else {
    
        formvalues_err.email_err = "Please fill field"
        
        return false
    
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

    try {

    const response = await API.login(formvalues);

    admin_store.logged_In(response.admin, response.isAuthenticated)

    interactive_store.backend_message = `Welcome ${response.admin.email}`

    interactive_store.display_success_alert_box()

    window.location.replace('/account/dashboard')
        
    } catch (error) {

     console.log(error)
        
    }

  }

  interactive_store.toggle_loading_overlay(false)
  
}



</script>

<style scoped>
/* MOBILE DEVICES */
@media only screen and (max-width: 765px) {
  * {
      font-family: 'Nuosu SIL';
      margin: 0;
      padding: 0;
  }

  div.container {
      width: 90%;
      border-radius: 12px;
      padding: 20px 25px;
      border: 1px solid gray;
      margin: 50px auto;
      box-sizing: border-box;
  }

  div.container h1{
      font-size: 25px;
      margin: 10px 0px 26px 0px;
      color: rgb(59, 59, 59);
  }

  form div {
      margin: 20px 0;
  }

  div label {
      font-size: 16px;
      color: rgb(30, 66, 30);
      display: block;
      margin: 4px 0px;
  }

  form input {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      box-sizing: border-box;
      display: block;
  }

  form input:hover {
     outline: 0;
  }

  form input:focus {
     outline: 0;
  }

  form h3 {
      text-align: center;
      font-size: 15px;
      margin: 0;
      color: rgb(16, 153, 85);
      cursor: pointer;
      text-decoration: underline;
  }

  button {
      display: block;
      width: 50%;
      margin: auto;
      color: white;
      border: 0;
      padding: 10px 0;
      font-size: 16px;
      font-weight: bold;
      background-color: rgb(70, 165, 70);
  }

  button[type=submit]:disabled {
      cursor: none;
      opacity: .4
 }


  div.other_form_info {
      width: 80%;
      margin: 10px auto;
      text-align: center;
  }

   div.other_form_info .link{
     color: rgb(70, 165, 70);
     text-decoration: none;
  }

  p.err {
     color: red;
     font-size: 12px;
  }

}



/* DESKTOP */
@media only screen and (min-width: 600px) {
  * {
      font-family: 'Nuosu SIL';
      margin: 0;
      padding: 0;
  }

  div.container {
      width: 500px;
      border-radius: 12px;
      padding: 20px 25px;
      border: 1px solid gray;
      margin: 50px auto;
      box-sizing: border-box;
  }

  div.container h1{
      font-size: 25px;
      margin: 10px 0px 26px 0px;
      color: rgb(59, 59, 59);
  }

  form div {
      margin: 20px 0;
  }

  div label {
      font-size: 16px;
      color: rgb(30, 66, 30);
      display: block;
      margin: 4px 0px;
  }

  form input {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      box-sizing: border-box;
      display: block;
  }

  form input:hover {
     outline: 0;
  }

  form input:focus {
     outline: 0;
  }

  form h3 {
      text-align: center;
      font-size: 15px;
      margin: 0;
      color: rgb(16, 153, 85);
      cursor: pointer;
      text-decoration: underline;
  }

  button {
      display: block;
      width: 50%;
      margin: auto;
      color: white;
      border: 0;
      padding: 10px 0;
      font-size: 16px;
      font-weight: bold;
      background-color: rgb(70, 165, 70);
  }

  button[type=submit]:disabled {
      cursor: none;
      opacity: .4
   }


  div.other_form_info {
      width: 80%;
      margin: 10px auto;
      text-align: center;
  }

   div.other_form_info .link{
     color: rgb(70, 165, 70);
     text-decoration: none;
  }

  p.err {
     color: red;
     font-size: 12px;
  }
}

.demo_account {
      margin: 10px 0;
}

.demo_account h2{
      font-size: 16px;
}

.demo_account p{
      margin: 10px 0;
}
</style>