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
              @click="editElement('A', element, index)"
              >
              <div class="d-flex justify-space-between align-center">
                <div class="text-no-wrap">{{ formatBinary(index) }}</div>
                <div class="mx-4">{{ element }}</div>
                <div v-if="isNumber(element)">{{ formatHex(element) }}</div>
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
            <v-radio label="Zahl" value="number"></v-radio>
          </v-radio-group>

          <!-- Dropdown-Menü für Register, wenn 'register' ausgewählt ist -->
          <v-select
            v-if="selectType === 'register'"
            :items="registers"
            label="Register auswählen"
            v-model="selectedRegister"
            clearable
          ></v-select>

          <!-- Eingabefeld für Zahlen, wenn 'number' ausgewählt ist -->
          <Dec_Hex_Bin_Inputs
            v-if="selectType === 'number'"
            :numberInput="numberInput"
            @update:dec="numberInput = $event"
            @inputCleared="handleInputCleared"
            />
          <!-- Buttons zum Hinzufügen zum Multiplexer A oder B -->
          <v-btn @click="addToMux('A')">Zu MuxA hinzufügen</v-btn>
          <v-btn @click="addToMux('B')">Zu MuxB hinzufügen</v-btn>
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
              @click="editElement('B', element, index)"
              >
              <div class="d-flex justify-space-between align-center">
                <div class="text-no-wrap">{{ formatBinary(index) }}</div>
                <div class="mx-4">{{ element }}</div>
                <div v-if="isNumber(element)">{{ formatHex(element) }}</div>
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
import {ref} from 'vue'
import Dec_Hex_Bin_Inputs from './ReUsable/Dec_Hex_Bin_Inputs.vue';

const muxStore = useMultiplexerStore();
const registerStore = useRegisterStore();
const listMuxB = muxStore.muxB;
const listMuxA = muxStore.muxA;

// Daten für das Dropdown-Menü
const registers = registerStore.registerOrder.map((reg: any) => reg.registerName);
const selectType = ref('register');
const selectedRegister = ref('');
const numberInput = ref(0);

function addToMux(mux: string) {
  let value: string | number = '';
  if(selectType.value === 'register'){
    value = selectedRegister.value;
  }
  console.log("selected Register: " + selectedRegister.value)
  // Wenn der Typ 'number' ist, konvertieren Sie den Wert explizit in eine Zahl
  if (selectType.value === 'number') {
    value = Number(numberInput.value);
  }

  if (value === '' || value === null || value === undefined) return;
  muxStore.addRegisterToMux(mux, value);
  selectedRegister.value =''; // Reset selected Register
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

function editElement(mux: string, element: number, index: number) {
  if(isNumber(element)) {
    selectType.value = 'number';
    numberInput.value = element;
  }else{
    selectType.value = 'register';
    selectedRegister.value = element;
  }
}

// Helper functions
const isNumber = (value: unknown): value is number => typeof value === 'number';

const formatBinary = (value: number): string => value.toString(2).padStart(6, '0');

const formatHex = (value: number): string => '0x' + value.toString(16).toUpperCase().padStart(8, '0');

</script>