<template>
  <v-app width="100vw">
        <!-- Sidebar-Bereich -->
          <Sidebar/>
        <!-- Hauptinhalt-Bereich -->
        <v-main class="ma-5">
          <router-view />
        </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import { useImport } from './Import-Export/Import';
import { useExport } from './Import-Export/Export';

const importStore = useImport();


</script>