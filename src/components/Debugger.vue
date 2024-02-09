<template>
    <v-btn :disabled="executing" @click="start">Start</v-btn>
    <v-btn :disabled="!executing" @click="stop">Stop</v-btn>
    <v-btn :disabled="!executing" @click="step">Step</v-btn>
    <v-btn :disabled="!executing" @click="run">RUN BOY</v-btn>
    <v-btn @click="testing">Test</v-btn>
</template>

<script setup lang="ts">
import { useDebugerStore } from '@/store/DebugerStore';
import {useRegisterStore} from '@/store/RegisterStore';
import { ref } from 'vue';

const debuggerStore = useDebugerStore();
const registerStore = useRegisterStore();
const executing = ref(false);

function testing() {
    console.log(registerStore.register);
}

function start() {
    executing.value = true;
    debuggerStore.start();
}

function stop() {
    executing.value = false;
    debuggerStore.stop();
}

function step() {
    debuggerStore.step();
    console.log(registerStore.register);
}

function run() {
    debuggerStore.run();
}

</script>