<template>
  <div>
      <v-stage :config="configKonva">
        <v-layer>
          <v-circle :config="configCircle"></v-circle>
          <v-line :config="line"></v-line>
          <v-rect :config="registerRec"></v-rect>
          <v-text v-for="r in reg.register" :config="registerText"></v-text>
        </v-layer>
      </v-stage>
  </div>
</template>

<script setup lang="ts">
import { useRegisterStore } from '../store/RegisterStore';
import { useDebuggerStore } from '../store/DebuggerStore';
import { useMemory } from '../store/MemoryManagement';
import { useMultiplexerStore } from '../store/MultiplexerStore';

const reg = useRegisterStore();
const debug = useDebuggerStore();
const mem = useMemory();
const mux = useMultiplexerStore();

let muxACordinates = {
  x: 100,
  y: 100,
};
let muxBCordinates = {
  x: 100,
  y: 50,
};

let configKonva = {
  width: 900,
  height: 900,
};

let line = {
  points: [muxACordinates.x, muxACordinates.y, muxBCordinates.x, muxBCordinates.y],
  stroke: "black",
  strokeWidth: 4,
};

let configCircle = {
  x: 250,
  y: 250,
  radius: 70,
  fill: "red",
  stroke: "black",
  strokeWidth: 4,
};

let registerRec = {
  x: 50,
  y: 50,
  width: 100,
  height: 30,
  fill: "red",
  stroke: "black", //Rand
  strokeWidth: 4, //Rand Breite
};

let registerText = {
  x: 350,
  y: 50,
  text: "Register",
  fontSize: 20,
  fontFamily: "Calibri",
  fill: "black",
};
 
</script>


