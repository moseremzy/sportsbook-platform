<template>
  <div>
    <font-awesome-icon class="fa-solid fa-box-open" id = "box"  icon="fa-solid fa-box-open"/>
    <h1><slot></slot></h1>
  </div>
</template>

<script setup>
  
</script>

<style scoped>
   div {
       margin: 40px 0 10px 0;
       text-align: center;
   }
   #box {
       color: rgb(111, 136, 128);
       font-size: 80px;
   }
   h1 {
       color: rgb(128, 119, 119);
       font-size: 22px;
       margin: 10px 0 0 0;
   }
</style>