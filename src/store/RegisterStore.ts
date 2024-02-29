// Utilities
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMultiplexerStore } from './MultiplexerStore';
import { useControlTableStore } from './ControlTableStore';

export const useRegisterStore = defineStore('register', () => {
  const multiplexerStore = useMultiplexerStore();
  const controlTableStore = useControlTableStore();

  const { t } = useI18n({ useScope: 'global' });
  //Base Register
  const BASE_REGISTERS = ['PC', 'IR', 'MDR', 'MAR', 'ACCU'];
  //store for calculation. Stores all the register.
  const register: Map<string, number> = new Map();
  //rective Register for UI
  const registerOrder: any = reactive([]);

  // Initialisiere die Map-Struktur mit den Basis-Registern und ihren Beschreibungen.
  BASE_REGISTERS.forEach(registerName => {
    const descriptionKey = `register.${registerName.toLowerCase()}`;
    const description = t(descriptionKey); // Holt die Übersetzung für den Schlüssel
    register.set(registerName, 0);
    registerOrder.push({ title: registerName, Value: 0, Description: description, isActive: false });
    if(registerName != "MAR"){
      multiplexerStore.addRegisterToMux('B', {title: registerName, Value: 0, Description: description});
    }
  });

  /**
   * Generates a unique name for a register based on the provided name.
   * If a register with the given name already exists, appends a numerical suffix.
   * E.g. "MAR" becomes "MAR.1" if "MAR" already exists.
   * @param name - The desired name for the register.
   * @returns A unique name for the register.
   */
  function getUniqueName(name: string): string {
    let newName = name;
    let counter = 1;
    while (register.has(newName)) { 
      newName = `${name}.${counter}`;
      counter++;
    }
    return newName;
  }
  
  /**
   * Adds a new register with a unique name to the store.
   * @param name - The desired name for the register.
   * @param description - A brief description or note for the register. Defaults to an empty string.
   */
  function addRegister(name: string, description:string = ""): void {
    const uniqueName = getUniqueName(name);
    const newRegisterData = {title: uniqueName, Value: 0, Description: description };
    register.set(uniqueName, 0);
    registerOrder.push(newRegisterData);
    controlTableStore.updateCTAddedRegister(uniqueName);
  }
  /**
   * Deletes a register from the store based on its name.
   * Base Register are not deletable
   * @param name - The name of the register to delete.
   */
  function deleteRegister(reg: any): void {
    console.log(register);
    if (!BASE_REGISTERS.includes(reg.title)) {
      register.delete(reg.title);
      // Finden Sie den Index des zu löschenden Registers in der registerOrder-Liste
      const index = registerOrder.findIndex((r: any) => r.title === reg.title);
      if (index !== -1) {
        // Entfernen Sie das Register direkt aus der Liste
        registerOrder.splice(index, 1);
      }
      multiplexerStore.deleteRegisterFromMux('AB', reg);
    }
    controlTableStore.updateRemovedRegisterInCT(reg.title);
  }
 
  /**
     * Fetches the data associated with a specific register name.
     * @param name - The name of the register.
     * @returns The data associated with the register.
     */
  function getRegisterDescription(name: string): any {
    return registerOrder.find((r: any) => r.title === name)?.Description;
  }

/**
 * Updates the data for a specific register. 
 * This allows changes to the value and description of a register.
 * @param name - The name of the register.
 * @param data - The new data for the register.
 */
function updateRegisterData(name: string, value: number, description: string): void {
  if (register.has(name)) {
    // Aktualisiere den Wert und die Beschreibung im register-Map
    register.set(name, value);

    // Finde den Index des Registers im registerOrder-Array
    const registerIndex = registerOrder.findIndex((r: any) => r.title === name);
    if (registerIndex !== -1) {
      // Aktualisiere Value und Description im registerOrder-Array
      registerOrder[registerIndex].Value = value;
      registerOrder[registerIndex].Description = description;
    }
  }
}

//return the register with the given name as an object
function getRegister(name:string){
  return registerOrder.find((r: any) => r.title === name);
}

function updateRegisterDescription(name: string, description: string): void {
  if (register.has(name)) {
    // Finde den Index des Registers im registerOrder-Array
    const registerIndex = registerOrder.findIndex((r: any) => r.title === name);
    if (registerIndex !== -1) {
      // Aktualisiere Value und Description im registerOrder-Array
      registerOrder[registerIndex].Description = description;
    }
  }
}

/**
 * Renames a register. This is only applicable for non-base registers.
 * @param oldName - The current name of the register.
 * @param newName - The new desired name for the register.
 */
function renameRegister(oldName: string, desiredNewName: string): void {
  console.log(oldName + " renamed to " + desiredNewName);
  const uniqueNewName = getUniqueName(desiredNewName);

  if (register.has(oldName) && !BASE_REGISTERS.includes(oldName)) {
    const data = register.get(oldName);
    console.log(data);
    if (data != undefined) {
      // Aktualisiere die Map `register`
      register.set(uniqueNewName, data);
      register.delete(oldName);

      // Finde den Index des alten Namens in der `registerOrder` Liste
      const index = registerOrder.findIndex((r:any) => r.title === oldName);
      console.log(index);
      if (index !== -1) {
        // Aktualisiere das Objekt an diesem Index
        registerOrder[index].title = uniqueNewName;
        // Der Wert und die Beschreibung bleiben unverändert
      }
    }
  }
  controlTableStore.updateTable();
}

function registerReset(){
  registerOrder.forEach((r: any) => {
      register.set(r.title, 0);
      r.Value = 0;
  });
}

//Create a List of all Registers with their values
function getRegisters(){
  let registers: any = [];
  register.forEach((title, value) => {
    registers.push({title: title, value: value});
  });
  return registers;
}

/**
 * Imports register data from an external source and updates the store accordingly.
 * @param reg Array of Registers
 */
function setRegisterFromImport(reg: any){
  //check if reg is empty
  if(reg.length == 0){
    return;
  }
  //reset all registers and remove all Register except the Base Registers
  registerOrder.forEach((r: any) => {
    if(!BASE_REGISTERS.includes(r.title)){
      deleteRegister(r);
    }
  });
  //add all Registers from the import
  reg.forEach((r: any) => {
    addRegister(r.name, r.description);
  });

}

// Exposed methods and computed properties for external use.
return {
  register,
  addRegister,
  deleteRegister,
  BASE_REGISTERS,
  getRegisterDescription,
  updateRegisterData,
  renameRegister,
  registerOrder,
  updateRegisterDescription,
  registerReset,
  getRegisters,
  setRegisterFromImport,
  getRegister
};
});
