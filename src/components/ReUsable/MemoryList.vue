<template>
  <v-card variant="outlined">
    <v-container class="pt-1 pb-0">
    <v-row align="center">
      <!--Left Buttons-->
      <v-col cols="3" class="d-flex align-center justify-start">
        <v-btn icon @click="goToFirstPage">
          <v-icon>mdi-skip-previous</v-icon>
        </v-btn>
        <v-btn icon @click="prevPage" class="ml-2">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-col>

      <!--Adress Input-->
      <v-col cols="6">
        <v-text-field
          v-model="jumpAddress"
          label="Jump to Address"
          outlined
          density="compact"
          hint="Hex-Format eingeben (z.B. '00FFFF')"
          persistent-hint
          @keydown="validateHexInput"
          @keyup="goToAddress"
          clearable
        ></v-text-field>
      </v-col>

      <!--Right Buttons-->
      <v-col cols="3" class="d-flex align-center justify-end">
        <v-btn icon @click="nextPage" class="mr-2">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn icon @click="goToLastPage">
          <v-icon>mdi-skip-next</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
  <!--Tabelle-->
  <v-table fixed-header :density="denseVersion as any" @wheel="handleWheel">
    <thead>
      <tr>
        <th class="text-center" style="width: 20%">{{ $t('memory.address') }}</th>
        <th class="text-center" style="width: 20%">{{ $t('memory.decimal') }}</th>
        <th class="text-center" style="width: 60%" @click="toggleFormat">Hex/BIN</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, index) in memStore.getMemory()"
        :key="item.name"
        :class="{ 'marked-row': isMarkedRow(getCurrentPage(index)) }"
        @dblclick="selectItem(item, index)"
      >
        <td style="width: 20%; text-align: center;">{{ toHex(getCurrentPage(index)) }}</td>
        <td style="width: 20%; text-align: center;">{{ item }}</td>
        <td style="width: 60%; text-align: center;">{{ displayFormat === 'hex' ? '0x' + toHex(item) : toBinary(item) }}</td>
      </tr>
    </tbody>
</v-table>
    <v-card-text class="text-center py-2 text-lg">
        {{ $t('memory.page') }} {{ page }} {{ $t('memory.from') }} {{ totalPages }}
    </v-card-text>
</v-card>

  <!-- Detailansicht Dialog/Karte -->
  <v-dialog v-model="detailViewVisible" persistent max-width="23vw" min-width="500px">
    <v-card>
      <v-card-title class="headline">Details</v-card-title>
      <v-card-text>
        <div>Aktueller Wert: {{ selectedItem.value }}</div>
        <div class="mb-3">Aktuelle Adresse: {{ toHex(getCurrentPage(selectedItem.index))}}</div>
        <Dec_Hex_Bin_Inputs
        :newItemValueDec="newItemValueDec"
        :newItemValueHex="newItemValueHex"
        :newItemValueBin="newItemValueBin"
        @update:dec="newItemValueDec = $event"
        @update:hex="newItemValueHex = $event"
        @update:bin="newItemValueBin = $event"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="cancel">{{ $t('button.cancel') }}</v-btn>
        <v-btn color="primary" @click="updateItem">{{ $t('button.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useMemoryStore } from '@/store/MemoryStore';
import { ref, computed } from 'vue';
import Dec_Hex_Bin_Inputs from './Dec_Hex_Bin_Inputs.vue';

const props = defineProps({
    mode: {
        type: String,
        required: true
    },
    denseVersion: {
        type: String,
        required: false,
        default: "comfortable", // Stellen Sie sicher, dass dies einer der erlaubten Werte ist
    }
});

const memStore = useMemoryStore();
const PAGE_SIZE = memStore.getPageSize();
const displayFormat = ref('hex');  // 'hex' oder 'bin'
const jumpAddress = ref("");

const markedAddress = ref(-1); // -1 bedeutet, dass keine Adresse markiert ist

// Zustand für die Detailansicht
const selectedItem = ref({ index: 0, value: 0 });
const newItemValueDec = ref('');
const newItemValueHex = ref('');
const newItemValueBin = ref('');
const detailViewVisible = ref(false);

// Funktion zum Auswählen eines Elements
const selectItem = (item: any, index: any) => {
  selectedItem.value = { index, value: item };
  newItemValueDec.value = ''; // Zurücksetzen des neuen Wertes
  detailViewVisible.value = true;
};

const cancel = () =>{
  newItemValueDec.value = ''
  newItemValueHex.value = ''
  newItemValueBin.value = ''
  detailViewVisible.value = false;
}

// Funktion zum Aktualisieren des Elements
const updateItem = () => {
  if (selectedItem.value.index !== null) {
    // Aktualisieren Sie den Wert im Speicher
    memStore.updateMemory(getCurrentPage(selectedItem.value.index), parseInt(newItemValueDec.value));
    detailViewVisible.value = false;
  }
};


let page = ref(1); // Hier definieren wir die lokale Referenz 'page'
if (props.mode === "memory") {
    page.value = memStore.getMemoryPage(); // Wir binden die Referenz an die entsprechende Funktion
} else {
    page.value = memStore.getDebuggerPage();
}

const getCurrentPage = (index: number) =>{
  let p = index + ((page.value-1) * memStore.getPageSize())
  return p
}

function prevPage() {
  if (page.value > 1) { 
    page.value--;
    memStore.setMemoryPage(page.value)
  }
}

function nextPage() {
  if (page.value < totalPages.value) { 
    page.value++;
    memStore.setMemoryPage(page.value)
  }
}

function goToFirstPage() {
  page.value = 1; // Die erste Seite ist 1
  memStore.setMemoryPage(page.value); // Aktualisieren des Werts im Store
}

function goToLastPage() {
  page.value = totalPages.value; // Gehen Sie zur letzten Seite
  memStore.setMemoryPage(page.value); // Aktualisieren des Werts im Store
}

function isMarkedRow(addressIndex: number) {
  return addressIndex === markedAddress.value;
}

function goToAddress() {
  const addressInt = parseInt(jumpAddress.value, 16); 
  if (!isNaN(addressInt)) {
    const targetPage = Math.ceil(addressInt / PAGE_SIZE);
    if (targetPage > 0 && targetPage <= totalPages.value) {
      page.value = targetPage
      markedAddress.value = addressInt; // Markierung setzen
      setTimeout(() => markedAddress.value = -1, 5000);
      if (props.mode === "memory") {
            memStore.setMemoryPage(page.value); // Wir binden die Referenz an die entsprechende Funktion
        } else {
            memStore.setDebuggerPage(page.value);
        }
    }
  }else if (jumpAddress.value === "") {
    // Wenn das Eingabefeld leer ist, kehren Sie zur ersten Seite zurück oder zu einer Standardseite Ihrer Wahl
    page.value = 1;
    markedAddress.value = -1;
  }
}

function toHex(value: number): string {
  if (value < 0) {
    value = 0xFFFFFFFF + value + 1; // Umwandlung in das Zweierkomplement
  }
  
  let hex = value.toString(16).toUpperCase(); // Umwandlung in eine Hexadezimalzeichenfolge
  while (hex.length < 6) { // Stellen sicher, dass die Länge der Zeichenfolge 8 beträgt
      hex = '0' + hex;
  }
  
  return hex; // Rückgabe mit dem "0x" Präfix
}

function toBinary(value: number): string {
    if (value >= 0) {
        let bin = value.toString(2);
        while (bin.length < 32) { // Stellen Sie sicher, dass der binäre String immer 32 Zeichen lang ist
            bin = '0' + bin;
        }
        return bin.replace(/(\d{8})/g, '$1 ').trim();  // Fügt nach 8 Bits ein Leerzeichen ein
    } else {
        // Berechnung des Zweierkomplements und Rückgabe des binären Strings
        return (Math.pow(2, 32) + value).toString(2).replace(/(\d{8})/g, '$1 ').trim();
    }
}

const validateHexInput = (event: KeyboardEvent) => {
  const allowedKeys = [
    "Backspace", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown",
    "Delete", "End", "Home", "Tab"
  ];

  // Prüft, ob die gedrückte Taste eine gültige hexadezimale Eingabe ist
  const isHexInput = /^[0-9a-fA-F]$/.test(event.key);

  // Wenn es sich um eine ungültige hexadezimale Eingabe handelt, verhindere die Eingabe
  if (!isHexInput && !allowedKeys.includes(event.key)) {
    event.preventDefault();
    return;
  }

  // Verhindert die Eingabe weiterer Zeichen, wenn die Länge bereits 6 erreicht hat
  if (jumpAddress.value !== null && jumpAddress.value.length >= 6 && !allowedKeys.includes(event.key)) {
    event.preventDefault();
  }
};

// Anzahl der Gesamtseiten berechnen
const totalPages = computed(() => {
  return Math.ceil(16777216 / PAGE_SIZE);
});

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  if (event.deltaY > 0) {
    nextPage();
  } else if (event.deltaY < 0) {
    prevPage();
  }
}

function toggleFormat() {
  displayFormat.value = displayFormat.value === 'hex' ? 'bin' : 'hex';
}
</script>

<style scoped>
.text-lg {
    font-size: 1.10rem; /* oder jede andere Größe, die Sie bevorzugen */
}

.marked-row {
  background-color: #f0f0f0; /* Ihre bevorzugte Farbe für die Hervorhebung */
}
</style>
