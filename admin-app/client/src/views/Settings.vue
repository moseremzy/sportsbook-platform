<template>
  <div class="container" :style="interactive_store.container_css">

    <OVERLAY />

    <SUCCESSALERTBOX>{{ interactive_store.backend_message }}</SUCCESSALERTBOX>

    <ERRORALERTBOX>{{ interactive_store.backend_message }}</ERRORALERTBOX>

    <!-- Side bar -->
    <SIDEBAR />

    <div class="sub_container" :style="interactive_store.sub_container_css">
       
      <HEADER page_name="dashboard" />

      <h1>Account Settings</h1>

      <div class = "grid">

       <div class="edit-details-form-container">
        <h2 class="form-title">Edit Details</h2>
        <form class="edit-details-form grid-form">
            
            <div class="form-group">
            <label for = "email" class = "form-label">Email</label>
            <input type="email" placeholder="Email" v-model = "admin_info.email"  id = "email" class="form-input" readonly>
            <p class="err">{{ admin_info_error.email_err }}</p>
            </div>

            <div class="form-group">
            <label for = "phone" class = "form-label">Phone</label>
            <input type="text" placeholder="Phone No" v-model = "admin_info.phone" id = "phone" class="form-input">
            <p class="err">{{ admin_info_error.phone_err }}</p>
            </div>
            <!-- Submit Button -->
            <div class="form-group grid-full">
                <button type="submit" @click.prevent = "update_admin_info" class="submit-button">Submit</button>
            </div>
            </form>
            </div>


           <!-- EDIT CRYPTO INFO -->
            <div class="edit-details-form-container" v-if = "admin_store.authorized(['super_admin'])">
            <h2 class="form-title">Edit Crypto Info</h2>
            <form class="edit-details-form grid-form">
            
            <div class="form-group grid-full">
            <label for = "eth_address" class = "form-label">ETH Address</label>
            <input type="text" placeholder="ETH Wallet Address" id="eth_address" v-model="crypto_info.eth" class="form-input">
            <p class="err">{{ crypto_info_error.eth_address_err }}</p>
            </div>

            <div class="form-group grid-full">
            <label for = "btc_address" class = "form-label">BTC Address</label>
            <input type="text" placeholder="BTC Wallet Address" id="btc_address" v-model="crypto_info.btc" class="form-input">
            <p class="err">{{ crypto_info_error.btc_address_err }}</p>
            </div>

            <div class="form-group grid-full">
            <label for = "usdt_address" class = "form-label">USDT Address</label>
            <input type="text" placeholder="USDT Wallet Address" v-model="crypto_info.usdt" id="usdt_address" class="form-input">
            <p class="err">{{ crypto_info_error.usdt_address_err }}</p>
            </div>

            <!-- Submit Button -->
            <div class="form-group grid-full">
                <button type="submit" @click.prevent="update_system_info" class="submit-button">Submit</button>
            </div>
            </form>
            </div>



            <!-- EDIT PASSWORD -->
            <div class="edit-details-form-container">
            <h2 class="form-title">Edit Password</h2>
            <form class="edit-details-form grid-form">

            <div class="form-group grid-full">
            <label class = "form-label" for = "old_password">Old Password</label>
            <input class = "form-input" type="text" placeholder="Old Password" v-model = "password.old_password" id = "old_password">
            <p class="err">{{password_error.old_password_err}}</p>
            </div>

            <div class="form-group grid-full">
            <label class = "form-label" for = "password">New Password</label>
            <input class = "form-input" type="password" placeholder="New Password" v-model = "password.new_password" id = "new_password">
            <p class="err">{{password_error.new_password_err}}</p>
            </div>

            <div class="form-group grid-full">
            <label class = "form-label" for = "confirm_password">Confirm Password</label>
            <input class = "form-input" type="password" placeholder="Confirm Password" v-model = "password.confirm_password" id = "confirm_password">
            <p class="err">{{password_error.confirm_password_err}}</p>
            </div>
            
            <!-- Submit Button -->
            <div class="form-group grid-full">
                <button type="submit" @click.prevent = "update_admin_pass" class="submit-button">Submit</button>
            </div>
            </form>
            </div>

      </div> <!-- CLOSE GRID -->
      

    </div> <!-- SUB_CONTAINER -->
  </div> <!-- CONTAINER -->
</template>

<script setup>
import OVERLAY from "../components/modals/loading_overlay.vue";
import { useInteractiveStore } from '@/stores/interactive'
import { useAdminStore } from '@/stores/admin'
import { useSettingStore } from '@/stores/settings'
import HEADER from "../components/Header.vue";
import SIDEBAR from "../components/SideBar.vue"; 
import API from "../api/index"
import { useRoute, useRouter } from 'vue-router'
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch, computed} from 'vue'

const interactive_store = useInteractiveStore()

const admin_store = useAdminStore()

const settings_store = useSettingStore()


const route = useRoute()
const router = useRouter()


let admin_info = reactive({

  ...admin_store.admin,

})
 

let admin_info_error = reactive({
    email_err: "",
    phone_err: ""
})


let crypto_info = reactive({

  ...settings_store.settings

})


let crypto_info_error = reactive({
    eth_address_err: "",
    btc_address_err: "",
    usdt_address_err: "",
})

let password = reactive({
    old_password: "",
    new_password: "",
    confirm_password: ""
})

let password_error = reactive({
    old_password_err: "",
    new_password_err: "",
    confirm_password_err: ""
})


watch( () => admin_store.isAuthenticated,

  (isAuthenticated) => {

    if (!isAuthenticated) {

        interactive_store.backend_message = "session expired"

        interactive_store.display_success_alert_box(true)

        setTimeout(() => {

           router.push({ path: "/login" })
            
        }, 1000);

    }
  }, 
);


// /* Hooks */


onUpdated(() => {

    emailvalidated()
    phonevalidated()

    eth_address_validated()
    btc_address_validated()
    usdt_address_validated()

    old_password_validated()
    new_password_validated()
    confirm_password_validated()

})



function emailvalidated() {
    
    let pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (admin_info.email === "") {
    
       admin_info_error.email_err = "Please fill field";
    
    } else if (pattern.test(admin_info.email) === false) {
       
       admin_info_error.email_err = "Invalid email"
    
    } else {
       
       admin_info_error.email_err = ""
      
       return true;
    
    }
}



function phonevalidated() {
    
    let pattern = /^[0-9]*$/
    
    let phone_length = admin_info.phone.length;
    
    if (admin_info.phone === "") {
    
        admin_info_error.phone_err = "Please fill field";
    
    } else if (pattern.test(admin_info.phone) === false) {
    
        admin_info_error.phone_err = "Invalid phone number";
    
    } else if (phone_length != 11) {
    
        admin_info_error.phone_err = "Invalid phone number"
    
    } else {
        
        admin_info_error.phone_err = ""
        
        return true

    }         
}


function eth_address_validated() {

    if (crypto_info.eth === "" || crypto_info.eth === undefined) {

        crypto_info_error.eth_address_err = "Please fill field"

    } else {

        crypto_info_error.eth_address_err = ""

        return true

    }
}

function btc_address_validated() {

    if (crypto_info.btc === "" || crypto_info.btc === undefined) {

        crypto_info_error.btc_address_err = "Please fill field"

    } else {

        crypto_info_error.btc_address_err = ""

        return true

    }
}

function usdt_address_validated() {

    if (crypto_info.usdt === "" || crypto_info.usdt === undefined) {

        crypto_info_error.usdt_address_err = "Please fill field"

    } else {

        crypto_info_error.usdt_address_err = ""

        return true

    }
}


function old_password_validated() {

    if (password.old_password === "") {
       
       password_error.old_password_err = "Please fill field"
    
    } else {
    
       password_error.old_password_err = ""
    
       return true;
    
    }
}

function new_password_validated() {

    let pass_length = password.new_password.length;
    
    if (password.new_password === "") {
    
      password_error.new_password_err = "Please fill field";
    
    } else if (pass_length < 7 || pass_length > 15) {
    
      password_error.new_password_err = "Must be between 7 and 15 characters long"
    
    } else {
    
      password_error.new_password_err = ""
    
      return true;  
    
    }
}



function confirm_password_validated() {
    
    if (password.confirm_password === "") {
    
      password_error.confirm_password_err = "Please fill field";
    
    } else if (password.confirm_password !== password.new_password) {
    
     password_error.confirm_password_err = "Must match new password"
    
    } else {
     
     password_error.confirm_password_err = ""
     
     return true;
        
    }
}


async function update_admin_info() {

    if (emailvalidated() && phonevalidated()) {

        interactive_store.toggle_loading_overlay(true)

        try {

        const response = await API.update_admin_info(admin_info);

        interactive_store.backend_message = "Your profile was updated succesfully"
        
        interactive_store.display_success_alert_box()
        
        } catch (error) {

          console.log(error)
          
        }  

        interactive_store.toggle_loading_overlay(false)
        
    }  

}


async function update_system_info() {

    if (eth_address_validated() && btc_address_validated() && usdt_address_validated()) {

        interactive_store.toggle_loading_overlay(true)

        try {

        const response = await API.update_system_info(crypto_info);

        interactive_store.backend_message = "Crypto info updated successfully"

        interactive_store.display_success_alert_box()

        } catch (error) {

          console.log(error)

        }

        interactive_store.toggle_loading_overlay(false)

    }

}


async function update_admin_pass() {

    if (old_password_validated() && new_password_validated() && confirm_password_validated()) {

        interactive_store.toggle_loading_overlay(true)

        try {

        const response = await API.update_admin_pass(password);
        
        interactive_store.backend_message = "Password Updated"
        
        interactive_store.display_success_alert_box()

        password.old_password = ""
        
        password.new_password = ""
            
        password.confirm_password = ""

        } catch (error) {
         
         console.log(error)

        }

        interactive_store.toggle_loading_overlay(false)
        
    }  

}

</script>

<style scoped>
/*DESKTOP VIEW*/
@media only screen and (min-width: 992px) {
    body {
        margin: 0;
        padding: 0;
        font-family: "Roboto" ,"Helvetica Neue","Helvetica",Arial,sans-serif;
        background-color: rgb(225, 230, 231);
    }
    div.container {
        display: flex;
        height: 100vh;
        width: 100%;
        margin: 0;
        padding: 0;
    }
    div.sub_container {
        display: block;
        margin:0 0 0 250px;
        height: 100vh;
        padding: 0 15px 50px 15px;
        width: 100%;
        overflow-y: auto;
        width: calc(100% - 250px);
    }
    div.sub_container h1{
        margin: 0px auto 5px auto;
        color: #0E2E45;
        font-size: 35px;
        font-weight: 300;
    }
}
/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
body {
    margin: 0;
    padding: 0;
    font-family: "Roboto" ,"Helvetica Neue","Helvetica",Arial,sans-serif;
    background-color: rgb(225, 230, 231);
}
div.container {
    display: flex;
    height: auto; 
    width: 100%; 
    margin: 0;
    padding: 0;  
}
div.sub_container {
    display: block;
    margin:0;
    padding: 0 15px 50px 15px;
    width: 100%; /*calc(100% - 250px)*/;
}
div.sub_container h1{
    margin: 0px auto 5px auto;
    color: #0E2E45;
    font-size: 3rem;
    font-weight: 300;
}
}

.edit-details-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(145, 138, 138, 0.1);
}

.form-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

.edit-details-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grid-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* Make certain fields span full width */
.grid-full {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 16px;
  font-weight: bold;
  color: #555;
}

.form-input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}

.form-input:focus {
  border-color: #007bff;
  outline: none;
}


.submit-button {
  padding: 12px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0056b3;
}

p.err {
  color: red;
  font-size: 14px;
  margin: 0;
}

/* Mobile fallback */
@media (max-width: 768px) {
  .grid-form {
    grid-template-columns: 1fr;
  }

  .grid-full {
    grid-column: span 1;
  }
}

</style>