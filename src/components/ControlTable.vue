<template>
    <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
    <v-btn @click="controlTable.addRow">Neue Reihe hinzufügen</v-btn>
  
    <v-table :items="controlTable.controlTable"></v-table>
  </template>

    <script setup lang="ts">
    import { useControlTableStore } from '@/store/ControlTableStore';

    const controlTable = useControlTableStore();

    </script>