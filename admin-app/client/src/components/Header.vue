<template>

<header class = "header">
    <div class = "hamburger_account">
      <font-awesome-icon class="fa-solid fa-navicon" :style = "interactive_store.open_hamburger_css" id = "open_hamburger" @click = "interactive_store.Open_Sidebar" icon="fa-solid fa-navicon"/> 
      <font-awesome-icon class="fa-solid fa-xmark" :style = "interactive_store.close_hamburger_css" id = "close_hamburger"  @click = "interactive_store.Close_Sidebar" icon="fa-solid fa-xmark"/> 
      <SEARCHBOX :page_name = page_name :searchbox_placeholder = searchbox_placeholder />
    </div>
</header>
</template>


<script setup>

import { ref, watch, toRefs } from 'vue'

import { useInteractiveStore } from '@/stores/interactive'

const interactive_store = useInteractiveStore()

import SEARCHBOX from '../components/SearchBox.vue';


const props = defineProps({

   searchbox_placeholder: String,

   page_name: String

})

const { searchbox_placeholder, page_name } = toRefs(props)

</script>


<style scoped>
/* MOBILE VIEW */
@media only screen and (max-width: 992px) {
.header {
    width: 100%;
    margin: 0;
    position: relative;
    background-color: white;
    padding: 0px 0px;
    box-sizing: border-box;
}
div.hamburger_account {
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
div.hamburger_account h1{
    margin: 0;
    display: inline-block;
    font-size: 18px;
    vertical-align: middle;
    color: white;
    font-weight: lighter;
}
div.hamburger_account #close_hamburger{
    display: none;
    font-size: 22px;
    margin-right: 10px;
    color: gray;
}
div.hamburger_account #open_hamburger{
    display: inline-block;
    font-size: 22px;
    margin-right: 10px;
    color: gray;
}
}
/* MOBILE VIEW */


/*DESKTOP VIEW*/
@media only screen and (min-width: 992px) {
    .header {
        width: 100%;
        margin: 0;
        background-color: white;
        padding: 0px 0px;
        box-sizing: border-box;
    }
    div.hamburger_account {
        margin: 0;
        display: flex;
        align-items: center;
    }
    div.hamburger_account h1{
        margin: 0;
        display: inline-block;
        font-size: 18px;
        vertical-align: middle;
        color: white;
        font-weight: lighter;
    }
    div.hamburger_account #open_hamburger{
        display: none;
        font-size: 22px;
        margin-right: 10px;
        color: gray;
    }
    div.hamburger_account #close_hamburger{
        display: none;
        font-size: 22px;
        margin-right: 10px;
        color: gray;
    }
}
/*DESKTOP VIEW*/
 </style>