import { defineStore } from 'pinia';
import {reactive } from 'vue';
import { useControlTableStore } from './ControlTableStore.ts';
import { useRegisterStore } from './RegisterStore.ts';

export const useMultiplexerStore = defineStore('multiplexer', () => {
  // Import stores
  const controlTableStore = useControlTableStore();
  const registerStore = useRegisterStore();
  const muxA: (any)[] = reactive([{title: "0",Value: 0}, {title: "1", Value: 1}]);
  const muxB: (any)[] = reactive([]);

  // Funktion zum Hinzufügen eines Registers zu einem Multiplexer
  function addRegisterToMux(mux: string, register: object) {
    if (mux === 'A') {
      muxA.push(register);
    } else {
      muxB.push(register);
    }
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
  }/**
   * Set the Mux Values from the imported JSON
   * @param mux Which site A or B
   * @param values Array of Mux Values
   */
  function setMuxFromImport(values: any) {
    //console.log(values)
    //Clear muxA and muxB
      muxA.splice(0, muxA.length);
      muxB.splice(0, muxB.length);
    //Set now the values from the imported JSON
   if(values[0].muxType === 'A'){
    values[0].input.forEach((element: any) => {
      if(element.type === "constant"){
        addRegisterToMux("A", {title: element.value, Value: element.value});
      }
      if(element.type === "register"){
        //find the register in the registerStore
        let reg = registerStore.getRegister(element.value);
        addRegisterToMux("A", reg);
      }
    })
   }
   if(values[1].muxType === 'B'){
    values[1].input.forEach((element: any) => {
      if(element.type === "constant"){
        addRegisterToMux("B", {title: element.value, Value: element.value});
      }
      if(element.type === "register"){
        //find the register in the registerStore
        let reg = registerStore.getRegister(element.value);
        //console.log(reg);
        addRegisterToMux("B", reg);
      }
    })
   }
     
  }

  return {
    muxA,
    muxB,
    addRegisterToMux,
    deleteRegisterFromMux,
    setMuxFromImport
  };
});
