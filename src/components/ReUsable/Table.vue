<template>
  <div ref="table"></div>
</template>

<script setup lang="ts">
import { useControlTableStore } from '../../store/ControlTableStore';
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import { ref, watch } from 'vue';

const controlTable = useControlTableStore();
const table = ref('table');
let tabulatorInstance:any = null;

setTimeout(() => {
  tabulatorInstance = new Tabulator(table.value, {
    data: controlTable.controlTable,
    height:"90vh",
    reactiveData: true, //enable reactive data
    layout: "fitColumns",
    autoColumns: true,
  });
},0);


</script>