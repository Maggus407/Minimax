<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <div class="d-flex flex-row align-center">
    <v-tooltip open-delay="500" text="Add Row">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" @click="controlTable.addRow()" color="green" size="42" class="pt-0 mr-10">mdi-plus-box</v-icon>
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
  <div class="scrollable" @scroll="tableScrolled">
  <v-table
  density="compact"
  fixed-header
  >
      <thead>
          <tr>
            <th class="center pr-0 pl-2">Br</th>
            <th class="center pr-0 pl-1 text-center">Label</th>
            <th class="center pr-0 pl-1 text-center">Adress</th>
            <th class="center pr-0 pl-1 text-center">AluSelA</th>
            <th class="center pr-0 pl-1 text-center">AluSelB</th>
            <th class="center pr-0 pl-1 text-center">MDRSel</th>
            <th class="center pr-0 pl-1 text-center">HsCs</th>
            <th class="center pr-0 pl-1 text-center">Hs_R_W</th>
            <th class="center pr-0 pl-1 text-center">AluCtrl</th>
            <th v-for="r in registerStore.registerOrder" :key="r.title" class="pr-0 pl-1 text-center">
                {{ r.title }}
            </th>
            <th class="center pr-0 pl-1 text-center">ALU == 0?</th>
            <th class="center pr-0 pl-1 text-center">Next</th>
            <th class="center pr-0 pl-2">RT-Notation</th>
            <th class="center pr-0 pl-1 text-center">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr :style="aboveItemsStyle">
          </tr>
            <tr v-for="(element, index) in viewingItems" :key="element.id">
              <!--Breakpoint-->
              <td width="50vw" @click.stop="element.breakpoint = !element.breakpoint" class="pr-0 pl-2">
                <v-icon v-if="element.breakpoint" color="red">mdi-record</v-icon>
                <p v-else>&nbsp;</p>
              </td>
              <!--Label-->
              <td class="pr-0 pl-0" width="130vw">
                <v-text-field @change="controlTable.updateTable()" v-model="element.label" dense solo-inverted hide-details></v-text-field>
              </td>
              <!--Adress-->
              <td class="text-center pr-0 pl-0">{{ element.adress }}</td>
              <!--AluSelA-->
              <td width="130vw">
                <v-select
                  :hide-details="true"
                  density="compact"
                  variant="outlined"
                  menu-icon=""
                  :items="['-', ...multiplexerStore.muxA]"
                  v-model="element.AluSelA"
                  return-object
                  @update:modelValue="update(element, null)"
                >
                </v-select>
              </td>
              <!--AluSelB-->
              <td width="130vw">
                <v-select
                  :hide-details="true"
                  density="compact"
                  variant="outlined"
                  menu-icon=""
                  :items="['-', ...multiplexerStore.muxB]"
                  v-model="element.AluSelB"
                  return-object
                  @update:modelValue="update(element, null)"
                >
                </v-select>
              </td>
              <!--MDRSel-->
              <td class="text-center pr-0 pl-0 pointer" @click.stop="update(element,null,null,'MDRSel')">{{ +element.MDRSel }}</td>
              <!--HsCs-->
              <td class="text-center pr-0 pl-0 pointer" @click.stop="update(element,null,null,'HsCs')">{{ +element.HsCs }}</td>
              <!--Hs_R_W-->
              <td class="text-center pr-0 pl-0 pointer" @click.stop="update(element,null,null,'Hs_R_W')">{{ +element.Hs_R_W }}</td>
              <!--AluCtrl-->
              <td width="170vw">
                <v-select
                  :hide-details="true"
                  density="compact"
                  menu-icon=""
                  variant="outlined"
                  :items="['-', ...aluStore.aluOperationsListAdded]"
                  v-model="element.AluCtrl"
                  @update:modelValue="update(element, null)"
                >
                </v-select>
              </td>
              <!--Register-->
              <td v-for="register in element.registerWrite" :key="register.title" class="center pointer pr-0 pl-0 text-center" @click.stop="update(element, register)">
                    <p>{{ register.isActive ? 1 : 0 }}</p>
              </td>
              <!-- ALU == 0? -->
              <td @click.stop="openDialog(element)">
                <p v-if="element.jump === null">{{ element.jump !== null ?  element.jump.adress : "-"}}</p>
                <div class="flex flex-col">
                  <p v-if="element.jump !== null && element.jumpSet === true">1</p>
                  <p v-if="element.jump !== null && element.jumpSet === true">0</p>
                </div>
              </td>
              <!-- next -->
              <td class="pr-0 pl-0 text-center">
                <div class="flex flex-col">
                  <p v-if="element.jump !== null">{{ element.jump.adress }}</p>
                  <p v-if="true">{{ typeof element.next === 'object' && element.next !== null ? element.next.adress : element.next }}</p>
                </div>
              </td>
              <!-- description -->
              <td class="pr-0 pl-2" width="200vw">
                <div v-if="element.description.length > 0">
                  <p v-for="(d, index) in element.description" :key="index">{{ d }}</p>
                </div>
                <div v-else>
                  <p>&nbsp;</p>
                </div>
              </td>
              <!-- Aktionen -->
              <td class="pr-0 pl-0">
                <div class="d-flex flex-row justify-end">
                  <v-tooltip text="Write Comment">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" @click.stop="toggleTextarea(index)" class="mr-5">mdi-text-box-edit</v-icon>
                    </template>
                  </v-tooltip>
                  <v-icon @click.stop="controlTable.deleteRow(index)" color="red">mdi-delete</v-icon>
                </div>
              </td>
                <td v-if="showTextareaIndex === index" :colspan="14">
                  <v-textarea
                    v-model="element.comment"
                    auto-grow
                    outlined
                    rows="1"
                    row-height="25"
                    placeholder="Write a comment"
                  ></v-textarea>
                </td>
            </tr>
          <tr :style="belowItemsStyle">
          </tr>
        </tbody>
      </v-table>
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
            <div v-if="selectedJumpType === 'conditional'" >
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
    </div>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useAluStore } from '@/store/AluStore';
import { ref, computed, watch} from 'vue';
import { useDebugerStore } from '@/store/DebugerStore';
import { VSelect, VIcon } from 'vuetify/components'

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const deb = useDebugerStore();
const aluStore = useAluStore();

const items = controlTable.controlTable
const dialog = ref(false);
const selectedRow = ref<any | null>(null);
const selectedJumpType = ref('next');

const inputAdresse = ref<string>('');
const numberOfRows = ref<string>('');

const currentComment = ref('');
const isCommentDialog = ref(false);

const unconditionalJump:any = ref(null);
const conditionalJumpIfZero:any = ref(null);
const conditionalJumpIfNotZero:any = ref(null);

//Label Objects
const uncond_Object:any = ref(null);
const cond_IfZeroObject:any = ref(null);
const cond_IfNotZeroObject:any = ref(null);

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
}

// Variable to track the currently displayed textarea index
const showTextareaIndex = ref<number | null>(null);
// Function to toggle the textarea
const toggleTextarea = (index: number) => {
  if (showTextareaIndex.value === index) {
    showTextareaIndex.value = null;
  } else {
    showTextareaIndex.value = index;
  }
};

const rowsForSelection = computed(() => {
  return controlTable.controlTable
    .filter(row => row.label !== '' && row.label !== undefined && row.label !== null)
    .map(row => ({ title: row.label, value: row.adress, displayText: `${row.label} (${row.adress})` }))
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

//------------------------------------------------------------------------------------------------
// Funktion zur Ermittlung der sichtbaren Fenstergröße
function getVisibleWindowSize(): { width: number; height: number } {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  return { width, height };
}

// Funktion zum Handhaben der Fenstergrößenänderung
function handleResize() {
  const windowSize = getVisibleWindowSize();
  console.log(`Visible window width: ${windowSize.width}`);
  console.log(`Visible window height: ${windowSize.height}`);
}

// Event Listener hinzufügen
window.addEventListener('resize', handleResize);

// Initiale Größenanzeige
handleResize();

////////////////////////////////////////////////////////////////////////////////////////////////
const scrollY = ref(0)
// Put in the pixel height of one of your table rows. Inspect the DOM in the browser to find this out
const rowHeight = 57
// If you have some kind of header or something at the top that gets scrolled with the table items, put the height of that below, as a negative number
//const tableExtraContent = -50
// The height of the scrollable part of the table that you want to display (based on max-height in styles)
const viewableHeight = ref(getVisibleWindowSize().height + 400)
// Calculate what part of the array we're currently viewing
const viewingStartIndex = computed(() => {
  console.log("viewableHeight" + viewableHeight.value)
  let startIndex = Math.floor((scrollY.value) / rowHeight) - 20
  console.log(startIndex)
  if (startIndex < 0) {
    startIndex = 0
  }
  return startIndex
})

const viewingItems = computed(() => {
  let endIndex = Math.ceil((scrollY.value + viewableHeight.value) / rowHeight) + 10
  console.log(endIndex)
  if (endIndex > items.length) {
    endIndex = items.length
  }
  return items.slice(viewingStartIndex.value, endIndex)
})

// Calculate how big the empty space above the table should be
const aboveItems = computed(() => {
  return items.slice(0, viewingStartIndex.value)
})
const aboveItemsStyle = computed(() => {
  const height = aboveItems.value.length * rowHeight
  return {
    height: `${height}px`
  }
})

// Calculate how big the empty space below the table should be
const belowItems = computed(() => {
  return items.slice(viewingStartIndex.value + viewingItems.value.length)
})

const belowItemsStyle = computed(() => {
  const height = belowItems.value.length * rowHeight
  return {
    height: `${height}px`
  }
})

// Table scroll event
const tableScrolled = (e: any) => {
  scrollY.value = e.target.scrollTop
}

</script>

<style lang="scss" scoped>
.pointer{
  cursor: pointer;
}

.scrollable {
    max-height: 91vh;
    overflow-y: auto;
  }
</style>