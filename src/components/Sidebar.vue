<template>
<v-navigation-drawer app>
  <!--HEADER-->
        <v-container class="d-flex flex-row justify-space-between">
          <div class="text-h4">MiniMax</div>
          <!--<div @click="toggle" class="p-0 mt-1 pointer"><v-icon size="x-large">mdi-menu</v-icon></div>-->
        </v-container>
        <v-divider/>
          <!--Routes-->
          <v-container class="pl-0 pt-0 pb-0 pr-0">
            <v-list>
              <v-list-group>
                <v-list-item v-for="link in links" :key="link.path" :to="link.path">
                    <v-list-item-title>{{ link.label }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-container>
          <v-divider></v-divider>
            <!--QuickSave-->
            <v-container class="pt-0 pb-0">
              <div width="100%" class="d-flex flex-col mt-5">
                <v-text-field label="Quick Save" v-model="name" hint="Name required"></v-text-field>
                <v-btn :disabled="name == ''" class="ml-3 mt-1" icon="mdi-content-save" @click="quickSave"></v-btn>
              </div>
              <div width="100%" class="d-flex flex-col">
                <v-select variant="outlined" :items="['-', ...globalStore.quickSaves]" v-model="snapshot" return-object abel="Load QuickSave"></v-select>
                <v-btn :disabled="snapshot == '-' || snapshot == ''" class="ml-3 mt-1" icon="mdi-upload" @click="loadQuickSave"></v-btn>
              </div>
            </v-container>
            <v-divider></v-divider>
            <!--Export-->
          <v-container  class="pt-0 pb-0">
            <div width="100%" class="d-flex flex-col mt-5">
              <v-select variant="outlined" :items="itemsExport" v-model="currentExport" label="Export as..."></v-select>
              <v-btn :disabled="exportCheck == false || currentExport == '-'" class="ml-3 mt-1" @click="exportData" icon="mdi-export"/>
            </div>
            <!--Import-->
            <div class="d-flex flex-row">
              <v-file-input v-model="fileInput" variant="outlined" prepend-icon="" label="Import"></v-file-input>
              <v-btn class="ml-3 mt-1" @click="importData" icon="mdi-import" :disabled="fileInput.length === 0"><v-icon>mdi-import</v-icon></v-btn>
            </div>
          </v-container>
          <v-divider/>
            <!--Theme and Language-->
            <v-container class="d-flex flex-col">
              <v-btn @click="toggleTheme" icon="mdi-theme-light-dark" class="mr-5"/>
              <v-select v-model="selectedLanguage" :items="languages" label="Language"></v-select>
            </v-container>
    </v-navigation-drawer>

      <!-- Alert Benachrichtigung -->
  <v-alert
    v-if="importStore.isImported"
    type="success"
    :value="true"
    class="alert-import-success"
    text="Import erfolgreich!"
    width="20vw"
  ></v-alert>
  <v-alert
    v-if="importStore.isImportedError"
    type="error"
    class="alert-import-success"
    :text="importStore.errorText"
    width="20vw"
    closable
  ></v-alert>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useExport } from '../Import-Export/Export';
import { useImport } from '../Import-Export/Import';
import {useGlobalStore } from '@/store/GlobalOperations';
import { watch } from 'vue';

const exportStore = useExport();
const importStore = useImport();
const globalStore = useGlobalStore();

const fileInput = ref<File[]>([]);
const exportCheck = ref(false);
const currentExport = ref<string>('');
const selectedLanguage = ref<string>('en');
const name = ref<string>('');
const snapshot = ref<any>('');

// Beobachten Sie die isImported ref und setzen Sie sie nach 2 Sekunden zurück
watch(() => importStore.isImported, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      importStore.isImported = false;
    }, 2000); // 2000 Millisekunden = 2 Sekunden
  }
});

// Beobachten Sie die isImportedError ref und setzen Sie sie nach 2 Sekunden zurück
watch(() => importStore.isImportedError, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      importStore.isImportedError = false;
      importStore.errorText = '';
    }, 10000); // 2000 Millisekunden = 2 Sekunden
  }
});

//Check if currentExport is empty if not set exportCheck to true  
watch(() => currentExport.value, (newValue) => {
  if (newValue !== '') {
    exportCheck.value = true;
  } else {
    exportCheck.value = false;
  }
});


//watch the changes for the selected language and change the language
watch(selectedLanguage, (newValue) => {
  changeLanguage(newValue);
});

const theme = useTheme();

const itemsExport = ['-','.zip', 'machine.json', 'signal.json'];

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}

const { locale } = useI18n();

function changeLanguage(lang: string) {
    locale.value = lang;
}

const languages = ['de', 'en'];

const links = [
  { path: "/", label: "Overview" },
  { path: "/debugger", label: "Debugger" },
  { path: "/controltable", label: "Control Table" },
  { path: "/alu", label: "ALU" },
  { path: "/register", label: "Register" },
  { path: "/multiplexer", label: "MUX" },
  { path: "/memory", label: "Memory" },
];

function quickSave() {
  let json = exportStore.quickSave();
  console.log(json);
  globalStore.quickSave(name.value, json);
  name.value = '';
}

function loadQuickSave() {
  //find the snapshot in the quicksaves
  importStore.loadQuickSave(snapshot.value.value);
}

function exportData() {
  switch (currentExport.value) {
    case '-':
      break;
    case '.zip':
      exportStore.exportZip();
      break;
    case 'machine.json':
      exportStore.exportMachine();
      break;
    case 'signal.json':
      exportStore.exportSignal();
      break;
  }
}

function importData() {
  if (fileInput.value.length > 0) {
    const file = fileInput.value[0]; // Nehmen Sie die erste Datei aus dem Array
    importStore.Import(file).then(() => {
      console.log("Import erfolgreich");
      // Hier können Sie zusätzliche Aktionen nach dem Import durchführen
      fileInput.value = []; // Reset fileInput nach erfolgreichem Import
    }).catch((error) => {
      console.error("Fehler beim Importieren:", error);
    });
  }
}
</script>

<style scoped>
  .pointer {
    cursor: pointer;
  }
/* Klassen für die Sidebar-Transition */
.sidebar-mini{
  width: 5vw !important;/* Verkleinerte Breite */
}
.v-navigation-drawer {
  width: 15vw; /* Ursprüngliche Breite */
  transition: width 0.3s ease !important; /* Animiert die Breitenänderung */
}
.alert-import-success {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    margin-right: auto;
    margin-left: auto;
    z-index: 100; /* Stellen Sie sicher, dass es über anderen Elementen ist */
  }
</style>