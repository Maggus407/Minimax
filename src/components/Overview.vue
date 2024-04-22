<template>
    <h1>OVERVIEW</h1>
    <v-btn @click="controlTable.addRow()">CLICK</v-btn>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';

const controlTable = useControlTableStore();
</script>