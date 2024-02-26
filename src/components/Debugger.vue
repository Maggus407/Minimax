<template>
    <v-row>
        <v-col>
            <MemoryList mode="debugger" denseVersion="compact"/>
            <v-card variant="outlined" class="mt-2">
                <v-card-title class="pb-0">
                    Register
                </v-card-title>
                <!--Register-->
                <v-col class="pt-0">
                    <v-card-text v-for="register in registerStore.registerOrder" :key="register.name" class="pt-1 pb-1 pl-1">
                        {{ register.title }}: {{ register.Value }}
                    </v-card-text>
                </v-col>
            </v-card>
        </v-col>
        <v-col>
            <v-card title="ALU" variant="outlined">
                <v-card-text>
                    RESULT: {{ debuggerStore.Alu_UI }}
                </v-card-text>
                <v-card-text>
                    Step: {{ debuggerStore.counter}}
                </v-card-text>
            </v-card>
            <v-card>
                <v-btn :disabled="debuggerStore.executing" @click="start">Start</v-btn>
                <v-btn :disabled="!debuggerStore.executing" @click="stop">Stop</v-btn>
                <v-btn :disabled="!debuggerStore.executing" @click="step">Step</v-btn>
                <v-btn :disabled="!debuggerStore.executing" @click="stepBack">Step Back</v-btn>
                <v-btn :disabled="!debuggerStore.executing" @click="run">RUN BOY</v-btn>
                <v-btn @click="testing">Test</v-btn>
            </v-card>   
            <v-card>
                <v-card-title>
                    <Simulation/>
                </v-card-title>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { useDebugerStore } from '@/store/DebugerStore';
import Simulation from './ReUsable/Simulation.vue';
import {useRegisterStore} from '@/store/RegisterStore';
import { useMemoryStore } from '@/store/MemoryStore';
import MemoryList from './ReUsable/MemoryList.vue';
import { ref } from 'vue';

const debuggerStore = useDebugerStore();
const registerStore = useRegisterStore();
const memoryStore = useMemoryStore();

memoryStore.changePageSize_Debugger(10);

function testing() {
    console.log(registerStore.register);
}

function start() {
    debuggerStore.executing = true;
    debuggerStore.start();
}

function stop() {
    debuggerStore.executing = false;
    debuggerStore.stop();
    memoryStore.setInitialMemory();
    updateMemory();
}

function step() {
    debuggerStore.step();
    updateMemory();
    console.log(registerStore.register);
}

function stepBack() {
    debuggerStore.stepBack();
    updateMemory();
}

function run() {
    debuggerStore.run();
}

function updateMemory() {
    let page = memoryStore.getDebuggerPage();
    memoryStore.updateDisplayedMemory(page);
}

</script>