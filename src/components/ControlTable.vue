<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <v-btn @click="controlTable.addRow">Neue Reihe hinzufügen</v-btn>

  <v-data-table
    :headers="headers"
    :items="controlTable.controlTable"
    density="compact"
    height="85vh"
  >
  
  </v-data-table>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';
import { useRegisterStore } from '@/store/RegisterStore';

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();

// Erzeugen der Spalten-Header
const headers = [
  // Header für die 'breakpoint' und 'label' Spalten
  {title: 'Breakpoint', value: 'breakpoint' },
  {title: 'Label', value: 'label' },
  {title: 'Adress', value: 'adress'},
  {title: 'AluSelA', value: 'AluSelA'},
  {title: 'AluSelB', value: 'AluSelB'},
  {title: 'MDRSel', value: 'MDRSel'},
  {title: 'HsCs', value: 'HsCs'},
  {title: 'Hs_R_W', value: 'Hs_R_W'},
  {title: 'AluCtrl', value: 'AluCtrl'},
    // Dynamisch generierte Header für die Register
    ...registerStore.registerOrder.map(register => ({
    title: register, // Der Name des Registers
    value: `registerWrite.${register}` // Der Schlüssel für den Zugriff auf den Wert im Objekt
  })),
  {title: 'jump', value: 'jump'},
  {title: 'next', value: 'next'},
  {title: 'description', value: 'description'},
];

headers.push({ title: 'Aktionen', value: 'actions' });

</script>