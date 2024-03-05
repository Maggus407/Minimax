import { useRegisterStore } from "@/store/RegisterStore";
import { useMultiplexerStore } from "@/store/MultiplexerStore";
import { useControlTableStore } from "@/store/ControlTableStore";
import { useAluStore } from "@/store/AluStore";
import { defineStore } from 'pinia';
import JSZip from 'jszip';


export const useImport = defineStore('import', () => {
    const register = useRegisterStore();
    const multiplexer = useMultiplexerStore();
    const controlTable = useControlTableStore();
    const alu = useAluStore();

    let machine:any;
    let signal:any;

  //Checks if the file is a .zip file or a .json file
  async function Import(file: any) {
    console.log(file);
    const zipPattern = /\.zip$/; // Endet auf .zip
    const machinePattern = /machine.*\.json$/; // Enthält 'machine' und endet auf .json
    const signalPattern = /signal.*\.json$/; // Enthält 'signal' und endet auf .json

    if (zipPattern.test(file.name)) {
        await importZip(file);
    } else if (machinePattern.test(file.name)) {
        await importMachineJson(file);
    } else if (signalPattern.test(file.name)) {
        await importSignalJson(file);
    } else {
        console.error('Dateityp wird nicht unterstützt!');
    }
}


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
        setMachineData();
      }
      // signal.json extrahieren und verarbeiten
      if (content.files['signal.json']) {
        const signalData = await content.files['signal.json'].async('string');
        signal = JSON.parse(signalData);
        // Hier Logik zum Aktualisieren der Stores mit den Daten aus signal.json
        setSignalData();
      }
      console.log('Import erfolgreich!');
    } catch (error) {
      console.error('Fehler beim Importieren der .zip-Datei:', error);
    }
    console.log(machine);
    console.log(signal);
  }

  //Gets a file machine.json which is not a .zip file
  async function importMachineJson(file:any) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const machineData = e.target?.result;
      machine = JSON.parse(machineData as string);
      // Hier Logik zum Aktualisieren der Stores mit den Daten aus machine.json
      //Set Alu Data
      setMachineData();
    };
    reader.readAsText(file);
  }

  //Gets a file signal.json which is not a .zip file
  async function importSignalJson(file:any) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const signalData = e.target?.result;
      signal = JSON.parse(signalData as string);
      // Hier Logik zum Aktualisieren der Stores mit den Daten aus signal.json
      setSignalData();
    };
    reader.readAsText(file);
  }

  function setMachineData() {
    alu.setOperation_Import(machine.machine.alu.operation);
    register.setRegisterFromImport(machine.machine.registers.register);
    multiplexer.setMuxFromImport(machine.machine.muxInputs);
  }

  function setSignalData() {
    controlTable.setControlTableFromImport(signal.signaltable.row);
  }

  return {
    Import,
  };


});