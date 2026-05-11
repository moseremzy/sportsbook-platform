<template>
  <div class="container">
    <h1>404</h1>
    <p>Ooops, page not found.</p>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, onUpdated, reactive, toRaw, ref, watch} from 'vue'
</script>

<style scoped>

@media only screen and (min-width: 612px) {
    div.container {
        font-family: 'Roboto Slab';
        width: 500px;
        margin: 120px auto 0 auto;
        text-align: center;
        padding: 20px
    }

    div.container h1 {
        color: #2e2c2c;
        margin: 20px 0 20px 0;
        font-size: 35px
    }

    div.container p {
        font-size: 16px;
        color: #2e2c2c;
        margin: 20px 0 27px 0
    }
}

@media only screen and (max-width: 612px) {
    div.container {
        width:70%;
        margin: 120px auto 0 auto;
        text-align: center;
        padding: 20px;
        font-family: Open Sans,Gotham,gotham,Tahoma,Geneva,sans-serif
    }

    div.container h1 {
        color: #2e2c2c;
        margin: 20px 0 0 0;
        font-size: 30px
    }

    div.container p {
        font-size: 15px;
        color: #2e2c2c;
        margin: 20px 0 20px 0
    }
}
</style>