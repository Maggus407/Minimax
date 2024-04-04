<template>
    <v-row>
        <v-col class="pb-0 order-md-1 order-sm-2">
            <MemoryList mode="debugger" denseVersion="comfortable"/>
        </v-col>
        <v-col class="pb-0 order-md-2 order-sm-1">
            <Simulation/>
            <RegisterView/>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import Simulation from './ReUsable/Simulation.vue';
import RegisterView from './ReUsable/RegisterView.vue';
import MemoryList from './ReUsable/MemoryList.vue';

</script>