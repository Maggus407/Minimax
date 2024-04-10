import { defineStore } from 'pinia';
import { useControlTableStore } from './ControlTableStore.ts';
import { useRegisterStore } from './RegisterStore.ts';
import { useMemoryStore } from './MemoryStore.ts';
import { useAluStore } from './AluStore.ts';
import { useDebugerStore } from './DebugerStore.ts';
import { ref, computed } from 'vue';
import { useExport } from '@/Import-Export/Export';
import { useImport } from '@/Import-Export/Import';

export const useGlobalStore = defineStore('global', () => {

    const controlTableStore = useControlTableStore();
    const registerStore = useRegisterStore();
    const memoryStore = useMemoryStore();
    const aluStore = useAluStore();
    const debugerStore = useDebugerStore();

    //Array of QuickSaves
    const quickSaves = ref<Array<any>>([]);

    
    function quickSave(name:string, data:any) {
        quickSaves.value.push({title: name, value: data});
    }
    
    function resetMachine() {

    }
    return {
        resetMachine,
        quickSave,
        quickSaves
    };

});