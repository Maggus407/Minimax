<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <Toolbar class="mb-2" :class="themeClass">
    <template #start>
          <v-btn @click="controlTable.addRow()" color="green" class="ma-1">Add Row</v-btn>
    </template>

    <template #center>
      <div class="flex-auto">
        <label for="minmax" class="font-bold block mb-2"> Start address: </label>
      <input class="mr-3" :class="toolbar" v-model="inputAdresse" inputId="minmax" :min="0" :max="items.length == 0 ? 0 : items.length - 1" />
    </div>
    <div class="flex-auto">
        <label for="minmax" class="font-bold block mb-2">#Rows to add: </label>
        <input class="mr-3" :class="toolbar" v-model="numberOfRows" inputId="minmax" :min="0" :max="100" />
      </div>
      <v-btn @click="setRows" color="success"> ADD </v-btn>
    </template>

    <template #end>
      <Toast />
      <ConfirmDialog></ConfirmDialog>
      <v-btn class="ma-1" color="error" label="Delete" severity="danger" @click="confirm1()">CLEAR TABLE</v-btn>
    </template>
</Toolbar>

  <div class="scrollable" @scroll="tableScrolled">
  <v-table density="compact" fixed-header>
      <thead>
        <tr>
          <th class="center pr-0 pl-2 text-center">Br</th>
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
      <tr :style="aboveItemsStyle"></tr>
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
            placeholder=" - "
            return-object
            @update:modelValue="update(element, null)"
          ></v-select>
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
            placeholder=" - "
            return-object
            @update:modelValue="update(element, null)"
          ></v-select>
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
            placeholder=" - "
            :items="['-', ...aluStore.aluOperationsListAdded]"
            v-model="element.AluCtrl"
            @update:modelValue="update(element, null)"
          ></v-select>
        </td>
        <!--Register-->
        <td v-for="register in element.registerWrite" :key="register.title" class="center pointer pr-0 pl-0 text-center" @click.stop="update(element, register)">
          <p>{{ register.isActive ? 1 : 0 }}</p>
        </td>
        <!-- ALU == 0? -->
        <td @click.stop="openDialog(element)">
          <p v-if="element.jump === null">{{ element.jump !== null ? element.jump.adress : "-" }}</p>
          <div class="flex flex-col">
            <p v-if="element.jump !== null && element.jumpSet === true">1</p>
            <p v-if="element.jump !== null && element.jumpSet === true">0</p>
          </div>
        </td>
        <!-- next -->
        <td class="pr-0 pl-0 text-center">
          <div class="flex flex-col">
            <p v-if="element.jump !== null">{{ element.jump.adress || -1 }}</p>
            <p v-if="true">{{ typeof element.next === 'object' && element.next !== null ? element.next.adress : element.next }}</p>
          </div>
        </td>
        <!-- description -->
        <td class="pr-0 pl-2" width="200vw">
          <div v-if="element.description.length > 0">
            <p v-for="(d, index) in element.description" :key="index" v-html="highlightQuestionMarks(d)"></p>
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
                <v-icon v-bind="props" @click.stop="toggleTextarea(element)" class="mr-5">mdi-text-box-edit</v-icon>
              </template>
            </v-tooltip>
            <v-icon @click.stop="controlTable.deleteRow(index)" color="red">mdi-delete</v-icon>
          </div>
        </td>
      </tr>
      <tr :style="belowItemsStyle"></tr>
    </tbody>
  </v-table>
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
import Toolbar from 'primevue/toolbar';
import InputNumber from 'primevue/inputnumber';
import Tooltip from 'primevue/tooltip';
import ConfirmDialog from 'primevue/confirmdialog';
import { useTheme } from 'vuetify';
import { useConfirm } from "primevue/useconfirm";
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";

const toast = useToast();
const confirm = useConfirm();

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const deb = useDebugerStore();
const aluStore = useAluStore();

const items = controlTable.controlTable
const selectedRow = ref<any | null>(null);
const selectedJumpType = ref('next');

const inputAdresse = ref<number>(0);
const numberOfRows = ref<number>(0);

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

const theme = useTheme();

const themeClass = computed(() => theme.global.current.value.dark ? 'dark-theme' : 'light-theme');
const toolbar = computed(() => theme.global.current.value.dark ? 'dark-input' : 'light-input');

const confirm1 = () => {
    confirm.require({
        message: 'Do you want to delete the whole Table?',
        header: 'Danger Zone',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: () => {
            toast.add({ severity: 'info', summary: 'Confirmed', detail: 'Table deleted', life: 3000 });
            controlTable.clearTable();
        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    });
};

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

function setRows(){
  for(let i = 0; i < Number(numberOfRows.value); i++){
    controlTable.placeRowBetween(Number(inputAdresse.value)+1);
  }
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
  let endIndex = Math.ceil((scrollY.value + viewableHeight.value) / rowHeight)
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

.red {
  color: red;
}

.scrollable {
    max-height: 91vh;
    overflow-y: auto;
    position: relative;
  }

  .v-table {
  width: 100%;
}

thead {
  position: sticky;
  top: 0;
  z-index: 100;
}

.light-theme {
  background-color: #ffffff; /* Helle Hintergrundfarbe */
  color: #000000; /* Dunkle Schriftfarbe */
}

.dark-theme {
  background-color: #333333; /* Dunkle Hintergrundfarbe */
  color: #ffffff; /* Helle Schriftfarbe */
}

.dark-input {
  border: 1px solid #ffffff;
  border-radius: 4px;
  width: 5vw;
}

.light-input{
  border: 1px solid rgb(184, 184, 184);
  border-radius: 4px;
  width: 5vw;
}

</style>