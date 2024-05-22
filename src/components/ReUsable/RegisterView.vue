<template>
    <v-card variant="outlined" class="mt-1 pl-0 pr-0">
        <v-card-title>
            Register
        </v-card-title>
        <v-card-text class="pl-0 pr-0">
            <v-table 
                fixed-header
                density="compact"
                height="30.3vh"
                class="pl-0 pr-0"
            >
            <thead>
                <tr>
                    <th class="pl-0 text-center pr-0">
                        Name
                    </th>
                    <th class="pl-0 text-center pr-0">
                        Value
                    </th>
                    <th class="pl-0 text-center pr-0">
                        Hexadecimal
                    </th>
                    <th>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(data, index) in registerStore.registerOrder"
                    :key="data.id"
                    :class="{ 'marked-row': index === markedAddress }"
                    @dblclick="changeValue(data.title, data.Value, index)"
                >
                    <td class="pl-0 text-center pr-0">{{ data.title }}</td>
                    <td class="pl-0 text-center pr-0">{{ data.Value }}</td>
                    <td class="pl-0 text-center pr-0">0x{{ toHex(data.Value) }}</td>
                    <td width="10vw">
                        <v-icon @click="changeValue(data.title, data.Value, index)">mdi-pencil</v-icon>
                    </td>
                </tr>
            </tbody>
            </v-table>
        </v-card-text>
    </v-card>
    <v-dialog v-model="detailViewVisible" persistent max-width="23vw" min-width="500px">
        <v-card>
            <v-card-title>
                Register: {{ currentRegister }}
            </v-card-title>
            <v-card-text>
                <div class="pt-3 pb-3">{{ $t('generell.currentValue') }}: {{ currentRegisterValue }}</div>
                <Dec_Hex_Bin_Inputs
                    :numberInput="Number(numberInput)"
                    @update:dec="numberInput = $event"
                    @inputCleared="handleInputCleared"
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
import { useRegisterStore } from '@/store/RegisterStore';
import Dec_Hex_Bin_Inputs from './Dec_Hex_Bin_Inputs.vue';
import { ref, watch } from 'vue';

const registerStore = useRegisterStore();
const numberInput = ref(0);
const detailViewVisible = ref(false);
const currentRegister = ref("");
const currentRegisterValue = ref(0);
const markedAddress = ref(-1); // -1 bedeutet, dass keine Adresse markiert ist

function toHex(value: any): string {
  if (value < 0) {
    value = 0xFFFFFFFF + value + 1; // Umwandlung in das Zweierkomplement
  }

  let hex = value.toString(16).toUpperCase(); // Umwandlung in eine Hexadezimalzeichenfolge
  while (hex.length < 6) { // Stellen sicher, dass die Länge der Zeichenfolge 6 beträgt
    hex = '0' + hex;
  }
  return hex; // Rückgabe der Hexadezimalzeichenfolge
}

const handleInputCleared = () => {
  numberInput.value = 0;
};

function cancel() {
  detailViewVisible.value = false;
  handleInputCleared();
}

function updateItem() {
  detailViewVisible.value = false;
  if (numberInput.value == null || numberInput.value == undefined) {
    numberInput.value = 0;
  }
  registerStore.updateRegisterData(currentRegister.value, numberInput.value, registerStore.getRegisterDescription(currentRegister.value));
}

function changeValue(data: any, value: any, index: any) {
  detailViewVisible.value = true;
  currentRegister.value = data;
  numberInput.value = value;
  currentRegisterValue.value = value;
  markedAddress.value = index; // Setze die Markierung
}

// Beobachte den Zustand des Dialogs und entferne die Markierung, wenn der Dialog geschlossen wird
watch(detailViewVisible, (newVal) => {
  if (!newVal) {
    markedAddress.value = -1; // Entferne die Markierung
  }
});
</script>

<style scoped>
.marked-row {
    background-color: #1867C0; /* Dunkles Blau */
  }
  </style>

  