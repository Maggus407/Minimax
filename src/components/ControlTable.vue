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
        <th v-for="r in registerStore.registerOrder" class="center">{{r}}</th>
        <th class="center">ALU == 0?</th>
        <th class="center">next</th>
        <th class="center">description</th>
        <th class="center">Aktionen</th>
      </tr>
    </thead>
    <draggable :list="list" tag="tbody" item-key="id" group="signalTable"  @change="controlTable.updateTable">
      <template #item="{element, index}">
        <tr>
          <td @click="element.breakpoint = !element.breakpoint">{{ element.breakpoint }}</td>
          <td>{{ element.label }}</td>
          <td>{{ element.adress }}</td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="multiplexerStore.muxA" v-model="element.AluSelA">
            </v-select>
          </td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="multiplexerStore.muxB" v-model="element.AluSelB">
            </v-select>
          </td>
          <td @click="element.MDRSel = !element.MDRSel">{{ +element.MDRSel }}</td>
          <td @click="element.HsCs = !element.HsCs">{{ +element.HsCs }}</td>
          <td @click="element.Hs_R_W = !element.Hs_R_W">{{ +element.Hs_R_W }}</td>
          <td>
            <v-select :hide-details="true" density="compact" variant="outlined" menu-icon="" :items="aluStore.aluOperationsListAdded" v-model="element.AluCtrl">
            </v-select>
          </td>
          <td v-for="(value, key) in element.registerWrite" :key="key" class="center" @click="element.registerWrite[key] = element.registerWrite[key] === 0 ? 1 : 0">
            {{ value }}
          </td>
          <td>{{ element.jump }}</td>
          <td>{{ element.next }}</td>
          <td>{{ element.description }}</td>
          <td><v-btn @click="controlTable.deleteRow(index)">Löschen</v-btn></td>
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

const registerStore = useRegisterStore();
const controlTable = useControlTableStore();
const multiplexerStore = useMultiplexerStore();
const aluStore = useAluStore();

const list = controlTable.controlTable;

</script>