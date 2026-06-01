<template>

 <div>

   <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>

   <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>

   <LoadingOverlay/>

   <div class = "container">

    <h1>Admin Registeration</h1>

    <form>

        <div>
        <label for = "email">Email</label>
        <input type="email" v-model = "formvalues.email">
        <p class = "err">{{formvalues_err.email_err}}</p>
        </div>
         
        <div>
        <label for = "phone">Phone</label>
        <input type="text" v-model = "formvalues.phone">
        <p class = "err">{{formvalues_err.phone_err}}</p>
        </div>


        <div>
        <label for = "password">Password</label>
        <input type="password" v-model = "formvalues.password" name="password" id="password" placeholder="Password">
        <p class = "err">{{formvalues_err.password_err}}</p>
        </div>

        <button @click.prevent = "validation" type="submit" id="signupbtn" :disabled = "disablebtn"><font-awesome-icon v-if = "spinner"  class="fa-solid fa-spinner fa-spin" id = "spinner" icon="fa-solid fa-spinner"/> Register</button>

    </form>
    
    <div class = "other_form_info">
        <p>Already have an account? <router-link to = "/login" class = "link">Login</router-link></p>
    </div>

   </div>

 </div>
</template>

<script setup>
import SUCCESSALERTBOX from "@/components/alert_box/success.vue";
import ERRORALERTBOX from "@/components/alert_box/error.vue";
import LoadingOverlay from "../components/modals/loading_overlay.vue";
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch} from 'vue'
import MIDDLEWARES from "../middlewares/middlewares"
import API from "../api/index";
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useInteractiveStore } from '@/stores/interactive'

const admin_store = useAdminStore()
const interactive_store = useInteractiveStore()
 

const route = useRoute()
const router = useRouter()

let formvalues = reactive({
    phone: "",
    email: "",
    password: ""
})

let formvalues_err = reactive({
    phone_err: "",
    email_err: "",
    password_err: ""
})


if (admin_store.isAuthenticated) { //if user no get session redirect to login

    router.push({ name: "/login" })

}


/* Hooks */

onUpdated(() => {

    phonevalidated()

    emailvalidated()

    passwordvalidated()

})


onMounted(() => {

    MIDDLEWARES.allowScroll()
    
})


onUpdated(() => {

    MIDDLEWARES.allowScroll()
    
})

/* Hook */

function phonevalidated() {
    
    let pattern = /^[0-9]*$/
    
    let phone_length = formvalues.phone.length;
    
    if (formvalues.phone === "") {
    
       formvalues_err.phone_err = "Please fill field";
    
    } else if (pattern.test(formvalues.phone) === false) {
    
       formvalues_err.phone_err = "Invalid phone number";
    
    } else if (phone_length > 11) {
    
       formvalues_err.phone_err = "Cannot be 12 digits long"
    
    } else {
    
       formvalues_err.phone_err = ""
       
       return true;
    
    }
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


async function validation() {
          
    if (phonevalidated() && emailvalidated() && passwordvalidated()) {

    interactive_store.toggle_loading_overlay(true)
   
    try {
        
    const response = await API.register(formvalues);

    interactive_store.toggle_loading_overlay(false)

    return router.push({ name: "login"})
    
    } catch (error) {

     console.log(error.message)
  
    }

    interactive_store.toggle_loading_overlay(false)
 
 }

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
      margin: 60px auto;
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
      margin: 60px auto;
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
</style>