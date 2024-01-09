<template>
    <div class="flex flex-row gap-5 p-3">
      <div class="overflow-y">
        <MemoryList/>
        <table class="w-full table table-auto text-left">
          <thead>
            <tr>
              <th>Name</th>
              <th>decimal</th>
              <th>hexadecimal</th>
            </tr>
          </thead>
          <tbody class="">
            <tr v-for="re in register">
              <td>{{re.registerName}}</td>
              <td>{{re.registerValue}}</td>
              <td>{{dec2Hex(re.registerValue)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <p>ALU Current State: {{ debuggerStore.currentAluState }}</p>
        <p>Cycle: {{ debuggerStore.cycle }}</p>
        <p>Simulation</p>
        <button class="bg-orange rounded-md p-4" :disabled="debuggerStore.start" :style="{ opacity: debuggerStore.start ? '0.5' : '1' }" @click="startSimulation">{{$t('button.start')}}</button>
        <button class="bg-orange rounded-md p-4" :disabled="!debuggerStore.start" :style="{ opacity: debuggerStore.start ? '1' : '0.5' }" @click="stepBack">{{$t('button.back')}}</button>
        <button class="bg-orange rounded-md p-4" :disabled="!debuggerStore.start" :style="{ opacity: debuggerStore.start ? '1' : '0.5' }" @click="stepForward">{{$t('button.next')}}</button>
        <button class="bg-orange rounded-md p-4" :disabled="!debuggerStore.start" :style="{ opacity: debuggerStore.start ? '1' : '0.5' }" @click="fullsimulation">Full</button>
        <button class="bg-orange rounded-md p-4" :disabled="!debuggerStore.start" :style="{ opacity: debuggerStore.start ? '1' : '0.5' }" @click="stopSimulation">{{$t('button.stop')}}</button>
        <!--Debugger Table-->
        <div>
          <table class="w-full table table-auto text-left max-h-[300px] overflow-scroll p-5 border m-5">
            <thead>
              <tr class="border-b">
                <th>&nbsp;</th>
                <th>&nbsp;</th>
                <th>Label</th>
                <th>Adr.</th>
                <th>ALU == 0?</th>
                <th>Next</th>
                <th>RT-Notation</th>
              </tr>
            </thead>
            <tbody class="">
              <tr class="border-b" v-for="tr in controltable.row">
                <!--Current Row with Arrow-->
                <td>
                  <div v-if="tr.adresse === debuggerStore.cycle"><i class="fa-solid fa-arrow-right"></i></div>
                </td>
                <!--Breakpoint-->
                <td @click.stop="tr.breakpoint = !tr.breakpoint" class="max-w-[20px]">
                                <div v-if="tr.breakpoint" class="ml-3"><i class="fa-solid fa-circle" style="color: #ff0000;"></i></div>
                                <div v-else class="ml-3">&nbsp;</div>
                            </td>
                <!--Label-->
                <td>{{tr.label}}</td>
                <!--Adresse-->
                <td>{{tr.adresse}}</td>
                <!--ALU == 0?-->
                <td>
                  <p v-if="tr.jump.length > 0">1 <br> 0</p>
                  <p v-else>-</p>
                </td>
                 <!--Next Instruction-->
                  <td v-if="tr.nextInstruction == -1">{{ tr.nextInstruction }}</td>
                  <td v-else-if="tr.jump.length == 0 && tr.nextInstruction != null">{{ tr.nextInstruction.adresse}}</td>
                  <td v-else-if="tr.jump.length == 2 && tr.jump[0] != -1 && tr.jump[1] != -1">{{ tr.jump[1].adresse}} <br> {{ tr.jump[0].adresse}} </td>
                  <td v-else-if="tr.jump[0] == -1 && tr.jump[0] == -1">{{ tr.jump[1]}} <br> {{ tr.jump[0]}} </td>
                  <td v-else-if="tr.jump[0] == -1">{{ tr.jump[1].adresse}} <br> {{ tr.jump[0]}} </td>
                  <td v-else-if="tr.jump[1] == -1">{{ tr.jump[1]}} <br> {{ tr.jump[0].adresse}} </td>
                  <td v-else> - </td>
                  <td v-if="tr.rtNotation.length > 0"><p v-for="rt in tr.rtNotation">{{ rt }} <br></p></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import MemoryList from '../components/ReUsable/MemoryList.vue';
import { useRegisterStore } from '../store/RegisterStore';
import {useDebuggerStore} from '../store/DebuggerStore';
import { useControlTable } from '../store/ControlTableManagement';

//{{$t('memory.import')}}

const debuggerStore = useDebuggerStore();
const {startSimulation, stepForward, stepBack, stopSimulation, fullsimulation} = debuggerStore
const reg = useRegisterStore();
const controltable = useControlTable();

const { register } = reg;

//TODO
const dec2Hex = (dec:any):string => {
    let a: string = ''
      if(dec){
         a =  dec.toString(16);    
      }
        return a;
    }

</script>
