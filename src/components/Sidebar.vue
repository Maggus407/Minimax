<template>
    <div :class="`flex flex-col ${toggle ? 'w-[0px]' : 'w-[220px]'} duration-300 justify-top font-roboto gap-6 bg-glassy_blue dark:bg-dark_bg dark:text-white rounded-r-lg relative`">
        <span @click="toggleSidebarwidth" :class="`absolute ${toggle && 'rotate-180'}  -right-3 top-5 hover:cursor-pointer`"><i class="fa-solid fa-circle-chevron-left fa-2xl"></i></span>
        <div class="mb-5"></div>
        <RouterLink class="mt-5 px-5 focus:bg-white hover:bg-white dark:hover:bg-dark_blue overflow-hidden" to="/">{{$t('nav.overview')}}</RouterLink>      
        <RouterLink class="pt-5 px-5 focus:bg-white hover:bg-white dark:hover:bg-dark_blue" active-class="bg-white" to="/controltable">{{$t('nav.control-table')}}</RouterLink>
            <RouterLink class="pt-5 px-5 focus:bg-white hover:bg-white dark:hover:bg-dark_blue" active-class="bg-white" to="/debugger">{{$t('nav.debugger')}}</RouterLink>
            <RouterLink class="pt-5 px-5 focus:bg-white hover:bg-white dark:hover:bg-dark_blue" active-class="bg-white" to="/addregister">{{$t('nav.addRegister')}}</RouterLink>
            <RouterLink class="pt-5 px-5 focus:bg-white hover:bg-white dark:hover:bg-dark_blue" active-class="bg-white" to="/AluConfig">{{$t('nav.aluConfig')}}</RouterLink>
            <RouterLink class="pt-5 px-5 focus:bg-white hover:bg-white dark:hover:bg-dark_blue" active-class="bg-white" to="/MuxConfig">{{$t('nav.muxConfig')}}</RouterLink>
        <RouterLink class="pt-5 px-5 focus:bg-white hover:bg-white dark:hover:bg-dark_blue" active-class="bg-white" to="/speicher">{{$t('nav.memory')}}</RouterLink>
        <div class="flex flex-col gap-4">
            <button class="hover:bg-white dark:hover:bg-dark_blue" @click="changeLanguage('en')">English</button>
            <button class="hover:bg-white dark:hover:bg-dark_blue" @click="changeLanguage('de')">Deutsch</button>
        </div>
        <div class="flex items-center justify-center bg-dark_bg text-white dark:bg-glassy_blue dark:text-dark_bg w-[50%] p-1 mx-auto rounded-md">
                <button @click="toggleDark()" :class="`flex gap-3 ${toggle && 'text'}`">{{ dark ? 'Light' : 'Dark' }}
                    <span v-if="dark"><i v-if="dark" class="fa-solid fa-sun fa-xl"></i></span>
                    <span v-else><i class="fa-regular fa-moon fa-xl"></i></span>
                </button>
        </div>
        <button @click="exportTable" class="mt-10">Export(Table/Machine)</button>
        <input type="file" id="file-selector" accept=".zip"/>
        <button @click="importTable">Import</button>
    </div>
</template>

<script setup lang="ts">
import {RouterLink} from "vue-router"
import {useI18n} from 'vue-i18n'
import {useDark,useToggle} from "@vueuse/core"
import {ref} from "vue"
import {useControlTable} from "../store/ControlTableManagement"
import { useRegisterStore } from "../store/RegisterStore"
import { useMultiplexerStore } from "../store/MultiplexerStore"
import JSZip from "jszip";
import { saveAs } from "file-saver";

const controltable = useControlTable();
const registerStore = useRegisterStore();
const multiplexerStore = useMultiplexerStore();

const {getAllUserRegister} = registerStore;
const {getAllMultiplexerA, getAllMultiplexerB} = multiplexerStore;
  
//Darkmode
const dark = useDark();
const toggleDark = useToggle(dark);

const { locale } = useI18n()
function changeLanguage(lang: string){
    locale.value = lang
}

//Machine Config dropdown
const toggle = ref(false);
const toggleSidebarwidth = () => {
    toggle.value = !toggle.value;
}

//Export
const exportTable = async () => {
    try {
        const zip = new JSZip();
        const table = JSON.stringify(controltable.row);
        const machine = JSON.stringify({
            registers: getAllUserRegister(),
            multiplexer: {
                multiplexerA: getAllMultiplexerA(), 
                multiplexerB: getAllMultiplexerB() 
            }
        });
        zip.file("table.json", table);
        zip.file("machine.json", machine);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "machine.zip");
    } catch (err) {
        console.error(err);
        // Hier können Sie zusätzliche Fehlerbehandlungslogik hinzufügen
    }
}


//Import
const importTable = async () => {
    const fileSelector = document.getElementById('file-selector') as HTMLInputElement;
    let file: any = null;
    if (!fileSelector) {
        alert('File selector not found!');
        return;
    } else if (fileSelector.files) {
        file = fileSelector.files[0];
    }
    if (!file) {
        alert('No file selected!');
        return;
    }

    try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        const tableFile = contents.files['table.json'];
        const machineFile = contents.files['registers.json'];
        if (!tableFile || !machineFile) {
            alert('Invalid file structure!');
            return;
        }

        const tableJSON = await tableFile.async('string');
        const machineJSON = await machineFile.async('string');
        const table = JSON.parse(tableJSON);
        const machine = JSON.parse(machineJSON);
        
        controltable.row = table; // Please update according to your actual data structure
        //updateMachineConfiguration(machine); // Please replace this with the actual function to update machine configuration
    } catch (err) {
        console.error(err);
        alert('Failed to import the file!');
    }
}



</script>
