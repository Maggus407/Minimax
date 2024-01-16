import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useAluStore } from '@/store/AluStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useMemoryStore } from './MemoryStore';
import { v4 as uuidv4 } from 'uuid'

// Interface for control table
interface ControlTable {
  id: string;
  breakpoint: boolean;
  label: string;
  adress: number;
  AluSelA: any;
  AluSelB: any;
  MDRSel: boolean;
  HsCs: boolean;
  Hs_R_W: boolean;
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
      id: uuidv4(),
      breakpoint: false,
      label: "",
      adress: controlTable.length,
      AluSelA: null,
      AluSelB: null,
      MDRSel: false,
      HsCs: false,
      Hs_R_W: false,
      AluCtrl: null,
      registerWrite: {},
      jump: -1,
      next: controlTable.length + 1,
      description: "",
    };
  
    // Für jedes Register einen Standardwert hinzufügen
    registerStore.getRegister.value.forEach(register => {
      newRow.registerWrite[register] = 0;
    });
    console.log(newRow.registerWrite);
  
    controlTable.push(newRow);
    updateAdressesAndNext();
  }

  function showTableConsole(){
    console.log(controlTable);
  }

  function updateAdressesAndNext() {
    controlTable.forEach((row, index) => {
      row.adress = index; // Setze die Adresse auf den aktuellen Index
      row.next = index + 1 < controlTable.length ? index + 1 : -1; // Setze 'next' auf den nächsten Index oder -1, wenn es das letzte Element ist
    });
  }

  function updateTable(){
    updateAdressesAndNext()
  }
  
  function deleteRow(index: number){
    controlTable.splice(index, 1);
    updateAdressesAndNext(); // Aktualisiere Adressen und Next-Werte nach dem Löschen
  }

  return {
    controlTable,
    addRow,
    deleteRow,
    showTableConsole,
    updateTable
  };
});
