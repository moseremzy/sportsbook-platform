<template>
  
  <div>

  <font-awesome-icon class="fa-solid fa-search" id = "search_icon" icon="fa-solid fa-search"/>
 
  <input type="text" 
  :maxlength="page_name == 'orders' ? '11' : '70'"
  :disabled = disable v-model = "interactive_store.query" 
  :placeholder = searchbox_placeholder name = "search_box" 
  id = "search_box"
  />

  <font-awesome-icon class="fa-solid fa-xmark" @click = "clearSearch" id = "xmark" icon="fa-solid fa-xmark"/>      

  </div>

</template>

<script setup>

import { ref, watch, toRefs, computed} from 'vue'

import { useInteractiveStore } from '../stores/interactive'

const props = defineProps({

   searchbox_placeholder: String,

   page_name: String,

})

const interactive_store = useInteractiveStore()

const { searchbox_placeholder, page_name } = toRefs(props)

const disable = computed(() => { //ensures not all search box in all pages are active
      
      switch (page_name.value) {

          case "dashboard":
              
              return true

              break;

          case "order":
              
              return false

              break;

          case "edit-item":
              
              return true

              break;

          case "add-item":
              
              return true

              break;
      }
});


//clear search
function clearSearch() {

    interactive_store.clearQuery();

    interactive_store.query = ""
    
}

</script>

<style scoped>
/* MOBILE DEVICES */
@media only screen and (max-width: 765px) {

    * {
        margin: 0;
        padding: 0;
        font-family: 'Nuosu SIL';
    }

    div {
        width: 90%;
        position: relative;
        margin: 13px auto 18px auto;
        font-size: 18px;
    }

    div #search_icon {
        position: absolute;
        top: 16px;
        left: 20px;
    }

    div #xmark {
    position: absolute;
    top: 16px;
    cursor: pointer;
    right: 20px;
   }

    div #search_box {
        border: 0;
        font-size: 16px;
        display: block;
        width: 100%;
        word-break: break-all;
        padding: 15px 0px 15px 60px;
        box-sizing: border-box;
        border-radius: 12px;
        background-color: #D9D9D9;
    }

    input:invalid {
     border: 1px solid red;
    }

    div #search_box:active {
        background-color: white;
        outline: 1px solid rgb(129, 9, 9);
    }

    div #search_box:focus {
        outline: 1px solid rgb(90, 6, 6);
        background-color: white;
    }

}


/* DESKTOP DEVICES */
@media only screen and (min-width: 765px) {
   * {
        margin: 0;
        padding: 0;
        font-family: 'Nuosu SIL';
    }

    div {
        width: 100%;
        position: relative;
        margin: 13px auto 18px auto;
        font-size: 18px;
    }

    div #search_icon {
        position: absolute;
        top: 16px;
        left: 20px;
    }

    div #xmark {
        position: absolute;
        top: 16px;
        cursor: pointer;
        right: 20px;
   }

    div #search_box {
        border: 0;
        font-size: 16px;
        display: block;
        width: 100%;
        word-break: break-all;
        padding: 15px 0px 15px 60px;
        box-sizing: border-box;
        border-radius: 12px;
        background-color: #D9D9D9;
    }

    div #search_box:active {
        background-color: white;
        outline: 1px solid rgb(129, 9, 9);
    }

    div #search_box:focus {
        outline: 1px solid rgb(90, 6, 6);
        background-color: white;
    }

}
</style>