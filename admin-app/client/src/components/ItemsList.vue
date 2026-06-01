<template>
  <div class="menu-container">
    <!-- <CONFIRMATIONMODAL :item_name = item_name /> -->
    <!-- Category header with horizontal scroll -->
    <div class="categories"> 
        <b
         class="router_link"
         id = "All"
         @click.prevent="overall_func('All')"
         style>
        All
        </b> 

        <b 
         v-for = "category in categories"
         :key="category.id"
         class = "router_link"
         :id = "category.name"
         @click.prevent = "overall_func(category.name)"
         style>
         {{category.name}}
        </b>
    </div>

    <router-link to = "/account/add-item" id = "add-item">Add Item <font-awesome-icon class="fa-solid fa-plus" icon="fa-solid fa-plus"/></router-link>

    <!-- Menu items grid layout -->
    <div class="menu-items" v-if = "currentPageItems.length > 0">
      <div v-for="item in currentPageItems" :key="item.id" class="menu-item">
        <Availability class = "right-badge" :product = item />
        <Status class = "left-badge" :product = item />
        <div class="item-image">
          <img :src="`${item.main_image}`" :alt="item.name" />
        </div>
        <div class="item-details">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-price">{{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.price)}}</p>
          <p class="item-description">{{ item.description.length > 80 
                                        ? item.description.slice(0, 80) + '...' 
                                        : item.description 
                                    }}
          </p>
          <!-- Buttons container -->
          <div class="buttons-container">
            <router-link :to = "'/account/edit-item/'+item.product_id" class="edit-button">Edit</router-link>
          </div>
        </div>
      </div>
    </div>

    <RECORDNOTFOUND v-else>No Items Found</RECORDNOTFOUND>
    <p style = "margin-top: 10px; font-size: 15px;">Showing {{ currentPageItems.length }} of {{ filteredItems.length }}</p>
    <!-- Pagination Component -->
    <Pagination 
      :currentPage="currentPage" 
      :totalPages="totalPages" 
      @update:currentPage="currentPage = $event" 
      v-if = "currentPageItems.length > 0"
    />
  </div>
</template>

<script setup>

import { useRoute, useRouter } from 'vue-router'

import { ref, computed, reactive, onMounted, watch, toRefs } from 'vue';

import RECORDNOTFOUND from '../components/ItemsNotFound.vue'

import CONFIRMATIONMODAL from '../components/modals/ConfirmationModal.vue'

import Availability from '../components/Availability.vue'

import Status from '../components/Status.vue'

import Pagination from './Pagination.vue';  // Import the Pagination component

import { useInteractiveStore } from '@/stores/interactive'

const base_url = process.env.VUE_APP_API_BASE_URL

const route = useRoute()

const router = useRouter()

const interactive_store = useInteractiveStore()

const categories_store = useCategoriesStore()

let tab_clicked = ref("All");

const currentPage = ref(1);

const itemsPerPage = 20; // Set how many items per page

let item_name = ref("")

const props = defineProps({

  products: Object

})

const { products } = toRefs(props)


const categories = computed(() => {

  return categories_store.categories

})



watch( // Reset pagination
  [() => interactive_store.query, () => tab_clicked.value],
  () => {
    currentPage.value = 1; 
  }
);


let filteredItems = computed(() => { //search for item

    return products.value.filter((item) => {

    const matchesCategory = tab_clicked.value === "All" ? item : item.category_name === tab_clicked.value;

    const matchesItem = item.name.toLowerCase().includes(interactive_store.query.toLowerCase());
  
    return matchesCategory && matchesItem;

  })

})



const totalPages = computed(() => { // Computed properties for pagination

   return Math.ceil(filteredItems.value.length / itemsPerPage);

});


// Get items for the current page
const currentPageItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredItems.value.slice(startIndex, endIndex);
});


// Method to update the current page
const updateCurrentPage = (page) => {

  currentPage.value = page;

};


function overall_func(category) {

  tab_clicked.value = category;

  const all_tabs = document.querySelectorAll(".router_link");

  all_tabs.forEach((tab) => {
  
  tab.style = tab.id === tab_clicked.value ? `background-color: var(--primary-blue); color: white` : "";
  
  });
  
}


function deleteItem(item) {

  item_name.value = item

  interactive_store.toggle_confirmation_modal(true)
  
}



/* Hooks */

onMounted(() => {

   overall_func('All') //if category dey link use am, otherwise make all be default
    
})
 
</script>

<style scoped>
.menu-container {
  display: block;
  font-family: Arial, sans-serif;
  padding: 20px;
}

div.categories{
    overflow-x: auto;
    white-space: nowrap;
    margin: 0px auto 0px auto;
}

div.categories .router_link{
    cursor: pointer;
    white-space: normal;
    display: inline-block;
    text-align: center;
    padding: 8px 12px;
    color: var(--primary-white);
    font-size: 14px;
    border: 1px solid var(--primary-white);
    margin: 0px 20px 10px 0px;
    background-color: rgb(110, 113, 114);
    border-radius: 20px;
    font-weight: bold;
    text-transform: capitalize;
    text-decoration: none;
}

div.categories .router_link:hover{
    color: white;
}

#add-item {
    text-decoration: none;
    color: white;
    display: inline-block;
    padding: 6px 10px;
    background-color: #007bff;
    font-size: 16px;
    border-radius: 5px;
    margin: 20px 0;
}

.fa-plus {
    margin-left: 5px;
    font-size: 15px;
}

.menu-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.menu-item {
  display: flex;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
}

.right-badge {
  position: absolute;
  top: 2px;
  right: 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.left-badge {
  position: absolute;
  bottom: 5px;
  left: 5px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.item-image img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  margin-left: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-price {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.item-description {
  font-size: 14px;
  word-break: break-all;
  color: #666;
}

.buttons-container {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.delete-button, .edit-button {
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.3s;
  width: 100px;
  display: inline-block;
}

.delete-button {
  background-color: #ff4d4f;
  color: white;
}

.delete-button:hover {
  background-color: #e03e3e;
}

.edit-button {
  background-color: #4caf50;
  color: white;
}

.edit-button:hover {
  background-color: #45a049;
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-button {
  padding: 10px 20px;
  font-size: 16px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
}

.pagination-button:hover {
  background-color: #0056b3;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
