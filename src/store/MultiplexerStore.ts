import { defineStore } from 'pinia';
import {reactive } from 'vue';
import { useControlTableStore } from './ControlTableStore';

export const useMultiplexerStore = defineStore('multiplexer', () => {
  // Import stores
  const controlTableStore = useControlTableStore();
  const muxA: (any)[] = reactive([{title: "0",Value: 0}, {title: "1", Value: 1}, {title: "10", Value: 10}]);
  const muxB: (any)[] = reactive([]);

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
    controlTableStore.updateTable();
  }

  return {
    muxA,
    muxB,
    addRegisterToMux,
    deleteRegisterFromMux,
  };
});
