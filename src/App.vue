<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
</script>

<template>
  <div class="flex flex-row h-screen w-screen dark:bg-dark_bg">
    <Sidebar class=""/>
    <div class="flex w-screen bg-white dark:bg-dark_blue dark:text-white overflow-y-scroll">
      <router-view class="h-[97%] w-[98%] bg-light_bg dark:bg-dark_bg rounded-md mx-auto my-auto"/>
    </div>
  </div>
</template>


