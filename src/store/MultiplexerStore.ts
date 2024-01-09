import { defineStore } from 'pinia';
import {reactive } from 'vue';

export const useMultiplexerStore = defineStore('multiplexer', () => {
  const muxA: (string | number)[] = reactive([0, 1]);
  const muxB: (string | number)[] = reactive(["MAR", "MDR", "ACCU", "IR", "PC"]);

  // Funktion zum Hinzufügen eines Registers zu einem Multiplexer
  function addRegisterToMux(mux: string, register: string | number) {
    if (mux === 'A') {
      muxA.push(register);
    } else {
      muxB.push(register);
    }
    console.log(muxA);
    console.log(muxB);
  }

  // Funktion zum Entfernen eines Registers aus einem Multiplexer
  function deleteRegisterFromMux(mux: string, register: string | number) {
    if (mux === 'A') {
      const index = muxA.indexOf(register);
      if (index > -1) {
        muxA.splice(index, 1);
      }
    } else {
      const index = muxB.indexOf(register);
      if (index > -1) {
        muxB.splice(index, 1);
      }
    }
  }

  return {
    muxA,
    muxB,
    addRegisterToMux,
    deleteRegisterFromMux,
  };
});
