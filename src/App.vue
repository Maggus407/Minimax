<template>
  <v-app width="100vw">
        <!-- Sidebar-Bereich -->
          <Sidebar/>
        <!-- Hauptinhalt-Bereich -->
        <v-main class="mt-2 mr-2 ml-2">
          <router-view />
        </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';

</script>