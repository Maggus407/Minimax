<template>
  <!-- Schaltfläche zum Hinzufügen einer neuen Reihe -->
  <v-btn @click="controlTable.addRow">Neue Reihe hinzufügen</v-btn>
  <v-btn @click="controlTable.showTableConsole">Show Table</v-btn>
  <v-divider></v-divider>
  <v-table
    :items="controlTable.controlTable"
    density="compact"
    height="91vh"
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
        <th v-for="r in registerStore.registerOrder" class="center">{{r.registerName}}</th>
        <th class="center">ALU == 0?</th>
        <th class="center">next</th>
        <th class="center">description</th>
        <th class="center">Aktionen</th>
      </tr>
    </thead>
    <draggable :list="list" tag="tbody" item-key="id" group="signalTable"  @change="controlTable.updateTable">
      <template #item="{element, index}">
        <tr>
          <td @click.stop="element.breakpoint = !element.breakpoint">{{ element.breakpoint }}</td>
          <td>
            <v-text-field @change="controlTable.updateTable" v-model="element.label" dense solo-inverted hide-details></v-text-field>
          </td>
          <td>{{ element.adress }}</td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="multiplexerStore.muxA" v-model="element.AluSelA">
            </v-select>
          </td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="multiplexerStore.muxB" v-model="element.AluSelB">
            </v-select>
          </td>
          <td @click.stop="element.MDRSel = !element.MDRSel">{{ +element.MDRSel }}</td>
          <td @click.stop="element.HsCs = !element.HsCs">{{ +element.HsCs }}</td>
          <td @click.stop="element.Hs_R_W = !element.Hs_R_W">{{ +element.Hs_R_W }}</td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="['-', ...aluStore.aluOperationsListAdded]" v-model="element.AluCtrl">
            </v-select>
          </td>
          <td v-for="(value, key) in element.registerWrite" :key="key" class="center" @click.stop="element.registerWrite[key] = element.registerWrite[key] === 0 ? 1 : 0">
            {{ value }}
          </td>
          <td @click.stop="openDialog(element)">{{ element.jump }}</td>
          <td>{{ element.next }}</td>
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
            ></v-text-field>
        </div>
        <div v-if="selectedJumpType === 'conditional'">
          <v-text-field
            label="ALU == 0?"
            type="number"
            v-model="conditionalJumpIfZero"
            :max="controlTable.controlTable.length - 1"
            :rules="[requiredRule]"
          ></v-text-field>
          <v-text-field
            label="ALU != 0?"
            type="number"
            v-model="conditionalJumpIfNotZero"
            :max="controlTable.controlTable.length - 1"
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
const selectedRow = ref(null);
const selectedJumpType = ref('next');
const unconditionalJump = ref(null);
const conditionalJumpIfZero = ref(null);
const conditionalJumpIfNotZero = ref(null);

const requiredRule = (value: any) => !!value || 'Erforderlich';

// Berechnete Eigenschaft, die überprüft, ob der OK-Button aktiviert werden soll
const isOkButtonDisabled = computed(() => {
  // Deaktiviere den Button nur, wenn 'Bedingter Sprung' ausgewählt ist und nicht beide Felder ausgefüllt sind
  return selectedJumpType.value === 'conditional' && (!conditionalJumpIfZero.value || !conditionalJumpIfNotZero.value);
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
      // Setzen Sie 'next' auf die aktuelle Adresse plus eins
      (selectedRow.value as any).next = Number((selectedRow.value as any).adress + 1);
      (selectedRow.value as any).jumpSet = false;
      controlTable.updateTable();
    } else if (selectedJumpType.value === 'unconditional') {
      (selectedRow.value as any).next = Number(unconditionalJump.value);
      (selectedRow.value as any).jumpSet = true; // Update the 'next' value of the selected row
      // ...
    } else if (selectedJumpType.value === 'conditional') {
      // Logik für bedingten Sprung
      // ...
    }
  }
  dialog.value = false; // Dialog schließen
}
</script>