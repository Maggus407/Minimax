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
  const aluStore = useAluStore();

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
    console.log("updateTable");
    updateAdressesAndNext();
    rowsForSelection();
    createRT_Notation();
  }
  
  function deleteRow(index: number) {
        // Speichere die ID und die Adresse der zu löschenden Zeile vor dem Löschen
        const deletedRowId = controlTable[index].id;
  
        // Gehe durch alle Zeilen und aktualisiere die 'jump' und 'next' Werte, falls nötig
        controlTable.forEach(row => {
          // Überprüfe, ob 'jump' oder 'next' die gelöschte Zeile referenzieren
          if (row.jump !== null && row.jump.id === deletedRowId) {
            row.jump = -1; // Oder einen anderen geeigneten Wert
          }
          if (row.next.id === deletedRowId) {
            row.next = -1; // Oder den Wert für "kein Sprungziel"
          }
        });
    // Lösche die Zeile aus dem Array
    controlTable.splice(index, 1);
  
    // Aktualisiere die Adressen und 'next'-Werte aller Zeilen
    updateAdressesAndNext();
  }

  function createRT_Notation() {
    console.log("createRT_Notation");
    controlTable.forEach((row, index) => {
      let RT_Notation = ""; // Beginne mit der Basis-RT-Notation der Operation
      if (row.AluCtrl !== null) {
        const aluOperation = aluStore.aluOperations.get(row.AluCtrl);
        RT_Notation = aluOperation ? aluOperation.rt : "???";
        console.log(RT_Notation);
      }
       // Ersetze ALU.result durch die Register, die in registerWrite aufgeführt sind
       if (RT_Notation.includes('ALU.result') && row.registerWrite.length > 0) {
        const activeRegister = row.registerWrite.filter((reg: any) => reg.isActive);
        const registerTitles = activeRegister.map((reg: any) => reg.title).join(', ');
        RT_Notation = RT_Notation.replace('ALU.result', registerTitles);
      } else if (RT_Notation.includes('ALU.result')) {
          RT_Notation = RT_Notation.replace('ALU.result', '???'); // Fallback, falls keine Register zum Schreiben vorhanden sind
      }
      // Überprüfe und ersetze A und B in der RT-Notation
      if (RT_Notation.includes('A')) {
        RT_Notation = RT_Notation.replace(/A/g, row.AluSelA.title || "???");
      }
      if (RT_Notation.includes('B')) {
        RT_Notation = RT_Notation.replace(/B/g, row.AluSelB.title || "???");
      }
      row.description = RT_Notation;
      console.log(row.description);
    });
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
    updateCTAddedRegister,
    createRT_Notation
  };
});
