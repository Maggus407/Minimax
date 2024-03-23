<template>
  <v-card variant="outlined">
    <v-btn :disabled="debuggerStore.executing" @click="start">Start</v-btn>
    <v-btn :disabled="!debuggerStore.executing" @click="stop">Stop</v-btn>
    <v-btn :disabled="!debuggerStore.executing" @click="step">Step</v-btn>
    <v-btn :disabled="!debuggerStore.executing" @click="stepBack">Step Back</v-btn>
    <v-btn :disabled="!debuggerStore.executing" @click="run">RUN BOY</v-btn>
    <v-card-text>
                    Step: {{ debuggerStore.counter}}
                </v-card-text>
    <v-table
    fixed-header
    density="compact"
    height="50vh"
    >
    <thead>
        <tr>
          <th class="text-left">
            BR
          </th>
          <th class="text-left">
            Label
          </th>
          <th class="text-left">
            Adresse
          </th>
          <th class="text-left">
            ALU == 0?
          </th>
          <th class="text-left">
            Next
          </th>
          <th class="text-left">
            RT
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(data,index) in controlTableStore.controlTable"
          :key="data.id"
          :class="{'bg-blue': debugerStore.currentAdress === data.adress && debugerStore.executing}"
        >
          <td @click="debugerStore.changeBreakpoint(index)" class="pr-0">
            <v-icon v-if="data.breakpoint" color="red">mdi-record</v-icon>
              <p v-else>&nbsp;</p>
          </td>
          <td>{{ data.label }}</td>
          <td>{{ data.adress }}</td>
          <!--ALU == 0?-->
          <td>
            <p v-if="data.jump === null">{{ data.jump !== null ?  data.jump.adress : "-"}}</p>
                <div class="flex flex-col">
                  <p v-if="data.jump !== null && data.jumpSet === true">1</p>
                  <p v-if="data.jump !== null && data.jumpSet === true">0</p>
                </div>
          </td>
          <!--Next-->
          <td>
            <div class="flex flex-col">
                <p v-if="data.jump !== null">{{ data.jump.adress }}</p>
                <p v-if="true">{{ typeof data.next === 'object' && data.next !== null ? data.next.adress : data.next }}</p>
              </div>
          </td>
          <td>
            <div v-if="data.description.length > 0">
                <p v-for="(d, index) in data.description" :key="index">{{ d }}</p>
              </div>
              <div v-else>
                <p>&nbsp;</p>
              </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';
import { useDebugerStore } from '@/store/DebugerStore';

import {useRegisterStore} from '@/store/RegisterStore';
import { useMemoryStore } from '@/store/MemoryStore';


const controlTableStore = useControlTableStore();
const debugerStore = useDebugerStore();

const debuggerStore = useDebugerStore();
const registerStore = useRegisterStore();
const memoryStore = useMemoryStore();

memoryStore.changePageSize_Debugger(10);

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
