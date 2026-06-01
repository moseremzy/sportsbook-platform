<template>
  <div class="container">
    <!-- Modal -->
    <div
      class="modal fade in"
      id="confirmModal"
      role="dialog"
      style="display: block; top: 30%;"
      v-if="interactive_store.display_confirmation_modal"
    >
      <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
          <div class="modal-header">
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              @click="interactive_store.toggle_confirmation_modal(false)"
            >
              &times;
            </button>
            <h4 class="modal-title">Confirmation</h4>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this item?</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmDelete"
            >
              Delete
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="interactive_store.toggle_confirmation_modal(false)"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade in"
      v-if="interactive_store.display_confirmation_modal"
      @click="interactive_store.toggle_confirmation_modal(false)"
    ></div>
  </div>
</template>


<script setup>

import { useInteractiveStore } from '@/stores/interactive';

import {toRefs, ref, computed, reactive, onMounted, watch } from 'vue';

import API from '../../api/index'

const interactive_store = useInteractiveStore();

const props = defineProps({

  item_name: String

})

const { item_name } = toRefs(props)

async function confirmDelete() {

  interactive_store.toggle_confirmation_modal(false); // Close the modal after confirming

  interactive_store.toggle_loading_overlay(true); //show loading overlay

  const response =  await API.delete_item({ data: {item_name: item_name.value}})

  if (response.message === "Delete successful") {

      await products_store.fetch_products() //refetch items to update items

      interactive_store.backend_message = "Item Deleted Succesfully"

      interactive_store.display_success_alert_box()
      
  } else if (response.message === "Item not found") {

      interactive_store.backend_message = "Item not found"

      interactive_store.display_error_alert_box()

  } else {

      interactive_store.backend_message = "Error occured, try again"

      interactive_store.display_error_alert_box()

  }

      interactive_store.toggle_loading_overlay(false); //hide loading overlay
   
}
</script>

<style scoped>
/* Modal Styling */
.modal-content {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 10px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  background-color: #dc3545; /* Red for warning */
  color: #fff;
  padding: 15px 20px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.modal-header .close {
  color: #fff;
  font-size: 1.2rem;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.modal-header .close:hover {
  opacity: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.modal-body {
  padding: 20px;
  font-size: 1.2rem;
  color: #333;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background-color: #f1f1f1;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

/* Button Styling */
.modal-footer .btn {
  border-radius: 20px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.modal-footer .btn-danger {
  background-color: #dc3545;
  color: #fff;
}

.modal-footer .btn-danger:hover {
  background-color: #a71d2a;
}

.modal-footer .btn-secondary {
  background-color: #6c757d;
  color: #fff;
}

.modal-footer .btn-secondary:hover {
  background-color: #545b62;
}

/* Backdrop Styling */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Fade Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
