<template>
  <v-row>
  <!-- Multiplexer A -->
  <v-col cols="12" md="4" class="order-md-1 order-sm-2">
    <v-card title="Multiplexer A" height="95vh" style="overflow-y: auto;" variant="outlined">
      <draggable style="height: 85vh;" :list="listMuxA" tag="div" item-key="div" group="items">
        <template #item="{element, index}">
          <div>
            <v-list-item 
              :key="index" 
              three-line
              @click="editElement('A', element)"
              >
              <div class="d-flex justify-space-between align-center">
                <div class="text-no-wrap">{{ formatBinary(index) }}</div>
                <div class="mx-4">{{ element.title }}</div>
                <div v-if="isNumber(element.title)">{{ formatHex(element.Value) }}</div>
                <v-btn icon @click="removeFromMux('A', index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-list-item>
            <v-divider/>
          </div>
        </template>
      </draggable>
    </v-card>
  </v-col>

    <!-- Configuration -->
    <v-col cols="12" md="4" class="order-md-2 order-sm-1">
      <v-card title="Configuration" height="95vh" variant="outlined">
        <v-container>
          <!-- Auswahl zwischen Register und Zahlen -->
          <v-radio-group v-model="selectType" row>
            <v-radio label="Register" value="register"></v-radio>
          <!-- Dropdown-Menü für Register, wenn 'register' ausgewählt ist -->
          <v-select
            :disabled="selectType === 'number'"
            :items="registers"
            :item-value="item => item"
            label="Register auswählen"
            v-model="selectedRegister"
            clearable
          ></v-select>
          <v-radio label="Zahl" value="number"></v-radio>
          <!-- Eingabefeld für Zahlen, wenn 'number' ausgewählt ist -->
          <Dec_Hex_Bin_Inputs
            :disabled="selectType === 'number'"
            :numberInput="Number(numberInput)"
            @update:dec="numberInput = $event"
            @inputCleared="handleInputCleared"
          />
          </v-radio-group>
          <!-- Buttons zum Hinzufügen zum Multiplexer A oder B -->
          <v-btn @click="addToMux('A')">Zu MuxA hinzufügen</v-btn>
          <v-btn @click="addToMux('B')">Zu MuxB hinzufügen</v-btn>
          <v-btn 
            v-if="isEditedElementNumber && editedElement"
            @click="saveChanges"
          >
            Speichern
          </v-btn>
        </v-container>
      </v-card>
    </v-col>

  <!-- Multiplexer B -->
  <v-col cols="12" md="4" class="order-md-3 order-sm-2">
    <v-card title="Multiplexer B" height="95vh" style="overflow-y: auto;" variant="outlined">
      <draggable style="height: 85vh;" :list="listMuxB" tag="div" item-key="div" group="items">
        <template #item="{element, index}">
          <div>
            <v-list-item 
              :key="index" 
              three-line
              @click="editElement('B', element)"
              >
              <div class="d-flex justify-space-between align-center">
                <div class="text-no-wrap">{{ formatBinary(index) }}</div>
                <div class="mx-4">{{ element.title }}</div>
                <div v-if="isNumber(element.title)">{{ formatHex(element.Value) }}</div>
                <v-btn icon @click="removeFromMux('B', index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-list-item>
            <v-divider/>
          </div>
        </template>
      </draggable>
    </v-card>
  </v-col>
  </v-row>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useRegisterStore } from '@/store/RegisterStore';
import Dec_Hex_Bin_Inputs from './ReUsable/Dec_Hex_Bin_Inputs.vue';
import { ref, watch } from 'vue';
import { useControlTableStore } from '@/store/ControlTableStore';

const multiplexerStore = useMultiplexerStore();
const controlTableStore = useControlTableStore();

// Refs für die Kopien der ursprünglichen Werte
const originalMuxA = ref([...multiplexerStore.muxA]);
const originalMuxB = ref([...multiplexerStore.muxB]);

// Watcher, um die ControlTable zu aktualisieren
watch([multiplexerStore.muxA, multiplexerStore.muxB], () => {
  const movedFromA = originalMuxA.value.filter(item => !multiplexerStore.muxA.includes(item));
  const movedFromB = originalMuxB.value.filter(item => !multiplexerStore.muxB.includes(item));

  movedFromA.concat(movedFromB).forEach(movedItem => {
    controlTableStore.controlTable.forEach(row => {
      if (row.AluSelA === movedItem|| row.AluSelB === movedItem) {
        if (row.AluSelA === movedItem) row.AluSelA = null;
        if (row.AluSelB === movedItem) row.AluSelB = null;
      }
    });
  });
}, { deep: true });

const muxStore = useMultiplexerStore();
const registerStore = useRegisterStore();
const listMuxB = muxStore.muxB;
const listMuxA = muxStore.muxA;

// Daten für das Dropdown-Menü
const registers = registerStore.registerOrder;
const selectType = ref('register');
const selectedRegister = ref(null);
const numberInput = ref(0);

//Values for editing existing elements-Value
const editedElement = ref(null);
const isEditedElementNumber = ref(false);

function addToMux(mux: string) {
  let value: any = null;
  if(selectType.value === 'register'){
    value = selectedRegister.value;
    console.log("selected Register: " + selectedRegister);
  }
  console.log("selected Register: " + selectedRegister.value)
  // Wenn der Typ 'number' ist, konvertieren Sie den Wert explizit in eine Zahl
  if (selectType.value === 'number') {
    value = {title: numberInput.value.toString(), Value: Number(numberInput.value)};
  }

  if (value === '' || value === null || value === undefined) return;
  muxStore.addRegisterToMux(mux, value);
  selectedRegister.value = null; // Reset selected Register
}

function removeFromMux(mux: string, index: number) {
  if (mux === 'A') {
    listMuxA.splice(index, 1);
  } else if (mux === 'B') {
    listMuxB.splice(index, 1);
  }
}

const handleInputCleared = () => {
  numberInput.value = 0;
};

function editElement(mux: string, element: any) {
  if (isNumber(element.title)) {
    // Wenn das Element eine Zahl ist, aktualisiere numberInput
    selectType.value = 'number';
    numberInput.value = element.Value;
    selectedRegister.value = null; // Setze selectedRegister zurück
    isEditedElementNumber.value = true;
    editedElement.value = element;
  } else {
    // Wenn das Element ein Register ist, aktualisiere selectedRegister
    selectType.value = 'register';
    selectedRegister.value = element; // Setze selectedRegister auf das ganze Objekt

  }
}

function saveChanges() {
  if(editedElement.value){
    if (editedElement.value) {
      (editedElement.value as { title: string }).title = numberInput.value.toString();
    }
    (editedElement.value as { Value: number }).Value = Number(numberInput.value);
  }
}

// Helper functions
const isNumber = (value: string): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
};

const formatBinary = (value: number): string => value.toString(2).padStart(6, '0');

const formatHex = (value: number): string => '0x' + value.toString(16).toUpperCase().padStart(8, '0');

</script>