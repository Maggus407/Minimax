<template>
    <v-row>
      <v-col class="pb-0 pt-0"  sm="12" md="7" lg="7"><MemoryList mode="memory"/></v-col>
      <v-col sm="12" md="5" lg="5" class="pt-0">
        <v-card variant="outlined" class="pa-5 mb-5" title="Import">
          <!--Import-->
            <v-file-input persistent-clear  label="File input" variant="outlined" v-model="selectedFile" @change="updateFileSize" show-size></v-file-input>
            <v-text-field
                label="Startadresse (Standardwert: 0)"
                v-model="hexInput"
                @keydown="(event: KeyboardEvent) => validateHexInput(event, 'hexInput')"
                clearable
            ></v-text-field>
          
            <v-text-field
                label="Dateigröße (Byte)"
                v-model="fileSize"
                type="number"
                clearable
                :max="initialFileSize"
                @input="validateFileSize"
            ></v-text-field>
            <v-btn @click="handleFileChange">Import File</v-btn>
        </v-card>
        <!--Export-->
          <v-card variant="outlined" class="pa-5 mb-5" title="Export">
            <v-text-field
            v-model="startAddress"
            label="Start Adress to Export"
            @keydown="(event: KeyboardEvent) => validateHexInput(event, 'startAddress')"
            clearable
            ></v-text-field>
            <v-text-field
            v-model="endAddress"
            label="End Adress to Export"
            @keydown="(event: KeyboardEvent) => validateHexInput(event, 'endAddress')"
            clearable
            ></v-text-field>
            <v-text-field
              v-model="fileName"
              label="File Name (required to Export)"
              placeholder="Enter file name with extension"
              @change="updateFileName"
              clearable
            ></v-text-field>

            <v-btn :disabled="fileName === '' || fileName === null || fileName === undefined" @click="exportMemoryToFile">Export Memory</v-btn>

          </v-card>
  
          <!-- Dialog für Überschreibwarnung -->
          <v-dialog v-model="showOverwriteConfirmDialog" persistent max-width="40vw">
            <v-card>
              <v-card-title class="text-h5">Überschreibungswarnung</v-card-title>
              <v-card-text>Sie sind dabei, Daten im Speicher zu überschreiben. Möchten Sie fortfahren?</v-card-text>
              <v-card-actions>
                <v-btn color="red darken-1" @click="showOverwriteConfirmDialog = false">Abbrechen</v-btn>
                <!--goAhead gives the Permission to overwrite the existing Memory-->
                <v-btn color="green darken-1" @click="() => {goAhead = true;  overWriteMemory();}">Fortfahren</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
  
          <!-- Dialog for importing to big files -->
          <v-dialog width="70vw" v-model="showConfirmDialog" persistent>
            <v-card>
          <v-card-title class="text-h5">Warnung</v-card-title>
          <v-card-text>Die Datei ist um {{overSizeBytes}} Bytes ({{ (overSizeBytes / 1048576).toFixed(2) }} MB) größer als die erlaubten 16MB. Diese werden abgeschnitten. Möchten Sie trotzdem fortfahren?</v-card-text>
          <v-card-actions>
            <v-btn color="red darken-1" @click="showConfirmDialog = false">Abbrechen</v-btn>
            <v-btn color="green darken-1" @click="proceedWithFileImport">Fortfahren</v-btn>
          </v-card-actions>
            </v-card>
          </v-dialog>

      <v-col cols="">
        <v-btn color="red" @click="memStore.deleteData">Clear Memory</v-btn>     
      </v-col>  
    </v-col> 
    </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {useMemoryStore} from '@/store/MemoryStore'
import MemoryList from './ReUsable/MemoryList.vue'

//Init Stores
const memStore = useMemoryStore()

//Import Data
let int32Array: Int32Array;

const hexInput = ref("");
const selectedFile = ref<File[]>([]);
const fileSize = ref<number | string>("");  // Anfangs leer
const initialFileSize = ref<number | string>("");  // Speichert die ursprüngliche Dateigröße

const showConfirmDialog = ref(false);  // Zustand des Dialogs
const overSizeBytes = ref(0);  // Wie viele Bytes werden abgeschnitten

const startAddress = ref("");
const endAddress = ref("");

const fileName = ref("");

const showOverwriteConfirmDialog = ref(false);
const goAhead = ref(false)

const updateFileName = () => {
    memStore.setFileName(fileName.value); // Aktualisieren Sie den Dateinamen im Store
}

const validateHexInput = (event: KeyboardEvent, inputName: string) => {
  const allowedKeys = [
    "Backspace", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown",
    "Delete", "End", "Home", "Tab"
  ];

  let inputValue;
  switch (inputName) {
    case 'hexInput':
      inputValue = hexInput.value;
      break;
    case 'startAddress':
      inputValue = startAddress.value;
      break;
    case 'endAddress':
      inputValue = endAddress.value;
      break;
    default:
      throw new Error('Unbekannter Eingabetyp');
  }

  if (
    (event.key >= "0" && event.key <= "9") ||
    (event.key >= "a" && event.key <= "f") ||
    (event.key >= "A" && event.key <= "F") ||
    allowedKeys.includes(event.key)
  ) {
    if (inputValue.length >= 6 && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  } else {
    event.preventDefault();
  }
};


watch(selectedFile, (newValue) => {
  if (newValue.length === 0) {
    fileSize.value = "";
    initialFileSize.value = "";
    hexInput.value = ""
  }
});

const updateFileSize = () => {
  if (selectedFile.value[0]) {
    fileSize.value = selectedFile.value[0].size;
    initialFileSize.value = selectedFile.value[0].size;
  }
};

const validateFileSize = () => {
  if (parseInt(fileSize.value as string) > parseInt(initialFileSize.value as string)) {
    fileSize.value = initialFileSize.value;
  } else if (parseInt(fileSize.value as string) < 0) {
    fileSize.value = "0";
  }
};

const handleFileChange = () => {
  const file = selectedFile.value[0];
  if (file) {
    const maxBytes = 16777216 * 4; // 16MB

    // Überprüfen Sie, ob die tatsächliche Dateigröße maxBytes übersteigt
    if (file.size > maxBytes) {
      overSizeBytes.value = file.size - maxBytes;
      showConfirmDialog.value = true;
      return; 
    }

    proceedWithFileImport();
  }
};

const proceedWithFileImport = () => {
showConfirmDialog.value = false;  // Schließen Sie den Dialog

const file = selectedFile.value[0];
const maxBytes = 16777216 * 4; // 16MB
const allowedBytes = parseInt(fileSize.value as string);

const reader = new FileReader();

reader.onload = (e) => {
  const buffer = e.target?.result as ArrayBuffer;
  const byteLength = buffer.byteLength;

  // Erstelle ein Int32Array der notwendigen Größe
  const intArrayLength = Math.ceil(byteLength / 4);
  int32Array = new Int32Array(intArrayLength);

  const dataView = new DataView(buffer);

  // Fülle das Int32Array
  for (let i = 0; i < intArrayLength; i++) {
    const byteOffset = i * 4;

    // Wenn es mindestens 4 verbleibende Bytes gibt, lese sie als Int32
    if (byteOffset + 3 < byteLength) {
      int32Array[i] = dataView.getInt32(byteOffset, true);
    } else {
      let value = 0;

      for (let j = 0; j < 4; j++) {
        if (byteOffset + j < byteLength) {
          value |= (dataView.getUint8(byteOffset + j) << (j * 8));
        }
      }
      int32Array[i] = value;
    }
  }

  //check if the area is not empty alert the User if he wants to Continue to overwrite memory Data
  overWriteMemory()
};

  // Zuerst abschneiden, wenn die Datei größer als 16MB ist
  const actualBytesToRead = Math.min(file.size, maxBytes);
  
  // Dann weiter abschneiden, basierend auf dem fileSize-Wert
  const finalBytesToRead = Math.min(actualBytesToRead, allowedBytes);
  
  reader.readAsArrayBuffer(file.slice(0, finalBytesToRead));
};

const overWriteMemory = () =>{
    //check if the area is not empty alert the User if he wants to Continue to overwrite memory Data
    if(memStore.checkIsMemoryAreaEmpty(int32Array.length, hexInput.value)){
    memStore.setMemoryFromFileInput(int32Array, hexInput.value);
  }else{
    showOverwriteConfirmDialog.value = true
    if(goAhead.value == true){
      memStore.setMemoryFromFileInput(int32Array, hexInput.value);
      showOverwriteConfirmDialog.value = false
      goAhead.value = false
    }
  }
}

const exportMemoryToFile = () => {
  const startIdx = parseInt(startAddress.value, 16);
  const endIdx = parseInt(endAddress.value, 16);

  if (startIdx > endIdx || startIdx < 0 || endIdx >= memStore.getRawMemory().byteLength) {
    console.error("Ungültige Adressbereiche.");
    return;
  }

  const dataToExport = memStore.exportMemoryRange(startIdx, endIdx);
  const blob = new Blob([dataToExport], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = memStore.getFileName();
  memStore.setFileName("")

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
};


</script>
