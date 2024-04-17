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
    rootTag="div" 
    wrapTag="div" 
    itemTag="div"  
    class="virtual-table"
  >
    <template #header>
      <div class="virtual-table-header">
        <div v-for="header in fullHeaders" :key="header.key" class="virtual-table-header-cell">
          {{ header.label }}
        </div>
      </div>
    </template>
    <template #item="{ record, index, dataKey }">
      <div class="virtual-table-row">
        <!--Breakpoint-->
        <div class="virtual-table-cell" width="100vw" @click.stop="record.breakpoint = !record.breakpoint">
          <v-icon v-if="record.breakpoint" color="red">mdi-record</v-icon>
          <p v-else>&nbsp;</p>
        </div>
        <!--Label-->
        <div class="virtual-table-cell">
          <v-text-field @change="controlTable.updateTable()" v-model="record.label" dense solo-inverted hide-details></v-text-field>
        </div>
        <!--Adress-->
        <div class="virtual-table-cell">
          {{ record.adress = index }}
        </div>
        <div class="virtual-table-cell" @click="update(record, record.registerA)">
          <v-select
              :hide-details="true"
              density="compact"
              variant="outlined"
              menu-icon=""
              :items="['-', ...multiplexerStore.muxA]"
              v-model="record.AluSelA"
              return-object
              @update:modelValue="update(record, null)"
            >
          </v-select>
        </div>
        <div class="virtual-table-cell" @click="update(record, record.registerB)">
          <v-select
              :hide-details="true"
              density="compact"
              variant="outlined"
              menu-icon=""
              :items="['-', ...multiplexerStore.muxB]"
              v-model="record.AluSelB"
              return-object
              @update:modelValue="update(record, null)"
            >
          </v-select>
        </div>
        <!--MDRSel-->
        <div class="virtual-table-cell cursor-pointer" @click.stop="update(record,null,null,'MDRSel')">{{ +record.MDRSel }}</div>
        <!--HsCs-->
        <div class="virtual-table-cell cursor-pointer" @click.stop="update(record,null,null,'HsCs')">{{ +record.HsCs }}</div>
        <!--Hs_R_W-->
        <div class="virtual-table-cell cursor-pointer" @click.stop="update(record,null,null,'Hs_R_W')">{{ +record.Hs_R_W }}</div>
        <!--ALU-->
        <div class="virtual-table-cell">
          <v-select
              :hide-details="true"
              density="compact"
              menu-icon=""
              variant="outlined"
              :items="['-', ...aluStore.aluOperationsListAdded]"
              v-model="record.AluCtrl"
              @update:modelValue="update(record, null)"
            >
            </v-select>
        </div>
        <!--Register-->
        <div v-for="register in record.registerWrite" :key="register.title" class=" virtual-table-cell center pointer pr-0 pl-0 text-center" @click.stop="update(record, register)">
                <p>{{ register.isActive ? 1 : 0 }}</p>
        </div>
        <!--ALU == 0?-->
        <div class="virtual-table-cell" @click.stop="openDialog(record)">
            <p v-if="record.jump === null">{{ record.jump !== null ?  record.jump.adress : "-"}}</p>
            <div class="flex flex-col">
              <p v-if="record.jump !== null && record.jumpSet === true">1</p>
              <p v-if="record.jump !== null && record.jumpSet === true">0</p>
            </div>
          </div>
          <!--Next-->
          <div class="virtual-table-cell pr-0 pl-0 text-center">
            <div class="flex flex-col">
              <p v-if="record.jump !== null">{{ record.jump.adress }}</p>
              <p v-if="true">{{ typeof record.next === 'object' && record.next !== null ? record.next.adress : record.next }}</p>
            </div>
          </div>
           <!-- description -->
           <div class="virtual-table-cell pr-0 pl-2">
            <div v-if="record.description.length > 0">
              <p v-for="(d, index) in record.description" :key="index">{{ d }}</p>
            </div>
            <div v-else>
              <p>&nbsp;</p>
            </div>
          </div>
          <!-- Aktionen -->
          <div class=" virtual-table-cell pr-0 pl-0">
            <div class="d-flex flex-row justify-end">
              <v-tooltip text="Write Comment">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" class="mr-5">mdi-text-box-edit</v-icon>
                </template>
              </v-tooltip>

              <v-icon @click.stop="controlTable.deleteRow(index)" color="red">mdi-delete</v-icon>
            </div>
          </div>
          <i id="drag" class="drag">drag me</i>
      </div>
    </template>
  </VirtualList>
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
    "Br",
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
    "RT-Notation",
    "Action"
];

// Hole die Titel der Register aus dem 'registerStore'
const registerTitles = registerStore.registerOrder.map((r:any) => r.title);

// Füge die Register-Titel zwischen den festen Header-Teilen ein
const fullH = headers.concat(registerTitles).concat(trailingHeaders);
const fullHeaders = fullH.map(header => ({
    key: header,  // Use the header as the key
    label: header  // Use the header as the label, too
}));

console.log(fullHeaders);

const handleDrop = (event: any) => {
  console.log(event);
  console.log('change');
  controlTable.updateTable();
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

</script>

<style scoped>
.pointer{
  cursor: pointer;
}
.virtual-table-header, .virtual-table-row {
  display: flex;
}
.virtual-table-header-cell, .virtual-table-cell {
  
  padding: 10px;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>