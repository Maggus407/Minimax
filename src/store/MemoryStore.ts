import { defineStore } from 'pinia';
import { reactive, ref, watch } from 'vue';

export const useMemoryStore = defineStore('memory', () => {
    //Page Settings
    const PAGE_SIZE = ref(16)
    const memoryPage = ref(1)
    const debuggerPage = ref(1)
    const hexBinSwitch = ref(false)

    const rawMemory = new Int32Array(16777216).fill(0);
    let initialMemory = new Int32Array(16777216).fill(0)
    
    const displayedMemory = reactive(new Array(PAGE_SIZE.value).fill(0))
    const fileName = ref<string>("memory.bin"); // Default-Wert

    watch(memoryPage, (newPage) => {
        updateDisplayedMemory(newPage);
    });
    
    watch(debuggerPage, (newPage) => {
        updateDisplayedMemory(newPage);
    });
    
    function updateDisplayedMemory(pageValue: number) {
        const startIdx = (pageValue - 1) * PAGE_SIZE.value; // Berechnung des Startindex basierend auf der Seite
        const endIdx = startIdx + PAGE_SIZE.value; // Berechnung des Endindex basierend auf der Seitengröße
    
        let temp = rawMemory.slice(startIdx, endIdx); // Schneiden des Arrays basierend auf den berechneten Indizes
    
        for (let i = 0; i < temp.length; i++) {
            displayedMemory[i] = temp[i];
        }
    }

    function setMemoryFromFileInput(fileInput: Int32Array, startadresse: string): void {
        let tmp:string = "0";
        if(startadresse == "" || startadresse === null || startadresse === undefined){
            tmp = "0";
        }else{
            tmp = startadresse;
        }
        const startIdx = parseInt(tmp, 16);

        if (startIdx >= 0 && startIdx + fileInput.length <= rawMemory.length) {
            rawMemory.set(fileInput, startIdx);
        } else {
            console.error("Startadresse und/oder Dateilänge überschreiten die Speichergrenzen.");
        }
        initialMemory = rawMemory;
        updateDisplayedMemory(memoryPage.value)
    }

    function checkIsMemoryAreaEmpty(arrayLength: number, startadresse: string): boolean {
        startadresse = startadresse || "0";
        const startIdx = parseInt(startadresse, 16);
        const endIdx = startIdx + arrayLength;
        
        // Stellen Sie sicher, dass wir nicht über die Grenzen des Arrays hinausgehen
        if (startIdx < 0 || endIdx > rawMemory.length) {
            console.error("Der angegebene Bereich liegt außerhalb der Grenzen des Speichers.");
            return false;
        }
    
        for (let i = startIdx; i < endIdx; i++) {
            if (rawMemory[i] !== 0) {
                // Sobald ein Wert gefunden wird, der nicht 0 ist, geben Sie false zurück
                return false;
            }
        }
    
        // Wenn alle Werte 0 sind, geben Sie true zurück
        return true;
    }
    

    function exportMemoryRange(start: number, end: number): ArrayBuffer {
        if (isNaN(start) || start < 0) {
            start = 0;
        }
        if (isNaN(end) || end < 0) {
            end = 16777215;
        }
        console.log("start: " + start);  
        console.log("end: " + end);
        return rawMemory.slice(start, end+1).buffer;
    }

    function setRawMemoryValue(value: number, index: number) {
        rawMemory[index] = value;
    }
    
    function changePageSize_Memory(pageSize: number){
        PAGE_SIZE.value = pageSize;
        displayedMemory.length = pageSize;
        updateDisplayedMemory(memoryPage.value);
    }

    function changePageSize_Debugger(pageSize: number){
        PAGE_SIZE.value = pageSize;
        displayedMemory.length = pageSize;
        updateDisplayedMemory(debuggerPage.value);
    }

    function getValue_at_MAR_Address(marIndex: number): number {
        return rawMemory[marIndex];
    }
    
    function getMemory() {
        return displayedMemory;
    }

    function getRawMemory() {
        return rawMemory.buffer;
    }    

    function setFileName(newName: string): void {
        fileName.value = newName;
    }
    
    function getFileName(): string {
        return fileName.value;
    }

    function getMemoryPage(): number {
        return memoryPage.value;
    }
    
    function getDebuggerPage(): number {
        return debuggerPage.value;
    }
    
    function setMemoryPage(newPage: number) {
        memoryPage.value = newPage;
        updateDisplayedMemory(newPage);
    }
        
    function setDebuggerPage(newPage: number) {
        debuggerPage.value = newPage;
        updateDisplayedMemory(newPage);
    }
    

    function setInitialMemory(){
        rawMemory.set(initialMemory)
        updateDisplayedMemory(memoryPage.value)
        updateDisplayedMemory(debuggerPage.value)
    }

    function deleteData(){
        rawMemory.fill(0)
        initialMemory.fill(0)
        updateDisplayedMemory(memoryPage.value)
        updateDisplayedMemory(debuggerPage.value)
    }

    function getPageSize(): number {
        return PAGE_SIZE.value
    }

    function updateMemory(index: number, newValue: number) {
        if (index >= 0 && index < rawMemory.length) {
          rawMemory[index] = newValue;
          updateDisplayedMemory(memoryPage.value); // Aktualisieren der Anzeige
        }
      }
      

    return { setMemoryFromFileInput, 
        checkIsMemoryAreaEmpty,
        getMemory, 
        setInitialMemory, 
        deleteData, 
        setDebuggerPage,
        getDebuggerPage,
        setMemoryPage,
        getMemoryPage,
        getRawMemory, 
        exportMemoryRange,    
        setFileName,
        getFileName,
        getPageSize,
        updateMemory,
        setRawMemoryValue,
        getValue_at_MAR_Address,
        updateDisplayedMemory,
        changePageSize_Memory,
        changePageSize_Debugger,
        hexBinSwitch
     };

});
