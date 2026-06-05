<template>

  <div class="container" :style = "interactive_store.container_css">

    <LoadingOverlay/>

    <SUCCESSALERTBOX>{{interactive_store.backend_message}}</SUCCESSALERTBOX>

    <ERRORALERTBOX>{{interactive_store.backend_message}}</ERRORALERTBOX>

    <SIDEBAR/>

    <CANCELORDERMODAL/>

    <CONFIRMORDERMODAL/>

     <div class="sub_container" :style = "interactive_store.sub_container_css">

      <!--header--> <HEADER page_name = "dashboard" />

        <h1>Dashboard</h1>

         <div class = "grid1">

          <div class = "flex_items" style="background-color:  #835AEE;">
            <router-link to = "/account/countries" style = "text-decoration: none;">
            <p>TOTAL COUNTRIES</p>
            <h1>{{countries_store.total_countries}}</h1>
            <hr>
            <small>All Countries</small>
            </router-link>
          </div>

          <div class = "flex_items" style="background-color: rgb(18, 170, 170);">
            <router-link to = "/account/leagues" style = "text-decoration: none;">
            <p>TOTAL LEAGUES</p>
            <h1>{{leagues_store.total_leagues}}</h1>
            <hr>
            <small>All Leagues</small>
            </router-link>
          </div>
           
          <div class = "flex_items" style="background-color:  rgb(175, 18, 18);">
            <router-link to = "/account/users" style="text-decoration: none;">
            <p>TOTAL USERS</p>
            <h1>{{users_store.total_users}}</h1>
            <hr>
            <small>Users</small>
            </router-link>
          </div> 

          <div class = "flex_items" style="background-color:  rgb(120, 65, 15);">
            <router-link to = "/account/bets" style="text-decoration: none;">
            <p>BETSLIPS</p>
            <h1>...</h1>
            <hr>
            <small>Betslip</small>
            </router-link>
          </div> 


        </div>   <!-- GRID 1 -->


    </div> <!-- SUB_CONTAINER -->

    </div> <!-- CONTAINER -->
    
</template>

<script setup>
import LoadingOverlay from '../components/modals/loading_overlay.vue';
import HEADER from '../components/Header.vue';
import SIDEBAR from '../components/SideBar.vue';
import CANCELORDERMODAL from "@/components/modals/cancel_order_modal.vue";
import CONFIRMORDERMODAL from "@/components/modals/confirm_order_modal.vue";
import { onMounted, onUnmounted, onUpdated, reactive, computed, toRaw, ref, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInteractiveStore } from '@/stores/interactive'
import { useLeaguesStore } from '@/stores/leagues'
import { useAdminStore } from '@/stores/admin'
import { useSportsStore } from '@/stores/sports'
import { useCountriesStore } from '@/stores/countries'
import { useUsersStore } from '@/stores/users'

const interactive_store = useInteractiveStore()
const leagues_store = useLeaguesStore()
const admin_store = useAdminStore()
const sports_store = useSportsStore()
const countries_store = useCountriesStore()
const users_store = useUsersStore()
 
 
const route = useRoute()
const router = useRouter()

 

watch( () => admin_store.isAuthenticated,

  (isAuthenticated) => { //i dey confirm if admin still dey authenticated

    if (!isAuthenticated) {

        interactive_store.backend_message = "session expired"

        interactive_store.display_success_alert_box(true)

        setTimeout(() => {

           router.push({ path: "/login" })
            
        }, 1000);

    }
  }, 
);



function scrollTo() {

    const scroll_to_section = document.querySelectorAll('.scroll_to_section');
    
    if (scroll_to_section.length > 0) {

    scroll_to_section[0].scrollIntoView({

        behavior: 'smooth',

        block: 'start',

    });

  }
}


</script>

<style scoped>
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
    padding: 0 15px 90px 15px;
    width: 100%; /*calc(100% - 250px)*/;
}
div.sub_container h1{
    margin: 0px auto 25px auto;
    color: #0E2E45;
    font-size: 3rem;
    font-weight: 300;
}
div.grid1 {
    width: 100%;
    display: grid;
    box-sizing: border-box;
    margin: 0px auto;
    padding: 0px 0px 10px 0px;
    gap: 13px;
    grid-template-columns: 1fr 1fr;
}
div.flex_items {
    border: 1px solid rgb(192, 189, 189);
    box-shadow: 0 4px 8px 0 rgba(0,0,0,.2),0 6px 20px 0 rgba(0,0,0,.19);
    padding: 10px;
    border-radius: 6px;
    box-sizing: border-box;
}
div.flex_items p {
    font-size: 16px; 
    font-weight: bolder;
    color: white;
}
div.flex_items h1 {
    font-weight: bold;
    font-size: 22px;
    word-wrap: break-word;
    color: white; 
}
div.flex_items hr {
    color: white;
    font-weight: bolder;
    border: 1px solid white;
} 
div.flex_items small {
    font-size: 12px;
    color: #ffffff99;; 
} 
div.grid2 {
    display: block;
}
.category_link {
    color: rgb(83, 82, 82);
    display: inline-block;
    text-decoration: none;
    margin: 18px 17px 10px 0;
    font-size: 18px;
    font-weight: bold;
}
}
/* MOBILE VIEW */




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
        padding: 0 15px 90px 15px;
        width: 100%;
        overflow-y: auto;
        width: calc(100% - 250px);
    }
    div.sub_container h1{
        margin: 0px auto 25px auto;
        color: #0E2E45;
        font-size: 35px;
        font-weight: 300;
    }
    div.grid1 {
        width: 100%;
        display: grid;
        grid-column-start: 1;
        grid-column-end: 3;
        box-sizing: border-box;
        margin: 0px auto 20px auto;
        padding: 0px 0px 0px 0px;
        gap: 10px;
        grid-template-columns: auto auto auto auto;
    }
    div.flex_items {
        background-color: gray;
        padding: 10px;
        border-radius: 6px;
        box-sizing: border-box;
    }
    div.flex_items p {
        font-size: 17px;
        font-weight: bolder; 
        color: white;
    }
    div.flex_items h1 {
        font-weight: bold;
        font-size: 23px;
        color: white; 
    }
    div.flex_items hr {
        color: white;
        font-weight: bolder;
        border: 1px solid white;
    } 
    div.flex_items small {
        font-size: 12px;
        color: #ffffff99;; 
    } 
    div.grid2 {
        display: grid;
        grid-template-columns: 48% 48%;
        column-gap: 20px;
    }
    .category_link {
        color: rgb(83, 82, 82);
        display: inline-block;
        text-decoration: none;
        margin: 18px 20px 10px 0;
        font-size: 20px;
        font-weight: lighter;
    }
}
/*DESKTOP VIEW*/
</style>
