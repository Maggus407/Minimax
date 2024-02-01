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
  registerWrite: any;
  jump: any;
  jumpSet: boolean;
  next: any;
  description: string;
}

export const useControlTableStore = defineStore('controlTable', () => {
  // Import stores
  const registerStore = useRegisterStore();

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
      registerWrite: [],
      jump: null,
      jumpSet: false,
      next: controlTable.length + 1,
      description: "",
    };

    newRow.registerWrite = registerStore.registerOrder.map((register: any) => {
      return { title: register.title, isActive: false};
    });

    controlTable.push(newRow);
    updateAdressesAndNext();
  }


  //given a number, return the next row with that id
  function getNextRowById(adress: number) {
    let row = controlTable.find((row) => row.adress == adress);
    console.log("ROW: "+ row);
    return row;
  }

  //remove Register from writable register in control table
  function updateRemovedRegisterInCT(register: string){
    controlTable.forEach((row) => {
      row.registerWrite = row.registerWrite.filter((reg: any) => reg.title !== register);
    });
  }

  function updateCTAddedRegister(register: string){
    controlTable.forEach((row) => {
      row.registerWrite.push({title: register, isActive: false});
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
    getNextRowById,
    updateAdressesAndNext,
    updateRemovedRegisterInCT,
    updateCTAddedRegister
  };
});
