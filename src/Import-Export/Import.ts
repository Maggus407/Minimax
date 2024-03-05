import { useRegisterStore } from "@/store/RegisterStore";
import { useMultiplexerStore } from "@/store/MultiplexerStore";
import { useControlTableStore } from "@/store/ControlTableStore";
import { useAluStore } from "@/store/AluStore";
import { defineStore } from 'pinia';
import JSZip from 'jszip';
import { ref } from 'vue';
import { is } from "@babel/types";

export const useImport = defineStore('import', () => {
    const register = useRegisterStore();
    const multiplexer = useMultiplexerStore();
    const controlTable = useControlTableStore();
    const alu = useAluStore();
    const isImported = ref(false);
    const succesMessage = ref("");
    const isImportedError = ref(false); //Error when importing
    const errorText = ref("");

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
        isImportedError.value = true;
        errorText.value = "File type is not supported!\n Please upload a .zip file or a .json file.";
    }
}

    // Funktion zum Importieren der .zip-Datei
    async function importZip(file:any) {
      const zip = new JSZip();
      try {
        const content = await zip.loadAsync(file); // .zip-Datei laden
        // Check if machine.json exists
        if (!content.files['machine.json'] && !content.files['signal.json']) {
          errorText.value = "Invalid .zip file: machine.json and signal.json are missing";
          isImportedError.value = true;
          return;
        }
        // machine.json extrahieren und verarbeiten
        const machineData = await content.files['machine.json'].async('string');
        if(isValidMachineJson(machineData)){
          machine = JSON.parse(machineData);
          setMachineData();  
        }
        // signal.json extrahieren und verarbeiten
        const signalData = await content.files['signal.json'].async('string');
        if(isValidSignalJson(signalData)){
          signal = JSON.parse(signalData);
          setSignalData();
        }
        console.log('Import erfolgreich!');
        isImported.value = true;
      } catch (error) {
        isImportedError.value = true;
        errorText.value = "Error while importing .zip file" + error;
        console.error('Fehler beim Importieren der .zip-Datei:', error);
      }
      console.log(machine);
      console.log(signal);
    }

  //Gets a file machine.json which is not a .zip file
  async function importMachineJson(file:any) {

    const reader = new FileReader();
    try {
      reader.onload = async function(e) {
        const machineData = e.target?.result;
        if(isValidMachineJson(machineData)){
          machine = JSON.parse(machineData as string);
          setMachineData();
          isImported.value = true;
        }
      };
    } catch (error) {
      console.error('Fehler beim Importieren der machine.json:', error);
      errorText.value = "Error while importing machine.json" + error;
      isImportedError.value = true;
    }
    reader.readAsText(file);
  }

  //Gets a file signal.json which is not a .zip file
  async function importSignalJson(file:any) {
    const reader = new FileReader();
    try {
      reader.onload = async function(e) {
        const signalData = e.target?.result;
        if(isValidSignalJson(signalData)){
          signal = JSON.parse(signalData as string);
          setSignalData();
        }
      };
    } catch (error) {   
      console.error('Fehler beim Importieren der signal.json:', error);
      errorText.value = "Error while importing signal.json" + error;
      isImportedError.value = true;
    }
    reader.readAsText(file);
  }

  function setMachineData() {
    alu.setOperation_Import(machine.machine.alu.operation);
    register.setRegisterFromImport(machine.machine.registers.register);
    multiplexer.setMuxFromImport(machine.machine.muxInputs);
    isImported.value = true;
  }

  function setSignalData() {
    controlTable.setControlTableFromImport(signal.signaltable.row);
    isImported.value = true;
  }

  function isValidSignalJson(jsonData:any) {
    try {
      // Parse the JSON data
      const data = JSON.parse(jsonData);
  
      // Validate 'signaltable' object
      if (!data.signaltable || !Array.isArray(data.signaltable.row)) {
        isImportedError.value = true;
        errorText.value = "Invalid structure: signaltable is missing or not an array";
        throw new Error('Invalid structure: signaltable.row is missing or not an array');
      }
  
      // Validate each 'row' object
      data.signaltable.row.forEach((row:any) => {
        // Validate 'label' if it exists
        if (row.hasOwnProperty('label') && typeof row.label !== 'string') {
          isImportedError.value = true;
          errorText.value = "Invalid structure: label is not a string";
          throw new Error('Invalid structure: label is not a string');
        }
  
        // Validate 'signal' array
        if (!Array.isArray(row.signal)) {
          isImportedError.value = true;
          errorText.value = "Invalid structure: signal is not an array";
          throw new Error('Invalid structure: signal is not an array');
        }
  
        // Validate each 'signal' entry
        row.signal.forEach((signal:any) => {
          if (typeof signal.name !== 'string' || typeof signal.value !== 'string') {
            isImportedError.value = true;
            errorText.value = "Invalid structure: signal entry is malformed";
            throw new Error('Invalid structure: signal entry is malformed');
          }
        });
  
        // Validate 'conditional-jump' if it exists
        if (row.hasOwnProperty('conditional-jump')) {
          if (typeof row['conditional-jump'] !== 'object' ||
              !row['conditional-jump'].hasOwnProperty('cond0-target') ||
              !row['conditional-jump'].hasOwnProperty('cond1-target')) {
                isImportedError.value = true;
                errorText.value = "Invalid structure: conditional-jump is malformed";
            throw new Error('Invalid structure: conditional-jump is malformed');
          }
        }
  
        // Validate 'unconditional-jump' if it exists
        if (row.hasOwnProperty('unconditional-jump')) {
          if (typeof row['unconditional-jump'] !== 'object' ||
              !row['unconditional-jump'].hasOwnProperty('target')) {
            isImportedError.value = true;
            errorText.value = "Invalid structure: unconditional-jump is malformed";
            throw new Error('Invalid structure: unconditional-jump is malformed');
          }
        }
  
        // Validate 'breakpoint' if it exists
        if (row.hasOwnProperty('breakpoint') && typeof row.breakpoint !== 'boolean') {
          isImportedError.value = true;
          errorText.value = "Invalid structure: breakpoint is not a boolean";
          throw new Error('Invalid structure: breakpoint is not a boolean');
        }
      });
  
      // If we reach this point, the JSON is considered valid
      return true;
    } catch (error) {
      isImportedError.value = true;
      errorText.value = "Signal JSON validation error: " + error;
      console.error('Signal JSON validation error:', error);
      return false;
    }
  }

  function isValidMachineJson(jsonData:any):boolean {
    try {
      // Parse the JSON data
      const data = JSON.parse(jsonData);
  
      // Validate the 'machine' object
      if (!data.machine) {
        errorText.value = "Invalid structure: machine is missing";
        isImportedError.value = true;
        throw new Error('Invalid structure: machine is missing');
      }
  
      // Validate 'muxInputs'
      if (!Array.isArray(data.machine.muxInputs)) {
        errorText.value = "Invalid structure: machine.muxInputs is not an array";
        isImportedError.value = true;
        throw new Error('Invalid structure: machine.muxInputs is not an array');
      }
      for (const muxInput of data.machine.muxInputs) {
        if (!Array.isArray(muxInput.input) || typeof muxInput.muxType !== 'string') {
          errorText.value = "Invalid structure: muxInput is not properly formed";
          isImportedError.value = true;
          throw new Error('Invalid structure: muxInput is not properly formed');
        }
        for (const input of muxInput.input) {
          if (typeof input.type !== 'string' || typeof input.value !== 'string') {
            errorText.value = "Invalid structure: muxInput.input object is not properly formed";
            isImportedError.value = true;
            throw new Error('Invalid structure: muxInput.input object is not properly formed');
          }
        }
      }
  
      // Validate 'registers'
      if (!Array.isArray(data.machine.registers.register)) {
        errorText.value = "Invalid structure: machine.registers.register is not an array";
        isImportedError.value = true;
        throw new Error('Invalid structure: machine.registers.register is not an array');
      }
  
      // Validate 'alu' operations
      if (!Array.isArray(data.machine.alu.operation)) {
        errorText.value = "Invalid structure: machine.alu.operation is not an array";
        isImportedError.value = true;
        throw new Error('Invalid structure: machine.alu.operation is not an array');
      }
      for (const operation of data.machine.alu.operation) {
        if (typeof operation !== 'string') {
          errorText.value = "Invalid structure: alu operation is not a string";
          isImportedError.value = true;
          throw new Error('Invalid structure: alu operation is not a string');
        }
      }
  
      // If we reach this point, the JSON is considered valid
      return true;
    } catch (error) {
      errorText.value = "Machine JSON validation error: " + error;
      isImportedError.value = true;
      console.error('Machine JSON validation error:', error);
      return false;
    }
  }
  
  return {
    Import,
    isImported,
    isImportedError,
    errorText,
    succesMessage
  };


});