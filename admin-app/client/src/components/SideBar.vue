<template>
<div class = "side_bar" :style = "interactive_store.side_bar_css">
    <h3><font-awesome-icon class="fa-solid fa-user-tie" icon="fa-solid fa-user-tie" id = "user_tie"/> TECH BY CAS </h3>
    <hr>
    <ul>
       <li v-if = "admin_store.authorized(['super_admin', 'editor'])"><router-link exact-active-class = "active-link" to = "/account/dashboard"><font-awesome-icon class="fa-solid fa-user-tie icons" icon="fa-solid fa-gauge"/> Dashboard</router-link></li> 
       <li v-if = "admin_store.authorized(['super_admin'])"><router-link exact-active-class = "active-link" to = "/account/countries"><font-awesome-icon class="fa-solid fa-cart-shopping icons" icon="fa-solid fa-cart-shopping"/> Countries</router-link></li> 
       <li v-if = "admin_store.authorized(['super_admin'])"><router-link exact-active-class = "active-link" to = "/account/leagues"><font-awesome-icon class="fa-solid fa-cart-shopping icons" icon="fa-solid fa-cart-shopping"/> Leagues <strong v-if = "filteredItems > 0" style = "background-color: red; margin-left: 5px; padding: 3px 7px; font-size: 13px; border-radius: 100%;">{{filteredItems}}</strong></router-link></li> 
       <li v-if = "admin_store.authorized(['super_admin'])">
        <router-link exact-active-class="active-link" to="/account/device-records">
            <font-awesome-icon class="icons" icon="fa-solid fa-mobile-screen-button"/>
            Events
        </router-link>
        </li> 
       <!-- <li v-if = "admin_store.authorized(['super_admin','editor'])"><router-link exact-active-class = "active-link" to = "/account/items"><font-awesome-icon class="fa-solid fa-mobile-phone icons" icon="fa-solid fa-mobile-phone"/> Teams</router-link></li>  -->
       <li v-if = "admin_store.authorized(['super_admin'])"><router-link exact-active-class = "active-link" to = "/account/customers"><font-awesome-icon class="fa-solid fa-user icons" icon="fa-solid fa-user"/> Users</router-link></li>
       <li v-if = "admin_store.authorized(['super_admin', 'editor'])"><router-link exact-active-class = "active-link" to = "/account/settings"><font-awesome-icon class="fa-solid fa-user-cog icons" icon="fa-solid fa-user-cog"/>Account Settings</router-link></li> 
       <li @click.prevent = "logout" v-if = "admin_store.isAuthenticated"><router-link to="#" class = "link" style="color: red;"><font-awesome-icon  class="fa-solid fa-sign-out icons" style="color: red;" icon="fa-solid fa-sign-out"/>Log Out</router-link></li>
    </ul>
</div>
</template>

<script setup>

 
import { onMounted, onUnmounted, onUpdated, reactive, computed, toRaw, ref, watch} from 'vue'

 import { useInteractiveStore } from '@/stores/interactive'

 import { useAdminStore } from '@/stores/admin'

 import API from '../api'

 const interactive_store = useInteractiveStore()

 const admin_store = useAdminStore()


// let filteredItems = computed(() => { //search for item

//     return orders_store.orders.filter((order) => {

//     return order.order_status == "pending";

// }).length

// })



 
async function logout() {
    
   const response = await API.logout()

   if (response.message === 'success') {

       admin_store.logged_Out()

       window.location.assign("/login")

   } else { //if theres is error login out

       window.location.assign("/")

   }

}

</script>


<style>  
/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
* {
    margin: 0;
    padding: 0;
    font-family: 'Nuosu SIL' !important;
}
div.side_bar {
    display: none;
    height: 100vmax;
    box-sizing: border-box;
    margin: 0;
    color: white;
    width: 250px;
    font-size: 15px;
    background-color: #1f2429;
    padding: 28px 0px 0px 0px;
}
div.side_bar h3{
    margin: 0 0 0 10px;
    color: white;
    font-size: 14px;
    font-weight: bold;
    text-transform: capitalize;
}
#user_tie{
    font-size: 25px;
    padding: 8px;
    margin-right: 8px;
    background-color: gray;
    border-radius: 50%;
    vertical-align: middle;
}
hr {
    margin-bottom: 10px;
}
ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
}
ul li{
    display: block;
    width: 100%;
    color: white;
    padding: 0px;
}
.icons {
    color: rgb(172, 168, 168);
    font-size: 18px;
    margin-right: 10px;
}
ul li a{
    display: block;
    width: 100%;
    box-sizing: border-box;
    height: 100%;
    color: white;
    font-size: 17px;
    text-decoration: none;
    padding: 12px 0px 12px 20px;
}
ul li a:hover{
    text-decoration: none;
    color: white;
}
.active-link {
    background-color: rgb(0, 102, 255);
    color: white;
    border-radius: 8px;
    transition: background-color 0.3s ease, color 0.3s ease;
}
}
/* MOBILE VIEW */


/*DESKTOP VIEW*/
@media only screen and (min-width: 992px) {
   * {
        margin: 0;
        padding: 0;
        font-family: 'Nuosu SIL' !important;
    }
    div.side_bar {
        display: block;
        position: fixed;
        top:0;
        left: 0;
        height: 100vmax;
        box-sizing: border-box;
        margin: 0;
        color: white;
        width: 250px;
        font-size: 15px;
        background-color: #1f2429;
        padding: 28px 0px 0px 0px;
    }
    div.side_bar h3{
        margin: 0 0 0 10px;
        color: white;
        font-size: 14px;
        font-weight: bold;
        text-transform: capitalize;
    }
     #user_tie{
        font-size: 25px;
        padding: 8px;
        margin-right: 8px;
        background-color: gray;
        border-radius: 50%;
        vertical-align: middle;
   }
    hr {
        margin-bottom: 10px;
    }
    ul {
        margin: 0px 0px 0px 0px;
        padding: 0;
        list-style-type: none;
    }
    ul li{
         display: block;
         width: 100%;
         color: white;
         padding: 0px;
    }
    .icons {
        color: rgb(172, 168, 168);
        font-size: 18px;
        margin-right: 10px;
    }
    ul li a{
        display: block;
        width: 100%;
        box-sizing: border-box;
        height: 100%;
        color: white;
        font-size: 17px;
        text-decoration: none;
        padding: 12px 0px 12px 20px;
    }
    ul li a:hover{
        text-decoration: none;
        color: white;
    }
    .active-link {
        background-color: rgb(0, 102, 255);
        color: white;
        border-radius: 8px;
        transition: background-color 0.3s ease, color 0.3s ease;
}
}
/*DESKTOP VIEW*/
</style>