// Utilities
import { defineStore } from 'pinia';
import {ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Type definition for storing register values.
 * - Value: The numeric value of the register.
 * - Description: A brief description or note associated with the register.
 */
type ValueDescription = {
  Value: number;
  Description: string;
};

export const useRegisterStore = defineStore('register', () => {

  const { t } = useI18n({ useScope: 'global' });
  //Base Register
  const BASE_REGISTERS = ['MAR', 'MDR', 'ACCU', 'IR', 'PC'];
  //store for calculation. Stores all the register.
  const register: Map<string, ValueDescription> = new Map();
  //Keep Order of register entries
  const registerOrder: any = reactive([]);

  // Initialisiere die Map-Struktur mit den Basis-Registern und ihren Beschreibungen.
  BASE_REGISTERS.forEach(registerName => {
    const descriptionKey = `register.${registerName.toLowerCase()}`;
    const description = t(descriptionKey); // Holt die Übersetzung für den Schlüssel
    register.set(registerName, { Value: 0, Description: description });
    registerOrder.push({ registerName, data: { Value: 0, Description: description } });
  });

  /**
   * A computed property that returns the names of all the registers.
   * @returns An array of register names.
   */
  const getRegister = computed(() => registerOrder);

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
    const newRegisterData = { Value: 0, Description: description };
    register.set(uniqueName, newRegisterData);
    registerOrder.push({ registerName: uniqueName, data: newRegisterData });

  }
  /**
   * Deletes a register from the store based on its name.
   * Base Register are not deletable
   * @param name - The name of the register to delete.
   */

  function deleteRegister(name: string): void {
    if (!BASE_REGISTERS.includes(name)) {
      register.delete(name);
      // Finden Sie den Index des zu löschenden Registers in der registerOrder-Liste
      const index = registerOrder.findIndex((r: any) => r.registerName === name);
      if (index !== -1) {
        // Entfernen Sie das Register direkt aus der Liste
        registerOrder.splice(index, 1);
      }
    }
  }
 
  /**
     * Fetches the data associated with a specific register name.
     * @param name - The name of the register.
     * @returns The data associated with the register.
     */
  function getRegisterData(name: string): ValueDescription | undefined {
    return registerOrder.find((r: any) => r.registerName === name)?.data.Description;
  }

/**
 * Updates the data for a specific register. 
 * This allows changes to the value and description of a register.
 * @param name - The name of the register.
 * @param data - The new data for the register.
 */
function updateRegisterData(name: string, data: ValueDescription): void {
  if (register.has(name)) {
    // Aktualisieren Sie die vorhandenen Daten mit den neuen Werten.
    register.set(name, { ...register.get(name), ...data });

    // Finden und aktualisieren Sie den entsprechenden Eintrag in registerOrder
    const registerIndex = registerOrder.findIndex((r:any) => r.registerName === name);
    if (registerIndex !== -1) {
      registerOrder[registerIndex].data = { ...registerOrder[registerIndex].data, ...data };
    }
  }
  registerOrder.value = [...registerOrder];
}


/**
 * Renames a register. This is only applicable for non-base registers.
 * @param oldName - The current name of the register.
 * @param newName - The new desired name for the register.
 */
function renameRegister(oldName: string, desiredNewName: string): void {
  const uniqueNewName = getUniqueName(desiredNewName);
  if (register.has(oldName) && !BASE_REGISTERS.includes(oldName)) {
    const data = register.get(oldName);
    if (data) {
      register.set(uniqueNewName, data);
      register.delete(oldName);
      const index = registerOrder.findIndex((r:any) => r.registerName === oldName);
      if (index !== -1) {
        registerOrder[index] = { registerName: uniqueNewName, data };
      }
    }
  }
}



// Exposed methods and computed properties for external use.
return {
  addRegister,
  getRegister,
  deleteRegister,
  BASE_REGISTERS,
  getRegisterData,
  updateRegisterData,
  renameRegister,
  registerOrder
};
});
