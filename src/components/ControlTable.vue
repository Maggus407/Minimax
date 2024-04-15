<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <div class="d-flex flex-row align-center">
    <v-tooltip open-delay="500" text="Add Row">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" @click="controlTable.addRow" color="green" size="42" class="pt-0 mr-10">mdi-plus-box</v-icon>
    </template>
    </v-tooltip>
    <!-- Input field for numbers -->
      <v-text-field
        v-model="inputAdresse"
        dense
        label="Add Row after givern Adress: Standard is 0"
        solo-inverted
        hide-details
        clearable
        class="mr-10"
        @keydown="(event: KeyboardEvent) => validateNumber(event, 'inputAdresse')"
      ></v-text-field>
      <v-text-field
        v-model="numberOfRows"
        dense
        label="Number of rows: Standard is 1 - Limit is 10"
        solo-inverted
        hide-details
        clearable
        class="mr-10"
        @keydown="(event: KeyboardEvent) => validateNumber(event, 'numberOfRows')"
      ></v-text-field>
      <!-- Button next to the input field -->
      <v-icon @click="setRows"> mdi-plus-box </v-icon>
  </div>

  <v-divider></v-divider>
    <VirtualList
      v-model="table"
      :dataKey="'id'"
      :handle="'#drag'"
      style="height: 92vh;"
      @drop="handleDrop"
    >
      <template #item="{ record, index, dataKey }">
        <p>{{ record }}</p>
        <v-icon id="drag" class="drag">mdi-drag-horizontal-variant</v-icon>
        <p @click.stop="record.breakpoint = !record.breakpoint">
          <v-icon v-if="record.breakpoint" color="red">mdi-record</v-icon>
          <p v-else>&nbsp;</p>
        </p>
        <p>{{ record.adress = index }}</p>
      </template>
      <template v-slot:header>
        <div class="d-flex flex-row">
          <p class="pa-3" v-for="header in fullHeaders">{{ header }}</p>
        </div>
      </template>
    </VirtualList>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useAluStore } from '@/store/AluStore';
import VirtualList from 'vue-virtual-draglist';
import { ref, computed } from 'vue';
import { useDebugerStore } from '@/store/DebugerStore';

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const deb = useDebugerStore();
const aluStore = useAluStore();

const table = ref(controlTable.controlTable);
const dialog = ref(false);
const selectedRow = ref<any | null>(null);
const selectedJumpType = ref('next');
const unconditionalJump = ref(null);
const conditionalJumpIfZero = ref(null);
const conditionalJumpIfNotZero = ref(null);
const inputAdresse = ref<string>('');
const numberOfRows = ref<string>('');

const currentComment = ref('');
const isCommentDialog = ref(false);

// Definiere den Anfang des Headers bis zu "AluCtrl"
const headers = [
    "Breakpoint",
    "Label",
    "Adress",
    "AluSelA",
    "AluSelB",
    "MDRSel",
    "HsCs",
    "Hs_R_W",
    "AluCtrl"
];

// Definiere den Rest der Header nach den dynamischen Registern
const trailingHeaders = [
    "ALU == 0?",
    "Next",
    "RT-Notation"
];

// Hole die Titel der Register aus dem 'registerStore'
const registerTitles = registerStore.registerOrder.map((r:any) => r.title);

// Füge die Register-Titel zwischen den festen Header-Teilen ein
const fullHeaders = headers.concat(registerTitles).concat(trailingHeaders);

console.log(fullHeaders);

const handleDrop = (event: any) => {
  console.log(event);
  console.log('change');
  controlTable.updateAdressesAndNext();
  console.log(controlTable.controlTable);
};

const validateNumber = (event: KeyboardEvent, field: 'inputAdresse' | 'numberOfRows') => {
  const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', "Backspace", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown",
    "Delete", "End", "Home", "Tab"];
  const maxValue = computed(() => controlTable.controlTable.length);

  if (!validKeys.includes(event.key)) {
    event.preventDefault();
    return;
  }

  if (field === 'inputAdresse') {
    console.log(Number(inputAdresse.value + event.key));
    if (Number(inputAdresse.value + event.key) >= maxValue.value) {
      if ((Number(inputAdresse.value + event.key) > maxValue.value && event.key !== 'Backspace' && event.key !== 'Delete') || (Number(inputAdresse.value + event.key) === maxValue.value && event.key !== 'Backspace' && event.key !== 'Delete')) {
        event.preventDefault();
        return;
      }else{
        inputAdresse.value = inputAdresse.value?.replace(/[^0-9]/g, '') || '';
      }
    }else{
      return;
    }
  } else if (field === 'numberOfRows') {
    numberOfRows.value = numberOfRows.value?.replace(/[^0-9]/g, '') || '';
  }
};

function openCommentDialog(row: any) {
  currentComment.value = row.comment;
  isCommentDialog.value = true;
}

function setRows(){
  for(let i = 0; i < Number(numberOfRows.value); i++){
    controlTable.placeRowBetween(Number(inputAdresse.value)+1);
  }
}

const requiredRule = (value: any) => !!value || 'Erforderlich';

function update(row: any, register: any, alu: any = null, memory: any = null){
  console.log("ALU " + alu);
  if(memory === 'MDRSel'){row.MDRSel = !row.MDRSel};
  if(memory === 'HsCs'){row.HsCs = !row.HsCs};
  if(memory === 'Hs_R_W'){row.Hs_R_W = !row.Hs_R_W};
  if(register != null){register.isActive = !register.isActive};
  deb.executing = false;
  controlTable.create_RT_Notation(row);
}

// Berechnete Eigenschaft, die überprüft, ob der OK-Button aktiviert werden soll
const isOkButtonDisabled = computed(() => {
  // Deaktiviere den Button nur, wenn 'Bedingter Sprung' ausgewählt ist und nicht beide Felder ausgefüllt sind
  return selectedJumpType.value === 'conditional' && (!conditionalJumpIfZero.value || !conditionalJumpIfNotZero.value) || selectedJumpType.value === 'unconditional' && !unconditionalJump.value;
});

function openDialog(row:any) {
  selectedRow.value = row;
  dialog.value = true;
  console.log(selectedRow.value);
}

function closeDialog() {
  dialog.value = false;
}

function applyJumpSettings() {
  if (selectedRow.value) {
    if (selectedJumpType.value === 'next') {
      (selectedRow.value as any).jumpSet = false;
      (selectedRow.value as any).next = null;
      (selectedRow.value as any).jump = null;
      controlTable.updateAdressesAndNext();
    } else if (selectedJumpType.value === 'unconditional') {
      (selectedRow.value as any).jumpSet = true;
      (selectedRow.value as any).next = null;
      (selectedRow.value as any).jump = null;
      (selectedRow.value as any).next = findRowById(unconditionalJump.value);
    } else if (selectedJumpType.value === 'conditional') {
      (selectedRow.value as any).jumpSet = true;
      (selectedRow.value as any).jump = findRowById(conditionalJumpIfZero.value);
      console.log("IF Zero: " + conditionalJumpIfZero.value + " ---- " + selectedRow.value.jump.id);
      (selectedRow.value as any).next = findRowById(conditionalJumpIfNotZero.value);
      console.log("IF Not Zero: " + conditionalJumpIfNotZero.value + " ---- " + selectedRow.value.next.id);
    }
  }
  dialog.value = false;
}

// Hilfsfunktion, um eine Reihe anhand ihrer ID zu finden
function findRowById(adress: any) {
  return controlTable.getNextRowById(adress);
}

function addRowBetween() {

}

</script>

<style scoped>
.pointer{
  cursor: pointer;
}
</style>