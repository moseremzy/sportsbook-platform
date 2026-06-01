<template>

  <div id="body">
 
  <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>

  <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>

  <LoadingOverlay/>

  <div class="create_pass_form">
  <h1>Create New Password</h1>
   
  <form>
  <input type="password" v-model = "formvalues.password" name="email" id="email" placeholder="New Password">
  <small class="err">{{formvalues_err.password_err}}</small>
  <input type="password" v-model = "formvalues.new_password" name="email" id="email" placeholder="Confirm Password">
  <small class="err">{{formvalues_err.new_password_err}}</small>
  <button type="submit" @click.prevent = "ResetPassword" id="loginbtn" :disabled = "disablebtn"><font-awesome-icon v-if = "spinner"  class="fa-solid fa-spinner fa-spin" id = "spinner" icon="fa-solid fa-spinner"/> Submit</button>
  </form>
  </div>
  </div>
</template>

<script setup>
import API from '../api/index'
import { useRoute, useRouter } from 'vue-router'
import LoadingOverlay from "../components/modals/loading_overlay.vue";
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch} from 'vue'
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'


const admin_store = useAdminStore()
const interactive_store = useInteractiveStore()

const route = useRoute()
const router = useRouter()

    let formvalues = reactive({
        password: "", 
        new_password: "",
        token: route.params.id
    })

    let formvalues_err = reactive({
        password_err: "",
        new_password_err: ""
    })

    formvalues.token = route.params.id
 
         
  
/* Hooks */

onUpdated(() => {

    passwordvalidated()
            
    confirm_passwordvalidated()
    
})



/* Hooks */   
  
 
   function passwordvalidated() {

        let pass_length = formvalues.password.length;

        if (formvalues.password === "") {
        
            formvalues_err.password_err = "Please fill field";
        
        } else if (pass_length < 7 || pass_length > 15) {
        
            formvalues_err.password_err = "Must be between 7 and 15 characters long"
        
        } else {
        
            formvalues_err.password_err = ""
        
            return true; 
        
        }
    }

   function confirm_passwordvalidated() {

        if (formvalues.new_password === formvalues.password) {

            formvalues_err.new_password_err = ""
            
            return true
        
        } else {
            
            formvalues_err.new_password_err = "Must match password"
        
        }

    }

    async function ResetPassword() {
        
        if (passwordvalidated() && confirm_passwordvalidated()) {
            
          interactive_store.toggle_loading_overlay(true)

          try {

            const response = await API.reset_password(formvalues);

            interactive_store.backend_message = "Password Reset Successful"
        
            interactive_store.display_success_alert_box()
            
            router.push({name: "login"})

           } catch (error) {
                
            console.log(error)

           }
        
        }

        interactive_store.toggle_loading_overlay(false)
    }
      
      
</script>

<style scoped>

@media only screen and (min-width: 612px) {
    div#body {
        font-family: 'Roboto Slab';
    }

    div.create_pass_form {
        margin: 100px auto 80px auto;
        width: 400px;
        background-color: #fff;
        border-radius: 7px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,.2),0 6px 20px 0 rgba(0,0,0,.19)
    }

    div.create_pass_form h1 {
        font-size: 18px
    }

    div.create_pass_form p {
        font-size: 16px;
        color: #575555
    }

    div.validation_msg {
        display: block;
        box-sizing: border-box;
        width: 300px;
        margin: auto;
        padding: 3px;
        color: #fff;
        font-weight: 700;
        background-color: #b93c3c;
        border: 1px solid #d64545;
        border-radius: 3px
    }

    p#validation_msg {
        transition: 1s;
        font-size: 12px;
        color: #fff;
        margin: 0
    }

    div.create_pass_form input {
        border-radius: 7px;
        border: 1px solid rgba(105,127,128,.884);
        padding: 6px 4px;
        display: block;
        margin: 16px auto 0 auto;
        width: 95%;
        box-sizing: border-box;
        font-size: 15px;
        font-family: Cambria,Cochin,Georgia,Times,Times New Roman,serif
    }

    #spinner {
        color: gray
    }

    div.create_pass_form button[type=submit] {
        background-color: rgb(70, 165, 70);
        color: #fff;
        border-radius: 7px;
        border: 1px solid rgba(105,127,128,.884);
        padding: 6px 4px;
        display: block;
        margin: 16px auto 17px auto;
        width: 95%;
        box-sizing: border-box;
        font-size: 14px;
        font-family: Cambria,Cochin,Georgia,Times,Times New Roman,serif
    }

    div.create_pass_form input:hover {
        border: 1px solid rgba(10,142,146,.884);
        cursor: pointer
    }

    div.create_pass_form input:focus {
        outline: 1px solid rgba(10,142,146,.884)
    }

    div.create_pass_form button[type=submit]:hover {
        opacity: .9;
        border: 1px solid rgb(70, 165, 70);
        cursor: pointer
    }

    div.create_pass_form button[type=submit]:disabled {
        cursor: none;
        opacity: .4
    }

    div.create_pass_form a {
        color: rgba(10,142,146,.884);
        font-size: 13px
    }

    div.create_pass_form #dont_h_acct {
        font-size: 13px;
        text-align: center
    }

    small {
        color: red;
        margin: 2px 0 0 0;
        font-size: 11px
    }
}

@media only screen and (max-width: 612px) {
    div#body {
        font-family: 'Roboto Slab';
    }

    div.create_pass_form {
        margin: 100px auto 80px auto;
        width: 80%;
        background-color: #fff;
        border-radius: 7px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,.2),0 6px 20px 0 rgba(0,0,0,.19)
    }

    div.create_pass_form h1 {
        font-size: 17px
    }

    div.create_pass_form p {
        font-size: 15px;
        color: #575555
    }

    div.validation_msg {
        display: block;
        box-sizing: border-box;
        width: 70%;
        margin: auto;
        padding: 3px;
        color: #fff;
        font-weight: 700;
        background-color: #b93c3c;
        border: 1px solid #d64545;
        border-radius: 3px
    }

    p#validation_msg {
        transition: 1s;
        font-size: 14px;
        color: #fff;
        margin: 0
    }

    div.create_pass_form input {
        border-radius: 7px;
        border: 1px solid rgba(105,127,128,.884);
        padding: 6px 4px;
        display: block;
        margin: 16px auto 0 auto;
        width: 95%;
        box-sizing: border-box;
        font-size: 15px;
        font-family: Cambria,Cochin,Georgia,Times,Times New Roman,serif
    }

    #spinner {
        color: gray
    }

    div.create_pass_form button[type=submit] {
        background-color: rgb(70, 165, 70);
        color: #fff;
        border-radius: 7px;
        border: 1px solid rgba(105,127,128,.884);
        padding: 6px 4px;
        display: block;
        margin: 16px auto 17px auto;
        width: 95%;
        box-sizing: border-box;
        font-size: 14px;
        font-family: Cambria,Cochin,Georgia,Times,Times New Roman,serif
    }

    div.create_pass_form input:hover {
        border: 1px solid rgba(10,142,146,.884);
        cursor: pointer
    }

    div.create_pass_form input:focus {
        outline: 1px solid rgba(10,142,146,.884)
    }

    div.create_pass_form button[type=submit]:hover {
        opacity: .9;
        border: 1px solid rgb(70, 165, 70);
        cursor: pointer
    }

    div.create_pass_form button[type=submit]:disabled {
        cursor: none;
        opacity: .4
    }

    div.create_pass_form a {
        color: rgba(10,142,146,.884);
        font-size: 13px
    }

    div.create_pass_form #dont_h_acct {
        font-size: 13px;
        text-align: center
    }

    small {
        color: red;
        margin: 0 0 0 0;
        font-size: 11px
    }
}

</style>