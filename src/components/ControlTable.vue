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
        <th class="center">Breakpoint</th>
        <th class="center">Label</th>
        <th class="center">Adress</th>
        <th class="center">AluSelA</th>
        <th class="center">AluSelB</th>
        <th class="center">MDRSel</th>
        <th class="center">HsCs</th>
        <th class="center">Hs_R_W</th>
        <th class="center">AluCtrl</th>
        <th v-for="r in registerStore.registerOrder" :key="r.title" class="center">
          {{ r.title }}
        </th>
        <th class="center">ALU == 0?</th>
        <th class="center">next</th>
        <th class="center">description</th>
        <th class="center">Aktionen</th>
      </tr>
    </thead>
    <draggable :list="list" tag="tbody"  item-key="id" group="signalTable"  @change="controlTable.updateTable">
      <template #item="{element, index}">
        <tr :key="index">
          <td @click.stop="element.breakpoint = !element.breakpoint">
            <v-icon v-if="element.breakpoint" color="red">mdi-record</v-icon>
          </td>
          <td>
            <v-text-field @change="controlTable.updateTable()" v-model="element.label" dense solo-inverted hide-details></v-text-field>
          </td>
          <td>{{ element.adress }}</td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="multiplexerStore.muxA" v-model="element.AluSelA" return-object @change="controlTable.createRT_Notation()">
            </v-select>
          </td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="multiplexerStore.muxB" v-model="element.AluSelB" return-object @change="controlTable.createRT_Notation">
            </v-select>
          </td>
          <td @click.stop="element.MDRSel = !element.MDRSel">{{ +element.MDRSel }}</td>
          <td @click.stop="element.HsCs = !element.HsCs">{{ +element.HsCs }}</td>
          <td @click.stop="element.Hs_R_W = !element.Hs_R_W">{{ +element.Hs_R_W }}</td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="['-', ...aluStore.aluOperationsListAdded]" v-model="element.AluCtrl" @change="controlTable.createRT_Notation">
            </v-select>
          </td>
          <td v-for="register in element.registerWrite" :key="register.title" class="center pointer" @click.stop="register.isActive = !register.isActive" @change="controlTable.createRT_Notation">
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
          <td>
            <div class="flex flex-col">
              <p v-if="element.jump !== null">{{ element.jump.adress }}</p>
              <p v-if="true">{{ typeof element.next === 'object' && element.next !== null ? element.next.adress : element.next }}</p>
            </div>
          </td>
          <td>{{ element.description }}</td>
          <td><v-btn @click.stop="controlTable.deleteRow(index)">Löschen</v-btn></td>
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

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const aluStore = useAluStore();

const list = controlTable.controlTable;
const dialog = ref(false);
const selectedRow = ref<any | null>(null);
const selectedJumpType = ref('next');
const unconditionalJump = ref(null);
const conditionalJumpIfZero = ref(null);
const conditionalJumpIfNotZero = ref(null);

const requiredRule = (value: any) => !!value || 'Erforderlich';

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