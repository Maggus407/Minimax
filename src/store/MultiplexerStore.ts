import { defineStore } from 'pinia';
import {reactive } from 'vue';

export const useMultiplexerStore = defineStore('multiplexer', () => {
  const muxA: (string | number | any)[] = reactive([{title: "0",Value: 0}, {title: "1", Value: 1}]);
  const muxB: (string | number | any)[] = reactive([]);

  // Funktion zum Hinzufügen eines Registers zu einem Multiplexer
  function addRegisterToMux(mux: string, register: object) {
    if (mux === 'A') {
      muxA.push(register);
    } else {
      muxB.push(register);
    }
    console.log(muxA);
    console.log(muxB);
  }

  // Funktion zum Entfernen eines Registers aus einem Multiplexer
  function deleteRegisterFromMux(mux: string, register: object) {
    if (mux === 'A') {
      const index = muxA.indexOf(register);
      if (index > -1) {
        muxA.splice(index, 1);
      }
    } else if(mux === 'B') {
      const index = muxB.indexOf(register);
      if (index > -1) {
        muxB.splice(index, 1);
      }
    } else if(mux === 'AB') {
      const index = muxA.indexOf(register);
      if (index > -1) {
        muxA.splice(index, 1);
      }
      const index2 = muxB.indexOf(register);
      if (index2 > -1) {
        muxB.splice(index2, 1);
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
