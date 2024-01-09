<template>
    <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
    <v-btn @click="controlTable.addRow">Neue Reihe hinzufügen</v-btn>
  
    <v-data-table :items="controlTable.controlTable"></v-data-table>
  </template>

    <script setup lang="ts">
    import { useControlTableStore } from '@/store/ControlTableStore';

    const controlTable = useControlTableStore();

    const headers = [
        { text: 'Adresse', value: 'adress' },
        { text: 'Befehl', value: 'command' },
        { text: 'Operand', value: 'operand' },
        { text: 'Breakpoint', value: 'breakpoint' },
        { text: 'Zyklus', value: 'cycle' },
    ];

    </script>