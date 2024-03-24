<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <v-btn @click="controlTable.addRow">Neue Reihe hinzufügen</v-btn>
  <v-btn @click="controlTable.showTableConsole">Show Table</v-btn>
  <v-divider></v-divider>
  <v-table
    :items="controlTable.controlTable"
    density="compact"
    height="91vh"
    fixed-header
  >
  <thead>
      <tr>
        <v-tooltip text="Breakpoint">
                <template v-slot:activator="{ props }">
                  <th v-bind="props" class="center pr-0 pl-1 text-center">Br</th>
                </template>
        </v-tooltip>
        <th class="pr-0 pl-1 text-center">Label</th>
        <th class=" pr-0 pl-1 text-center">Adress</th>
        <th class=" pr-0 pl-1 text-center">AluSelA</th>
        <th class=" pr-0 pl-1 text-center">AluSelB</th>
        <th class=" pr-0 pl-1 text-center">MDRSel</th>
        <th class=" pr-0 pl-1 text-center">HsCs</th>
        <th class=" pr-0 pl-1 text-center">Hs_R_W</th>
        <th class="pr-3 pl-0 text-center">AluCtrl</th>
        <th v-for="r in registerStore.registerOrder" :key="r.title" class="pr-0 pl-1 text-center">
            {{ r.title }}
        </th>
        <th class="center pr-0 pl-1 text-center">ALU == 0?</th>
        <th class="center pr-0 pl-1 text-center">Next</th>
        <th class="center pr-0 pl-2">RT-Notation</th>
        <th class="center pr-0 pl-1 text-center">&nbsp;</th>
      </tr>
    </thead>
    <draggable :list="list" tag="tbody"  item-key="id" group="signalTable"  @change="controlTable.updateTable()">
      <template #item="{element, index}">
        <tr class="pr-0 pl-0" :key="index">
          <!--Breakpoint-->
          <td width="50vw" @click.stop="element.breakpoint = !element.breakpoint" class="pr-0 pl-2">
            <v-icon v-if="element.breakpoint" color="red">mdi-record</v-icon>
            <p v-else>&nbsp;</p>
          </td>
          <!--Label-->
          <td class="pr-0 pl-0" width="125vw">
            <v-text-field @change="controlTable.updateTable()" v-model="element.label" dense solo-inverted hide-details></v-text-field>
          </td>
          <!--Adress-->
          <td class="text-center pr-0 pl-0">{{ element.adress }}</td>
          <!--AluSelA-->
          <td width="100vw" class="pr-0">
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
          <td width="100vw" class="pr-0">
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
          <td width="140vw" class=pl-0>
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
            <p v-if="element.jump === null" class="text-center">{{ element.jump !== null ?  element.jump.adress : "-"}}</p>
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
            <!--Comment Row-->
              <v-icon class="mr-3">mdi-text-box-edit</v-icon>
              <!--Delete Row-->
              <v-icon @click.stop="controlTable.deleteRow(index)" color="red" class="mr-2">mdi-delete</v-icon>
            </div>
          </td>
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
        </tr>
      </template>
  </draggable>
</v-table>
</template>

<script setup lang="ts">
import { useControlTableStore } from '@/store/ControlTableStore';
import { useRegisterStore } from '@/store/RegisterStore';
import { useMultiplexerStore } from '@/store/MultiplexerStore';
import { useAluStore } from '@/store/AluStore';
import draggable from 'vuedraggable';
import { ref, computed } from 'vue';
import { useDebugerStore } from '@/store/DebugerStore';

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const deb = useDebugerStore();
const aluStore = useAluStore();

const list = controlTable.controlTable;
const dialog = ref(false);
const selectedRow = ref<any | null>(null);
const selectedJumpType = ref('next');
const unconditionalJump = ref(null);
const conditionalJumpIfZero = ref(null);
const conditionalJumpIfNotZero = ref(null);

const currentComment = ref('');
const isCommentDialog = ref(false);

function openCommentDialog(row: any) {
  currentComment.value = row.comment;
  isCommentDialog.value = true;
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