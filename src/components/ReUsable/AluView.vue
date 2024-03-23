<template>
    <v-card variant="outlined">
        <v-card-title>
            ALU
        </v-card-title>
    </v-card>
</template>

<script setup lang="ts">
import { useDebugerStore } from '../../store/DebugerStore';

const debuggerStore = useDebugerStore();
</script>