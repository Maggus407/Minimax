import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useAluStore } from '@/store/AluStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useDebugerStore } from '@/store/DebugerStore';
import { useMultiplexerStore } from './MultiplexerStore';
import { v4 as uuidv4 } from 'uuid'
import { parse } from 'path';

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
  description: [];
}

export const useControlTableStore = defineStore('controlTable', () => {
  // Import stores
  const registerStore = useRegisterStore();
  const aluStore = useAluStore();
  const debuggerStore = useDebugerStore();
  const multiplexerStore = useMultiplexerStore();

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
      description: [],
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
      row.AluSelA?.title === register ? row.AluSelA = null : null;
      row.AluSelB?.title === register ? row.AluSelB = null : null;
      row.registerWrite = row.registerWrite.filter((reg: any) => reg.title !== register);
      create_RT_Notation(row);
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
    controlTable.forEach((row) => {
      create_RT_Notation(row);
    });
    debuggerStore.executing = false;
    console.log(controlTable);
  }

  function aluRemoved(alu: string){
    controlTable.forEach((row) => {
      if(row.AluCtrl === alu){
        row.AluCtrl = null;
      }
    });
    updateTable();
  }

  function create_RT_Notation(row: any) {
    row.description = []; // Initialisiere das description-Array neu
    if (!row) {
      row.description.push("");
      return;
    }
  
    // Speichere ALU-Operation und RT-Notation
    const AluOperation = aluStore.aluOperations.get(row.AluCtrl);
    let RT_Notation_Base = AluOperation ? AluOperation.rt : "";
    
    // Ersetze 'ALU.result' mit Platzhalter für die spätere Ersetzung
    RT_Notation_Base = RT_Notation_Base.replace('ALU.result', '{}');
  
    // Variablen für 'A' und 'B' Werte
    const AluSelA = row.AluSelA?.title || "???";
    const AluSelB = row.AluSelB?.title || "???";
  
    // Präzises Ersetzen von 'A' und 'B'
    RT_Notation_Base = RT_Notation_Base.replace(/\bA\b/g, AluSelA);
    RT_Notation_Base = RT_Notation_Base.replace(/\bB\b/g, AluSelB);
  
    // Wenn MDR selektiert ist, überspringe MDR bei der RT-Notation
    let MDR = row.registerWrite.some((reg: any) => reg.title === "MDR" && reg.isActive);
    
    if(row.HsCs && row.Hs_R_W == false){
      row.description.push("M[MAR] ← MDR");
    }

    if(row.Hs_R_W && row.HsCs && row.MDRSel && MDR){
      row.description.push("MDR ← M[MAR]");
    }

    
    // Erstelle für jedes aktive Register einen eigenen String, überspringe MDR falls nötig
    row.registerWrite.forEach((reg: any) => {
      if (reg.isActive && !(MDR && reg.title === 'MDR' && row.MDRSel)) { // Überspringe MDR wenn skipMDR true ist
        let RT_Notation = RT_Notation_Base.replace('{}', reg.title);
        row.description.push(RT_Notation);
      }
    });
  
    // Wenn kein Register aktiv ist, füge den Basis-RT-Notation-String hinzu
    if (row.description.length === 0) {
      if(row.AluCtrl == "Transfer A" && AluSelA != "???"){
        row.description.push(AluSelA + " == 0?");
      }else if(row.AluCtrl == "Transfer B" && AluSelB != "???"){
        row.description.push(AluSelB + " == 0?");
      }else{
        let RT_Notation = RT_Notation_Base.replace('{}', '???');
        row.description.push(RT_Notation);
      }
    }
  }
  
  function deleteRow(index: number): void {
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

  /**
   * 
   */
  function setControlTableFromImport(rows: Array<any>): void {
    //Clear the current control table
    console.log("Set Control Table from Import: " + rows);
    controlTable.splice(0, controlTable.length);
    //Set the new rows
    rows.forEach((row: any) => {
      let label = row.label;
      let jumpSet = false;
      let jump = null;
      let next = null;
      let AluSelA = null;
      let AluSelB = null;
      let MDRSel = false;
      let HsCs = false;
      let Hs_R_W = false;
      let AluCtrl = null;
      let registerWrite: any;
      let description:any;

      console.log(row);
      if(row.label){
        label = row.label;
      }
      if (row['unconditional-jump']) {
        jumpSet = true;
        next = row['unconditional-jump'].target;
        jump = null;
      }
      if (row['conditional-jump']) {
        jumpSet = true;
        next = row['conditional-jump']['cond0-target']; // Zugriff auf den Wert von cond0-target
        jump = row['conditional-jump']['cond1-target']; // Zugriff auf den Wert von cond1-target
      }
      let reg = registerStore.registerOrder.map((register: any) => {
        return { title: register.title, isActive: false};
      });

      row.signal.forEach((signal: any) => {
        if (signal.name === 'ALU_SELECT_A') {
          AluSelA = findAluA(parseInt(signal.value));
        } else if (signal.name === 'ALU_SELECT_B') {
          AluSelB = findAluB(parseInt(signal.value));
        } else if (signal.name === 'ALU_CTRL') {
          AluCtrl = findAluSel(parseInt(signal.value));
        } else if (signal.name === 'MEM_RW') {
          Hs_R_W = signal.value === "1";
        } else if (signal.name === 'MDR_SEL') {
          MDRSel = signal.value === "1";
        } else if (signal.name === 'MEM_CS') {
          HsCs = signal.value === "1";
        } else if (signal.name.endsWith('.W')) {
          // Extrahiere den Register-Namen aus dem Signal-Namen, indem du '.W' entfernst
          let registerName = signal.name.replace('.W', '');
          // Finde das Register-Objekt, das diesen Titel hat
          let registerObj = reg.find((r:any) => r.title === registerName);
          // Wenn das Register gefunden wurde, setze isActive auf true
          if (registerObj) {
            registerObj.isActive = signal.value === "1";
          }
        }
      });
            
      const newRow: ControlTable = {
        id: uuidv4(),
        breakpoint: false,
        label: label,
        adress: controlTable.length,
        AluSelA: AluSelA,
        AluSelB: AluSelB,
        MDRSel: MDRSel,
        HsCs: HsCs,
        Hs_R_W: Hs_R_W,
        AluCtrl: AluCtrl,
        registerWrite: reg,
        jump: jump,
        jumpSet: jumpSet,
        next: next != null ? next : controlTable.length + 1,
        description: [],
      };
      controlTable.push(newRow);
    });
    console.log(controlTable);
    updateTable();
    setJumps();
  }

  //Remove the next, jump Number with the controlTable Object with the Index IF jumpSet is True
  function setJumps() {
    controlTable.forEach((row, index) => {
      if (row.jumpSet) {
        // Überprüfen, ob 'next' eine Nummer ist
        const nextIndex = parseInt(row.next);
        if (!isNaN(nextIndex) && nextIndex >= 0) {
          // Sicherstellen, dass der Index innerhalb des Bereichs des Arrays liegt
          if (nextIndex < controlTable.length) {
            // Ersetze 'next' durch das entsprechende Objekt aus 'controlTable'
            row.next = controlTable[nextIndex];
          } else {
            // Wenn der Index außerhalb des Bereichs ist, setze 'next' auf null
            row.next = null;
          }
        }
        
        // Überprüfe und handle 'jump' in ähnlicher Weise, falls notwendig
        const jumpIndex = parseInt(row.jump);
        if (!isNaN(jumpIndex) && jumpIndex >= 0) {
          if (jumpIndex < controlTable.length) {
            row.jump = controlTable[jumpIndex];
          } else {
            row.jump = null;
          }
        }
        
        // Wenn 'next' auf -1 gesetzt ist, dann setze 'jump' auf null
        if (nextIndex === -1) {
          row.jump = null;
        }
      }
    });
  }
  

  function findAluSel(index:number):string{
    console.log("Find Alu Sel: " + aluStore.aluOperationsListAdded[index]);
    return aluStore.aluOperationsListAdded[index]
  }

  function findAluA(index: number):object{
    return multiplexerStore.muxA[index];
  }

  function findAluB(index: number):object{
    return multiplexerStore.muxB[index];
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
    create_RT_Notation,
    aluRemoved,
    setControlTableFromImport
  };
});
