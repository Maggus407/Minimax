<template>
    <v-row>
        <v-col class="pb-0 pt-0 order-md-1 order-sm-2">
            <MemoryList denseVersion="comfortable"/>
        </v-col>
        <v-col class="pb-0 pt-0 order-md-2 order-sm-1">
            <Simulation/>
            <RegisterView/>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { useDebugerStore } from '@/store/DebugerStore';
import Simulation from './ReUsable/Simulation.vue';
import AluView from './ReUsable/AluView.vue';
import RegisterView from './ReUsable/RegisterView.vue';
import {useRegisterStore} from '@/store/RegisterStore';
import { useMemoryStore } from '@/store/MemoryStore';
import MemoryList from './ReUsable/MemoryList.vue';

const debuggerStore = useDebugerStore();

</script>