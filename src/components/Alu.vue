<template>
  <v-row>

  <v-col cols="12" md="4" class="order-md-1 order-sm-1">
    <v-card variant="outlined">
      <v-card-title>{{$t('alu.addedOps')}}</v-card-title>
      <v-expansion-panels>
      <v-card-text class="overflow-y-auto" style="height: 90vh;">
        <draggable style="height: 85vh;" :list="aluStore.aluOperationsListAdded" tag="div" item-key="i" group="items">
          <template #item="{element, index}">
              <v-expansion-panel 
                  :key="index" 
                  :title="element"
                  :text="$t('alu.' + (aluStore.aluOperations.get(element)?.description ?? ''))"
                  >
                </v-expansion-panel>
              </template>
            </draggable>
          </v-card-text>
        </v-expansion-panels>
    </v-card>
  </v-col>
  
      <v-col cols="12" md="4" class="order-md-3 order-sm-2">
        <v-card variant="outlined">
          <v-card-title>{{$t('alu.availableOps')}}</v-card-title>
          <v-expansion-panels>
          <v-card-text class="overflow-y-auto" style="height: 90vh;">
            <draggable style="height: 85vh;" :list="aluStore.aluOperationsListAvailable" tag="div" item-key="i" group="items">
              <template #item="{element, index}">
                  <v-expansion-panel 
                  :key="index" 
                  :title="element"
                  :text="$t('alu.' + (aluStore.aluOperations.get(element)?.description ?? ''))"
                  >
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
import draggable from 'vuedraggable';

const aluStore = useAluStore();

</script>
