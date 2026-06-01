<template>
  <div class="pagination">
    <button :disabled="currentPage === 1" @click="previousPage" class="pagination-button">Previous</button>
    <span>Page {{ currentPage }} of {{ totalPages }}</span>
    <button :disabled="currentPage === totalPages" @click="nextPage" class="pagination-button">Next</button>
  </div>
</template>

<script setup>

import { ref, defineProps, defineEmits } from 'vue';

// Props to get current page, total pages, and items per page
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});

// Emit an event to change the page
const emit = defineEmits(['update:currentPage']);

// Methods to handle pagination logic
const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('update:currentPage', props.currentPage + 1);
  }
};

const previousPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1);
  }
};
</script>

<style scoped>
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
