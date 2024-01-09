<template>
    <div class="relative flex flex-col p-3">
        <!--Dragable List-->
        <table class="table table-auto text-left">
            <thead class="bg-glassy_blue">
                <tr>
                    <th>Breakpoint</th>
                    <th>Label</th>
                    <th>Adress</th>
                    <th>ALU Sel A</th>
                    <th>ALU Sel B</th>
                    <th>MDR Sel</th>
                    <th>HS CS</th>
                    <th>HS RW</th>
                    <th>ALU Op</th>
                    <th v-for="r in register">{{r.registerName}}.W</th>
                    <th>ALU == 0?</th>
                    <th>Next Instruction</th>
                    <th>RT-Notation</th>
                </tr>
            </thead>
            <draggable :list="controlTable.row" tag="tbody" item-key="id" group="signalTable" @change="controlTable.updateNextInstruction">
                <template #item="{element, index}">
                    <tr :class="{ 'bg-ctTable': index % 2 !== 0 }" class="border-b" style="border-color: rgb(173, 173, 173) !important;">
                            <!--BreakPoint-->
                            <td @click.stop="element.breakpoint = !element.breakpoint" class="max-w-[20px]">
                                <div v-if="element.breakpoint" class="ml-3"><i class="fa-solid fa-circle" style="color: #ff0000;"></i></div>
                            </td>
                            <!--Label-->
                            <td>
                                <input type="text">
                            </td>
                            <!--Adress-->
                            <td>{{element.adresse = index}}</td>
                            <!--ALU Sel A-->
                            <td>
                                <select class="appearance-none p-1 rounded-md min-w-[30px]" v-model="element.aluSelA" @change="controlTable.updateRTNotation(element)">
                                    <option :value="null">-</option>
                                    <option v-for="mux in multiplexerA" :key="mux.id" :value="mux">{{ mux.register ? mux.register.registerName : mux.value }}</option>
                                </select>
                            </td>
                            <!--ALU Sel B-->
                            <td>
                                <select class="appearance-none p-1 rounded-md min-w-[30px]" v-model="element.aluSelB" @change="controlTable.updateRTNotation(element)">
                                    <option :value="null">-</option>
                                    <option v-for="mux in multiplexerB" :key="mux.id" :value="mux">{{ mux.register ? mux.register.registerName : mux.value }}</option>
                                </select>
                            </td>
                            <!--MDR Sel-->
                            <td>
                                <select class="appearance-none p-1 rounded-md min-w-[30px]" v-model="element.mdrSel" @change="controlTable.updateRTNotation(element)">
                                    <option :value="null">-</option>
                                    <option :value="false">0</option>
                                    <option :value="true">1</option>
                                </select>
                            </td>
                            <!--HS CS-->
                            <td>
                                <select class="appearance-none p-1 rounded-md min-w-[30px]" v-model="element.hsCS" @change="controlTable.updateRTNotation(element)">
                                    <option :value="0">0</option>
                                    <option :value="1">1</option>
                                </select>
                            </td>
                            <!--HS RW-->
                            <td>
                                <select class="appearance-none p-1 rounded-md min-w-[30px]" v-model="element.hsRW" @change="controlTable.updateRTNotation(element)">
                                    <option :value="null">-</option>
                                    <option :value="0">0 Write</option>
                                    <option :value="1">1 Read</option>
                                </select>
                            </td>
                            <!--ALU Op-->
                            <td>
                                <select class="appearance-none p-1 rounded-md" v-model="element.aluOp" @change="controlTable.updateRTNotation(element)">
                                    <option value="-">-</option>
                                    <option v-for="r in getActiveAluOperation" :key="r.id" :value="r">{{r.name}}</option>
                                </select>
                            </td>
                            <!--Register Write-->
                            <td v-for="r in element.registerWrite" :key="r.id" :value="r">
                                <select class="appearance-none p-1 rounded-md min-w-[30px] text-center" v-model="r.active" @change="controlTable.updateRTNotation(element)">
                                    <option :value='false'>0</option>
                                    <option :value='true'>1</option>
                                </select>
                            </td>
                            <!--Jump?-->
                            <td class="realtive" @click.stop="toggle(element)">
                                <p v-if="element.jump.length > 0">1 <br> 0</p>
                                <p v-else>-</p>
                            </td>
                            <!--Next Instruction-->
                            <td v-if="element.nextInstruction == -1">{{ element.nextInstruction }}</td>
                            <td v-else-if="element.jump.length == 0 && element.nextInstruction != null">{{ element.nextInstruction.adresse}}</td>
                            <td v-else-if="element.jump.length == 2 && element.jump[0] != -1 && element.jump[1] != -1">{{ element.jump[1].adresse}} <br> {{ element.jump[0].adresse}} </td>
                            <td v-else-if="element.jump[0] == -1 && element.jump[0] == -1">{{ element.jump[1]}} <br> {{ element.jump[0]}} </td>
                            <td v-else-if="element.jump[0] == -1">{{ element.jump[1].adresse}} <br> {{ element.jump[0]}} </td>
                            <td v-else-if="element.jump[1] == -1">{{ element.jump[1]}} <br> {{ element.jump[0].adresse}} </td>
                            <td v-else>&nbsp;</td>
                            <!--RT-Notation-->
                            <td v-if="element.rtNotation.length > 0"><p v-for="rt in element.rtNotation">{{ rt }} <br></p></td>
                            <td v-else>&nbsp;</td>
                            <!--Delete Button-->
                            <td><button @click="controlTable.deleteControlTableLine(element.id)">DELETE</button></td>
                        </tr>
                </template>
            </draggable>
            <button @click="newLine">NEW LINE</button>
        </table>
        <!--JUMP Modal-->
        <div v-if="showModal" class="absolute rounded-md z-10 bg-silver h-full w-full bg-opacity-40 flex items-center justify-center">
            <div class="opacity-100 bg-glassy_blue rounded-md p-3 flex flex-col z-100 w-[450px]  h-[300px]">
                <div @click="toggle" class="self-end cursor-pointer"><i class="fa-solid fa-xmark fa-2xl" style="color: #f40101;"></i></div>
                <form @submit.prevent="submitForm" class="flex flex-col gap-3">
                    <!--Next Instruction-->
                    <div>
                        <input type="radio" id="nextInstruction" @click="selection(true,false,false)" name="jump">
                        <label class="cursor-pointer" for="nextInstruction">Nächster Befehl</label>
                    </div>
                    <!--Unconditional Jump-->
                    <div class="">
                        <input type="radio" id="jumpTo" @click="selection(false,true,false)" name="jump">
                        <label class="cursor-pointer" for="jumpTo">Unbedingter Sprung</label>
                        <input type="number" v-model="unConditionalJump" class="w-[20%] ml-3">
                        <select name="" id="" class="ml-3">
                            <option value="-">-</option>
                            <option v-for="l in controlTable.row">{{ l.label }}</option>
                        </select>
                    </div>
                    <!--Conditional Jump-->
                    <div>
                        <input type="radio" id="conditionalJump" @click="selection(false,false,true)" name="jump">
                        <label class="cursor-pointer" for="conditionalJump">Bedingter Sprung</label>
                        <div class="flex flex-row mb-3">
                            <p class="mr-3">1</p>
                            <input class="w-[20%]" v-model="conditionalJumpTrue" type="number">
                            <select name="" id="" class="ml-3">
                                <option value="-">-</option>
                                <option v-for="l in controlTable.row">{{ l.label }}</option>
                            </select>
                        </div>
                        <div class="flex flex-row">
                            <p class="mr-3">0</p>
                            <input class="w-[20%]" v-model="conditionalJumpFalse" type="number">
                            <select name="" id="" class="ml-3">
                                <option value="-">-</option>
                                <option v-for="l in controlTable.row">{{ l.label }}</option>
                            </select>
                        </div>
                    </div>
                    <!--Buttons OK/CANCEL-->
                    <div class=" flex flex-row gap-5">
                        <button type="submit">OK</button>
                        <button @click="toggle">Abbrechen</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRegisterStore } from '../store/RegisterStore';
import { useMultiplexerStore } from '../store/MultiplexerStore';
import { useAluStore } from '../store/ALUManagement';
import {useControlTable} from '../store/ControlTableManagement';
import draggable from 'vuedraggable';
import {ref, watch} from 'vue';

//Importing the store's functions
const reg = useRegisterStore();
const mux = useMultiplexerStore();
const alu = useAluStore();
const controlTable = useControlTable();

const { multiplexerA, multiplexerB } = mux;
const { getActiveAluOperation } = alu;
const {register} = reg

//Modal
const showModal = ref(false);
let currentrow: any = null;
let jumpRow: any = null;

//Next Instruction
let nextInstruction: number;
let nextInstructionBool = false;

//Unconditional Jump
let unConditionalJump = 0;
let unCondJumpBool = false;

//Conditional Jump
let conditionalJumpFalse = 0;
let conditionalJumpTrue = 0;
let condJumpBool = false;

const toggle = (element: any) => {
    currentrow = element;
    nextInstruction = element.adresse + 1;
    showModal.value = !showModal.value; 
}

const selection = (one: boolean, two: boolean, third: boolean) => {
    if(one){
        nextInstructionBool = true;
        unCondJumpBool = false;
        condJumpBool = false;
    }else if(two){
        nextInstructionBool = false;
        unCondJumpBool = true;
        condJumpBool = false;
    }else if(third){
        nextInstructionBool = false;
        unCondJumpBool = false;
        condJumpBool = true;
    }
}

const submitForm = () => {
    currentrow.jump = [];
    showModal.value = !showModal.value;
    if(nextInstructionBool){
        findRow(nextInstruction);
        if(jumpRow != -1){
            currentrow.nextInstruction = jumpRow;
            currentrow.condJump = false;
            jumpRow.condJump = false;
        }else{
            currentrow.nextInstruction = -1;
        }
    }else if(unCondJumpBool){
        findRow(unConditionalJump);
        if(jumpRow != -1){
            currentrow.nextInstruction = jumpRow;
            currentrow.condJump = true;
        }else{
            currentrow.nextInstruction = jumpRow;
        }
    }else if(condJumpBool){
        findRow(conditionalJumpFalse);
        if(jumpRow != -1){
            currentrow.jump[0] = jumpRow;
            currentrow.condJump = true;
        }else{
            currentrow.jump[0] = -1;
        }
        findRow(conditionalJumpTrue);
        if(jumpRow != -1){
            currentrow.jump[1] = jumpRow;
            currentrow.condJump = true;
        }else{
            currentrow.jump[1] = -1;
        }
    }
    reset();
}

const findRow = (index: number) =>{
    if(index > controlTable.row.length){
        jumpRow = -1;
    }else{
        controlTable.row.filter((row) => {
            if(row.adresse == index){
                jumpRow = row;
                return;
            }
        });
    }
}

const reset = () => {
    nextInstructionBool = false;
    unCondJumpBool = false;
    condJumpBool = false;
    unConditionalJump = 0;
    conditionalJumpFalse = 0;
    conditionalJumpTrue = 0;
}

const newLine = () => {
    controlTable.addNewControlTableLine(getActiveAluOperation,register, null, null);
}

</script>

