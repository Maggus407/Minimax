import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
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
  jumpSet: boolean;
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
      jumpSet: false,
      next: controlTable.length + 1,
      description: "",
    };
    
    registerStore.registerOrder.forEach((registerObj: any) => {
      newRow.registerWrite[registerObj.title] = 0;
    });
  
    console.log(newRow.registerWrite);
  
    controlTable.push(newRow);
    updateAdressesAndNext();
  }

  function updateControlTableWithNewRegister(newRegisterName: string) {
    controlTable.forEach(row => {
      if (!(newRegisterName in row.registerWrite)) {
        row.registerWrite[newRegisterName] = 0;
      }
    });
  }
  
  function updateControlTableWithRemovedRegister(removedRegisterName: string) {
    controlTable.forEach(row => {
      if (removedRegisterName in row.registerWrite) {
        delete row.registerWrite[removedRegisterName];
      }
      
    // Aktualisiere AluSelA und AluSelB, falls nötig
    if (row.AluSelA && row.AluSelA.title === removedRegisterName) {
      row.AluSelA = null;
    }
    if (row.AluSelB && row.AluSelB.title === removedRegisterName) {
      row.AluSelB = null;
    }
    });
  }  

  function updateRenamedRegister(name: string){
    controlTable.forEach(row => {
      if (name in row.registerWrite) {
        row.registerWrite[name] = row.registerWrite[name];
      }
    });
  }

  // Berechnete Eigenschaft für Zeilen mit gesetztem Label
  function rowsForSelection() {
    return controlTable.find((row, index) => row.label !== '')
  }

  function showTableConsole(){
    console.log(controlTable);
    console.log(rowsForSelection());
  }

  function updateAdressesAndNext() {
    controlTable.forEach((row, index) => {
      if(!row.jumpSet){
        row.adress = index; // Setze die Adresse auf den aktuellen Index
        row.next = index + 1 < controlTable.length ? index + 1 : -1; // Setze 'next' auf den nächsten Index oder -1, wenn es das letzte Element ist
      }
    });
  }

  function updateTable(){
    updateAdressesAndNext();
    rowsForSelection();
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
    updateTable,
    rowsForSelection,
    updateControlTableWithNewRegister,
    updateControlTableWithRemovedRegister,
    updateRenamedRegister
  };
});
