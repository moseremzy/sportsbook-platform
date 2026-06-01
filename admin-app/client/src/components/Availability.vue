<template>
  <span
    class="availability"
    :class="product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'"
    >
    {{ product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock' }}
  </span>
</template>

<script setup>
import { computed, reactive, toRefs, ref} from 'vue'

const props = defineProps({

  product: Object

})


const { product } = toRefs(props)
</script>


<style scoped>
.availability {
    display: inline-block;
    padding: 4px 10px;
    color: var(--primary-white);
    background-color: var(--primary-black);
    border-radius: 15px;
    font-size: 13px;
    margin: 5px 10px 0 0;
    border: 1px solid var(--primary-white);
}

.in-stock {
   background-color: #16a34a; /* green */
}

.out-of-stock {
    background-color: #dc2626; /* red */
}
</style>