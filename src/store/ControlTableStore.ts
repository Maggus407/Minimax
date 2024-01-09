import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useAluStore } from '@/store/AluStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useMemoryStore } from './MemoryStore';

// Interface for control table
interface ControlTable {
  breakpoint: boolean;
  label: string;
  adress: number;
  AluSelA: any;
  AluSelB: any;
  MDRSel: number;
  HsCs: number;
  Hs_R_W: number;
  AluCtrl: any;
  registerWrite: { [key: string]: number }; // Für jedes Register ein Boolescher Wert
  jump: number;
  next: number;
  description: string;
}

export const useControlTableStore = defineStore('controlTable', () => {
    // Import stores
    const aluStore = useAluStore();
    const registerStore = useRegisterStore();
    const multiplexerStore = useMultiplexerStore();
    const memoryStore = useMemoryStore();

  const controlTable = reactive<ControlTable[]>([]);

  function addRow(){
    const newRow: ControlTable = {
      breakpoint: false,
      label: "",
      adress: 0,
      AluSelA: null,
      AluSelB: null,
      MDRSel: 0,
      HsCs: 0,
      Hs_R_W: 0,
      AluCtrl: null,
      registerWrite: {},
      jump: -1,
      next: 0,
      description: "",
    };
  
    // Für jedes Register einen Standardwert hinzufügen
    registerStore.registerOrder.forEach(register => {
      newRow.registerWrite[register] = 0;
    });
  
    controlTable.push(newRow);
    console.log(controlTable);
  }

  function deleteRow(index: number){
    controlTable.splice(index, 1);
  }

  return {
    controlTable,
    addRow,
    deleteRow
  };
});
