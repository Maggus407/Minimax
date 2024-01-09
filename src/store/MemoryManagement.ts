import { defineStore } from "pinia";
import { useRegisterStore } from "./RegisterStore";
import { reactive, ref } from "vue";

export const useMemory = defineStore("memory", {
  state: () => ({
      memory: new Int32Array(100000), //Memory to work with
      initialState: new Int32Array(100000), //Memory to reset to Number = 2^24 = 16777216
  }),
  getters:{
    //Return the memory array as normal Array
    getMemoryArray: (state) => () => {
      return reactive(Array.from(state.memory));
    },
      getValueAtMarAdress: (state) => () => {
        const reg = useRegisterStore();
        let index = reg.getMARAdressValue();
        if (index !== undefined) {
          return state.memory[index[0]];
        }
        return null;
      },
},
actions: {
    setMemoryValue(index: number, value: number) {
      this.memory[index] = value;
      this.initialState[index] = value;
    },
    setMemoryValueAtMarAdress() {
        const reg = useRegisterStore();
        let index = reg.getMARAdressValue();
        if (index !== undefined) {
          let value = reg.getMDRValue();
          if (value !== undefined) {
            this.memory[index[0]] = value[0];
          }
        }else{
          console.log("Error: MAR not set");
        }
    },
    setInitialState() {
      this.memory = this.initialState;
    }
}})
