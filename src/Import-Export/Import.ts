import { useRegisterStore } from "@/store/RegisterStore";
import { useMultiplexerStore } from "@/store/MultiplexerStore";
import { useControlTableStore } from "@/store/ControlTableStore";
import { useAluStore } from "@/store/AluStore";
import { defineStore } from 'pinia';
import {ref} from 'vue';
import JSZip from 'jszip';


export const useImport = defineStore('import', () => {
    const register = useRegisterStore();
    const multiplexer = useMultiplexerStore();
    const controlTable = useControlTableStore();
    const alu = useAluStore();

    let machine:any;
    let signal:any;

    // Funktion zum Importieren der .zip-Datei
  async function importZip(file:any) {
    const zip = new JSZip();
    try {
      const content = await zip.loadAsync(file); // .zip-Datei laden
      // machine.json extrahieren und verarbeiten
      if (content.files['machine.json']) {
        const machineData = await content.files['machine.json'].async('string');
        machine = JSON.parse(machineData);
        // Hier Logik zum Aktualisieren der Stores mit den Daten aus machine.json
        //Set Alu Data
        console.log(machine.machine.alu.operation);
        alu.setOperation_Import(machine.machine.alu.operation);
        register.setRegisterFromImport(machine.machine.registers.register);
        multiplexer.setMuxFromImport(machine.machine.muxInputs);
      }
      // signal.json extrahieren und verarbeiten
      if (content.files['signal.json']) {
        const signalData = await content.files['signal.json'].async('string');
        signal = JSON.parse(signalData);
        // Hier Logik zum Aktualisieren der Stores mit den Daten aus signal.json
        controlTable.setControlTableFromImport(signal.signaltable.row);
      }
      console.log('Import erfolgreich!');
    } catch (error) {
      console.error('Fehler beim Importieren der .zip-Datei:', error);
    }
    console.log(machine);
    console.log(signal);
  }

  return {
    importZip,
  };


});