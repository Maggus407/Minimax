<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <div class="d-flex flex-row align-center" v-once>
    <v-tooltip open-delay="500" text="Add Row">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" @click="addNewRow()" color="green" size="42" class="pt-0 mr-10">mdi-plus-box</v-icon>
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
        label="Number of rows to add"
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
      <DataTable
        :key="tableKey"
        :value="table"
        v-memo="[table.length]"
        scrollable
        resizableColumns
        showGridlines 
        tableStyle="min-width: 50rem"
        dataKey="id"
        columnResizeMode="expand"
        scrollHeight="91vh"
        :virtualScrollerOptions="{itemSize: 57,}"
      >
            <Column field="breakpoint" header="BR" max-width="200%">
              <template #body="slotProps">
                <div @click="slotProps.data.breakpoint = !slotProps.data.breakpoint" class="text-center">
                  <v-icon v-if="slotProps.data.breakpoint" color="red">mdi-record</v-icon>
                  <p v-else>&nbsp;</p>
                </div>
              </template>
            </Column>
            <Column field="label" header="Label">
              <template #body="slotProps">
                  <v-text-field v-model="slotProps.data.label" dense solo-inverted hide-details></v-text-field>
              </template>
            </Column>
            <Column field="adress" header="Adress">
              <template #body="slotProps">
                <div class="text-center">{{ slotProps.data.adress }}</div>
              </template>
            </Column>
            <Column field="AluSelA" header="AluSelA">
              <template #body="slotProps">
                <v-select
                  :hide-details="true"
                  density="compact"
                  variant="outlined"
                  menu-icon=""
                  :items="['-', ...multiplexerStore.muxA]"
                  v-model="slotProps.data.AluSelA"
                  return-object
                  @update:modelValue="update(slotProps.data, null)"
                ></v-select>
              </template>
            </Column>
            <Column field="AluSelB" header="AluSelB">
              <template #body="slotProps">
                <v-select
                  :hide-details="true"
                  density="compact"
                  variant="outlined"
                  menu-icon=""
                  :items="['-', ...multiplexerStore.muxB]"
                  v-model="slotProps.data.AluSelB"
                  return-object
                  @update:modelValue="update(slotProps.data, null)"
                ></v-select>
              </template>
            </Column>
            <Column field="MDRSel" header="MDRSel">
              <template #body="slotProps">
                <div @click.stop="update(slotProps.data,null,null,'MDRSel')">
                  {{ +slotProps.data.MDRSel }}
                </div>
              </template>
            </Column>
            <Column field="HsCs" header="HsCs">
              <template #body="slotProps">
                <div @click.stop="update(slotProps.data,null,null,'HsCs')">
                  {{ +slotProps.data.HsCs }}
                </div>
              </template>
            </Column>
            <Column field="Hs_R_W" header="Hs_R_W">
              <template #body="slotProps">
                <div @click.stop="update(slotProps.data,null,null,'Hs_R_W')">
                  {{ +slotProps.data.Hs_R_W }}
                </div>
              </template>
            </Column>
            <Column field="AluCtrl" header="AluCtrl">
              <template #body="slotProps">
                <v-select
                  :hide-details="true"
                  density="compact"
                  menu-icon=""
                  variant="outlined"
                  :items="['-', ...aluStore.aluOperationsListAdded]"
                  v-model="slotProps.data.AluCtrl"
                  @update:modelValue="update(slotProps.data, null)"
                ></v-select>
              </template>
            </Column>
            <Column v-for="r in registerStore.registerOrder" :field="r.title" :header="r.title">
              <template #body="slotProps">
                
              </template>
            </Column>
      </DataTable>
  <v-dialog v-model="dialog" persistent max-width="30vw">
    <v-card>
      <v-card-title>Sprung-Einstellungen</v-card-title>
      <v-card-text>
        <v-radio-group v-model="selectedJumpType">
          <v-radio label="Nächster Befehl" value="next"></v-radio>
          <v-radio label="Unbedingter Sprung" value="unconditional"></v-radio>
          <v-radio label="Bedingter Sprung" value="conditional"></v-radio>
        </v-radio-group>
        <div v-if="selectedJumpType === 'next'"></div>
        <div v-if="selectedJumpType === 'unconditional'" class="d-flex flex-row">
          <v-text-field
            label="Unbedingter Sprung"
            type="number"
            v-model="unconditionalJump"
            :max="controlTable.controlTable.length - 1"
            :min="0"
            class="mr-3"
            width="50%"
          ></v-text-field>
          <v-select
            label="Label"
            :items="formattedItems"
            return-object
            v-model="uncond_Object"
            item-title="displayText"
            width="50%"
          ></v-select>
        </div>
        <div v-if="selectedJumpType === 'conditional'">
          <div class="d-flex flex-row">
            <v-text-field
              label="ALU != 0?"
              type="number"
              v-model="conditionalJumpIfNotZero"
              :max="controlTable.controlTable.length - 1"
              :min="0"
              :rules="[requiredRule]"
              class="mr-3"
              width="50%"
            ></v-text-field>
            <v-select
              label="Label"
              :items="formattedItems"
              return-object
              v-model="cond_IfNotZeroObject"
              item-title="displayText"
              width="50%"
            ></v-select>
          </div>
          <div class="d-flex flex-row">
            <v-text-field
              label="ALU == 0?"
              type="number"
              v-model="conditionalJumpIfZero"
              :max="controlTable.controlTable.length - 1"
              :min="0"
              :rules="[requiredRule]"
              class="mr-3"
              width="50%"
            ></v-text-field>
            <v-select
              label="Label"
              :items="formattedItems"
              return-object
              v-model="cond_IfZeroObject"
              item-title="displayText"
              width="50%"
            ></v-select>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="closeDialog">Abbrechen</v-btn>
        <v-btn color="green darken-1" @click="applyJumpSettings" :disabled="isOkButtonDisabled">
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogComment" max-width="30vw" persistent>
    <v-card prepend-icon="mdi-text-box-edit" title="Comments">
      <template v-slot:actions>
        <v-btn class="ms-auto" text="Ok" @click="closecommentDialog()"></v-btn>
      </template>
      <v-textarea class="pa-3" v-model="currentComment" clearable label="Comment" variant="outlined"></v-textarea>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useAluStore } from '@/store/AluStore';
import { ref, computed, watch} from 'vue';
import { useDebugerStore } from '@/store/DebugerStore';
import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import 'primevue/resources/themes/aura-light-green/theme.css';

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const deb = useDebugerStore();
const aluStore = useAluStore();

const table = ref(controlTable.controlTable);
const selectedRow = ref<any | null>(null);
const selectedJumpType = ref('next');

const inputAdresse = ref<string>('');
const numberOfRows = ref<string>('');

const currentComment = ref('');
const dialog = ref(false);
const dialogComment = ref(false);

const unconditionalJump:any = ref(null);
const conditionalJumpIfZero:any = ref(null);
const conditionalJumpIfNotZero:any = ref(null);

//Label Objects
const uncond_Object:any = ref(null);
const cond_IfZeroObject:any = ref(null);
const cond_IfNotZeroObject:any = ref(null);

const tableKey = ref(0);

// Funktion zum Hinzufügen einer neuen Zeile
function addNewRow() {
  controlTable.addRow();
  tableKey.value++; // Increment the key to force a re-render
}

// Watcher für Label Objects
watch(uncond_Object, (newValue) => {
  if (newValue) {
    unconditionalJump.value = newValue.value;
  }
});

watch(cond_IfZeroObject, (newValue) => {
  if (newValue) {
    conditionalJumpIfZero.value = newValue.value;
  }
});

watch(cond_IfNotZeroObject, (newValue) => {
  if (newValue) {
    conditionalJumpIfNotZero.value = newValue.value;
  }
});

const highlightQuestionMarks = (str:any) => {
  const regex = /(\?\?\?)/g
  const parts = str.split(regex)

  return parts.map((part:any, index:any) => {
    if (part.match(regex)) {
      return `<span style="color: red;">${part}</span>`
    } else {
      return part
    }
  }).join('')
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

function setRows(){
  for(let i = 0; i < Number(numberOfRows.value); i++){
    controlTable.placeRowBetween(Number(inputAdresse.value)+1);
  }
  tableKey.value++;
}

// Function to toggle the textarea
const toggleTextarea = (element: any) => {
  dialogComment.value = true;
  selectedRow.value = element;
  currentComment.value = element.comment;
};

function closecommentDialog(){
  selectedRow.value.comment = currentComment.value;
  dialogComment.value = false;
  console.log(selectedRow.value)
  selectedRow.value = null;
}

const rowsForSelection = computed(() => {
  return controlTable.controlTable
    .filter((row:any) => row.label !== '' && row.label !== undefined && row.label !== null)
    .map((row:any) => ({ title: row.label, value: row.adress, displayText: `${row.label} (${row.adress})` }))
})

// Formatierte Elemente für v-select
const formattedItems = computed(() => rowsForSelection.value)
console.log(formattedItems)

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
  if(selectedRow.value.jumpSet && selectedRow.value.jump == null){
    //unconditionalJump.value = selectedRow.value.next.adress
    uncond_Object.value = selectedRow.value.next.label !== '' && selectedRow.value.next.label !== undefined ? {title:selectedRow.value.next.label, value: selectedRow.value.next.adress, displayText: `${selectedRow.value.next.label} (${selectedRow.value.next.adress})` } : null
  }
  if(selectedRow.value.jumpSet && selectedRow.value.jump !== null){

  }
  console.log(selectedRow.value);
}

function closeDialog() {
  dialog.value = false;
  unconditionalJump.value = null;
  conditionalJumpIfZero.value = null;
  conditionalJumpIfNotZero.value = null;
  uncond_Object.value = null;
  cond_IfNotZeroObject.value = null;
  cond_IfZeroObject.value = null;
}

function applyJumpSettings() {

console.log("unconditionalJump: " + unconditionalJump)
console.log("conditionalJumpIfZero: " + conditionalJumpIfZero)
console.log("conditionalJumpIfNotZero: " + conditionalJumpIfNotZero)

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
  closeDialog()
}

// Hilfsfunktion, um eine Reihe anhand ihrer ID zu finden
function findRowById(adress: any) {
  return controlTable.getNextRowById(adress);
}
</script>

<style lang="scss" scoped>
.pointer{
  cursor: pointer;
}

.red {
  color: red;
}

</style>