<template>
  <v-card variant="outlined" height="60vh">
    <v-card-text class="d-flex flex-col ">
    <div>
      <v-btn :disabled="debuggerStore.executing" :color="!debuggerStore.executing ? 'light-blue' : 'grey'" @click="start" class="mr-5">Start</v-btn>
      <v-icon
        :disabled="!debuggerStore.executing"
        :color="debuggerStore.executing && debuggerStore.running == false ? 'green' : 'grey'"
        @click="stepBack"
        size="36"
        class="mr-3"
      >
        mdi-step-backward
      </v-icon>
      <v-icon :disabled="!debuggerStore.executing" :color="debuggerStore.executing && debuggerStore.running == false ? 'red' : 'grey'" @click="refresh" size="36" class="mr-3">mdi-refresh</v-icon>
      <v-icon :disabled="!debuggerStore.executing" :color="debuggerStore.executing ? 'red' : 'grey'" @click="stop" size="36" class="mr-3">mdi-stop</v-icon>
      <v-icon :disabled="!debuggerStore.executing || debuggerStore.finished" :color="debuggerStore.executing && debuggerStore.running == false ? 'green' : 'grey'" @click="step" size="36" class="mr-3">mdi-step-forward</v-icon>
      <v-icon :disabled="!debuggerStore.executing || debuggerStore.finished" :color="debuggerStore.executing && debuggerStore.running == false ? 'blue' : 'grey'" @click="run" size="36" class="mr-3">mdi-step-forward-2</v-icon>
    </div>
    <div class="d-flex flex-col pt-2 ml-10">
      <h3 class="mr-15">Step: {{ debuggerStore.counter}}</h3>
      <h3 class="flex-grow-1">ALU: {{ debuggerStore.Alu_UI }}</h3>
    </div>
    </v-card-text>
    <v-progress-linear
      color="green"
      :indeterminate="debuggerStore.running"
    ></v-progress-linear>
    <v-table
    fixed-header
    density="compact"
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

import { useMemoryStore } from '@/store/MemoryStore';


const controlTableStore = useControlTableStore();
const debugerStore = useDebugerStore();

const debuggerStore = useDebugerStore();
const memoryStore = useMemoryStore();

memoryStore.changePageSize_Debugger(10);

function start() {
    debuggerStore.executing = true;
    debuggerStore.start();
}

function stop() {
  if(!debuggerStore.stopped && debuggerStore.running == true && debuggerStore.finished == false) {
    debuggerStore.stopped = true;
  }else if(!debuggerStore.stopped && debuggerStore.running == false || debuggerStore.finished){
    debuggerStore.executing = false;
    debuggerStore.stop();
    memoryStore.setInitialMemory();
  }
}

function refresh() {
  if(debuggerStore.running)return;
  debuggerStore.stop();
  debuggerStore.executing = true;
  debuggerStore.start();
  memoryStore.setInitialMemory();
}

function step() {
  if(debuggerStore.running)return;
    debuggerStore.step();
    updateMemory();
}

function stepBack() {
  if(debuggerStore.running)return;
    debuggerStore.stepBack();
    updateMemory();
}

function run() {
  if(debugerStore.executing){
    setTimeout(() => {
      debuggerStore.run();
    },0)
  }
}

function updateMemory() {
    let page = memoryStore.getDebuggerPage();
    memoryStore.updateDisplayedMemory(page);
}

</script>
