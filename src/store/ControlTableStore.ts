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
  AluSelA: number | string;
  AluSelB: number | string;
  MDRSel: boolean;
  HsCs: boolean;
  Hs_R_W: boolean;
  AluCtrl: any;
  registerWrite: any[]; // Update: specify the type for this array if needed
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

  const controlTable = reactive<ControlTable[]>([
    // Hier können Sie anfängliche Werte einfügen, falls benötigt
  ]);

  function addRow(){
    controlTable.push({
      breakpoint: false,
      label: "",
      adress: 0,
      AluSelA: "",
      AluSelB: "",
      MDRSel: false,
      HsCs: false,
      Hs_R_W: false,
      AluCtrl: 0,
      registerWrite: [...registerStore.registerOrder],
      jump: 0,
      next: 0,
      description: "",
    });
  }

  return {
    controlTable,
    addRow,
  };
});
