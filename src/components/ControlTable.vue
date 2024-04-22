<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <div class="d-flex flex-row align-center mb-2">
    <v-tooltip open-delay="500" text="Add Row">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" @click="addRow()" color="green" size="42" class="pt-0 mr-10">mdi-plus-box</v-icon>
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
  <div ref="table"></div>
  <v-dialog v-model="dialog" persistent max-width="30vw">
    <v-card>
      <v-card-title>
        Sprung-Einstellungen
      </v-card-title>
      <v-card-text>
        <v-radio-group v-model="selectedJumpType">
          <v-radio label="Nächster Befehl" value="next"></v-radio>
          <v-radio label="Unbedingter Sprung" value="unconditional"></v-radio>
          <v-radio label="Bedingter Sprung" value="conditional"></v-radio>
        </v-radio-group>
        <div v-if="selectedJumpType === 'next'" ></div>
          <div v-if="selectedJumpType === 'unconditional'">
            <v-text-field
              label="Unbedingter Sprung"
              type="number"
              v-model="unconditionalJump"
              :max="controlTable.controlTable.length - 1"
              :min="0"
            ></v-text-field>
        </div>
        <div v-if="selectedJumpType === 'conditional'">
          <v-text-field
            label="ALU != 0?"
            type="number"
            v-model="conditionalJumpIfNotZero"
            :max="controlTable.controlTable.length - 1"
            :min="0"
            :rules="[requiredRule]"
          ></v-text-field>
          <v-text-field
            label="ALU == 0?"
            type="number"
            v-model="conditionalJumpIfZero"
            :max="controlTable.controlTable.length - 1"
            :min="0"
            :rules="[requiredRule]"
          ></v-text-field>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="closeDialog">Abbrechen</v-btn>
        <v-btn
            color="green darken-1"
            @click="applyJumpSettings"
            :disabled="isOkButtonDisabled"
          >
            OK
          </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useAluStore } from '@/store/AluStore';
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import { ref, computed, onMounted, onBeforeUnmount,watch,reactive  } from 'vue';
import { useDebugerStore } from '@/store/DebugerStore';
import { onBeforeMount } from 'vue';
import { v4 as uuidv4 } from 'uuid'

// Interface for control table
interface ControlTable {
  id: string;
  breakpoint: boolean;
  label: string;
  adress: number;
  AluSelA: any;
  AluSelB: any;
  MDRSel: boolean;
  HsCs: boolean;
  Hs_R_W: boolean;
  AluCtrl: any;
  registerWrite: any;
  jump: any;
  jumpSet: boolean;
  next: any;
  description: [];
  comment: string;
}

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const deb = useDebugerStore();
const aluStore = useAluStore();

//const tableData = controlTable.controlTable;
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

const table = ref('table'); //reference to your table element
const data = controlTable.controlTable;
let tabulatorInstance:any = null;
const tableData:any = reactive([]); //data for table to display

onBeforeMount(() => {
  tableData.push(...controlTable.controlTable);
});

onMounted(() => {
    tabulatorInstance = new Tabulator(table.value, {
        data: tableData, //link data to table
        height:"90vh",
        movableRows:true,
        reactiveData:true, //enable data reactivity
        columns:[
          {title:"Adresse", field:"id"},
          {title:"Befehl", field:"command"},
          {title:"ALU", field:"ALU"},
          {title:"MDR", field:"MDR"},
          {title:"MAR", field:"MAR"},
          {title:"IR", field:"IR"},
          {title:"PC", field:"PC"},
          {title:"A", field:"A"},
          {title:"B", field:"B"},
        ],
      });
});
watch(tableData, (newData:any) => {
  controlTable.saveTableData(newData);
}, { deep: true });
    
onBeforeUnmount(() => {
  controlTable.saveTableData(tabulatorInstance.getData());
});

function addRow(){
    const newRow: ControlTable = {
      id: uuidv4(),
      breakpoint: false,
      label: "",
      adress: tableData.length,
      AluSelA: null,
      AluSelB: null,
      MDRSel: false,
      HsCs: false,
      Hs_R_W: false,
      AluCtrl: null,
      registerWrite: [],
      jump: null,
      jumpSet: false,
      next: tableData.length + 1,
      description: [],
      comment: "",
    };

    newRow.registerWrite = registerStore.registerOrder.map((register: any) => {
      return { title: register.title, isActive: false};
    });
    tableData.push(newRow);
    updateAdressesAndNext();
    console.log(controlTable);
  }

  function updateAdressesAndNext() {
    tableData.forEach((row:any, index:any) => {
      if(!row.jumpSet){
        row.adress = index; // Setze die Adresse auf den aktuellen Index
        row.next = index + 1 < tableData.length ? index + 1 : -1; // Setze 'next' auf den nächsten Index oder -1, wenn es das letzte Element ist
      }
    });
  }

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

</script>

<style scoped>
.pointer{
  cursor: pointer;
}

</style>