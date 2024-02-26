<template>
    <v-table
      :headers="headers"
      :items="items"
      class="elevation-1" 
      :items-per-page="5"
    ></v-table>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useControlTableStore } from '@/store/ControlTableStore';
  
  const controlTableStore = useControlTableStore();
  
  const headers = ref([
      { text: 'Breakpoint', align: 'start', value: 'breakpoint' },
      { text: 'Label', value: 'label' },
      { text: 'Adresse', value: 'Adresse' },
      { text: 'ALU == 0?', value: 'AluZERO' },
      { text: 'Next', value: 'next' },
      { text: 'RT', value: 'RT' },
  ]);
  
  const items = computed(() => {
    return controlTableStore.controlTable.map(row => ({
        breakpoint: row.breakpoint,
        label: row.label,
        Adresse: row.adress,
        AluZERO: row.AluCtrl ? row.AluSelA === 0 || row.AluSelB === 0 : false, // Beispiellogik, passen Sie sie entsprechend Ihrer Logik an
        next: row.next,
        RT: row.description.join(', '), // Angenommen, description ist ein Array von Strings
    }));
  });
  </script>
  