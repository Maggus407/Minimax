<template>
  <v-row>
    <v-col cols="12" md="4" class="order-md-1 order-sm-1">
      <v-card variant="outlined" class="overflow-y-auto" style="height: 97.5vh;">
        <!-- Dynamische Klasse basierend auf dem Theme -->
        <v-card-title :class="themeClass" class="sticky-title">{{$t('alu.addedOps')}}</v-card-title>
        <v-expansion-panels>
          <v-card-text>
            <draggable style="height: 85vh;" :list="aluStore.aluOperationsListAdded" tag="div" item-key="i" group="items">
              <template #item="{element, index}">
                <v-expansion-panel :key="index" :title="element" :text="$t('alu.' + (aluStore.aluOperations.get(element)?.description ?? ''))">
                </v-expansion-panel>
              </template>
            </draggable>
          </v-card-text>
        </v-expansion-panels>
      </v-card>
    </v-col>
  
    <v-col cols="12" md="4" class="order-md-3 order-sm-2">
      <v-card variant="outlined" class="overflow-y-auto" style="height: 97.5vh;">
        <!-- Dynamische Klasse basierend auf dem Theme -->
        <v-card-title :class="themeClass" class="sticky-title">{{$t('alu.availableOps')}}</v-card-title>
        <v-expansion-panels>
          <v-card-text>
            <draggable :list="aluStore.aluOperationsListAvailable" tag="div" item-key="i" group="items" @change="onChange($event)">
              <template #item="{element, index}">
                <v-expansion-panel :key="index" :title="element" :text="$t('alu.' + (aluStore.aluOperations.get(element)?.description ?? ''))">
                </v-expansion-panel>
              </template>
            </draggable>
          </v-card-text>
        </v-expansion-panels>
      </v-card>
    </v-col>
  </v-row>
</template>


<script setup lang="ts">
import { useAluStore } from '@/store/AluStore';
import { useControlTableStore } from '@/store/ControlTableStore';
import draggable from 'vuedraggable';
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const aluStore = useAluStore();
const controlTable = useControlTableStore();
const theme = useTheme();

const themeClass = computed(() => theme.global.current.value.dark ? 'dark-theme' : 'light-theme');

function onChange(event: any) {
  if(event.added) {
    console.log('Änderungen:', event.added.element);
    controlTable.aluRemoved(event.added.element);
  }
}
</script>


<style scoped>
.sticky-title {
  position: sticky;
  top: 0;
  z-index: 10; /* Erhöhe den z-index */
}

.light-theme {
  background-color: #ffffff; /* Helle Hintergrundfarbe */
  color: #000000; /* Dunkle Schriftfarbe */
}

.dark-theme {
  background-color: #333333; /* Dunkle Hintergrundfarbe */
  color: #ffffff; /* Helle Schriftfarbe */
}
</style>
