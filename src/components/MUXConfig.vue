<template>
    <div class="grid grid-cols-3">
        <section class="col-span-1 m-5 bg-glassy_blue overflow-y-scroll rounded-md">
            <p class="w-full bg-dark_blue rounded-t-md text-white p-4 text-center">MUX A</p>
            <draggable :list="muxA" group="mux" tag="ul" item-key="name">
                <template #item="{element, index}">
                    <li 
                        :class="{
                            'bg-click': selectedElement === element.id,
                            'bg-white': selectedElement !== element.id
                        }" 
                        class="flex items-center text-center justify-center cursor-pointer relative p-3 m-5 rounded-md" 
                        @click="selectElement(element)" 
                        item-key="element.id">

                        <div class="flex-grow-0 flex-shrink-0 w-1/6 border-r border-gray-300">
                            <p>{{ (index + 1).toString(2).padStart(maxBinaryLength, '0') }}</p>
                        </div>
                        <div class="flex-grow flex-shrink w-2/6 border-r border-gray-300">
                            <p v-if="element.register !== null">{{ element.register.registerName }}</p>
                            <p v-else>{{ element.value }}</p>
                        </div>
                        <div class="flex-grow flex-shrink w-2/6 border-r border-gray-300">
                            <p v-if="element.value !== null">0x{{ element.value.toString(16).padStart(8, '0') }}</p>
                            <!-- &nbsp; = is a Placeholder -->
                            <p v-else>&nbsp;</p>
                        </div>
                        <div class="flex-grow-0 flex-shrink-0 w-1/6">
                            <button @click="deleteMux(element.id, 'muxA')"><i class="fa-solid fa-trash" style="color: #d01b1b;"></i></button>
                        </div>
                    </li>
                </template>
            </draggable>
        </section>
        <section class="flex flex-col col-span-1 m-5 bg-glassy_blue rounded-md">
            <p class="w-full bg-dark_blue rounded-t-md text-white p-4 text-center">Config Multiplexer</p>
            <form @submit.prevent="submitForm" action="submit" class="flex flex-col">
                <!--SELECT Register-->
                    <div class="flex flex-col p-5 m-5">
                        <input type="radio" name="muxInput" @click="regORNum = false" checked>
                        <p>Register:</p>
                        <select v-model="selectedRegister" class="p-3" :class="{'opacity-50': regORNum, 'rounded-md': true}" :disabled="regORNum" name="register" id="reg">
                            <option v-for="register in reg.getRegisterExceptMAR()" :key="register.id" :value="register" :a="register">{{ register.registerName }}</option>
                        </select>
                    </div>
                    <!--Add With Arrow direction-->
                    <div class="flex flex-row justify-between mx-12 my-10">
                        <button type="submit"  @click="side = 'left'"><i class="fa-solid fa-arrow-left fa-2xl"></i></button>
                        <p>{{$t('button.add')}}</p>
                        <button type="submit" @click="side = 'right'"><i class="fa-solid fa-arrow-right fa-2xl"></i></button>
                    </div>
                <!--SELECT Number-->
                <div class="flex flex-col p-5 mt-5">
                    <input type="radio" name="muxInput" @click="regORNum = true">
                    <div class="flex flex-col items-center mt-5">
                        <div>
                            <label for="decimal" class="text-center">Dez: </label>
                            <input type="number" max="2147483647" min="-2147483648" v-model="decimal"
                                @keydown="blockExcessDecimalInput" @keyup="convertToHex" @change="convertToHex"
                                :disabled="!regORNum" placeholder="0" class="w-[300px] m-3 rounded-md p-1">
                        </div>

                        <div>
                            <label for="hex" class="text-center">Hex: </label>
                            <input type="text" class="w-[300px] m-3 rounded-md p-1 uppercase"
                                @keydown="blockInvalidHexInput" @keyup="convertToDec" placeholder="0"
                                :disabled="!regORNum" v-model="hex">
                        </div>
                    </div>
                </div>
            </form>
        </section>
        <section class="col-span-1 m-5 bg-glassy_blue overflow-y-scroll overflow-auto rounded-md relative">
            <p  class="w-full bg-dark_blue rounded-t-md text-white p-4 text-center">MUX B</p>
            <draggable :list="muxB" group="mux" tag="ul" item-key="name">
                <template #item="{element, index}">
                    <li 
                        :class="{
                            'bg-click': selectedElement === element.id,
                            'bg-white': selectedElement !== element.id
                        }" 
                        class="flex items-center text-center justify-center cursor-pointer relative p-3 m-5 rounded-md" 
                        @click="selectElement(element)" 
                        item-key="element.id">
                        <div class="flex-grow-0 flex-shrink-0 w-1/6 border-r border-gray-300">
                            <p>{{ (index + 1).toString(2).padStart(maxBinaryLength, '0') }}</p>
                        </div>
                        <div class="flex-grow flex-shrink w-2/6 border-r border-gray-300">
                            <p v-if="element.register !== null">{{ element.register.registerName }}</p>
                            <p v-else>{{ element.value }}</p>
                        </div>
                        <div class="flex-grow flex-shrink w-2/6 border-r border-gray-300">
                            <p v-if="element.value !== null">0x{{ element.value.toString(16).padStart(8, '0') }}</p>
                            <!-- &nbsp; = is a Placeholder -->
                            <p v-else>&nbsp;</p>
                        </div>
                        <div class="flex-grow-0 flex-shrink-0 w-1/6">
                            <button @click="deleteMux(element.id, 'muxB')"><i class="fa-solid fa-trash" style="color: #d01b1b;"></i></button>
                        </div>
                    </li>
                </template>
            </draggable>
        </section>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {useMultiplexerStore} from '../store/MultiplexerStore';
import { useRegisterStore } from '../store/RegisterStore';
import {reactive, ref, computed} from 'vue';
import draggable from 'vuedraggable';

const mux = useMultiplexerStore()
const {multiplexerA, multiplexerB} = storeToRefs(mux)
const {addMultiplexerA, addMultiplexerB, removeMultiplexerA, removeMultiplexerB} = useMultiplexerStore()
const reg = useRegisterStore()

const muxA = reactive(multiplexerA)
const muxB = reactive(multiplexerB)

const side = ref('')

const regORNum = ref(false)

let selectedRegister = null;
const decimal = ref('');
const hex = ref('');

let selectedElement = ref('');

const selectElement = (element: {id: string} | null) => {
        selectedElement.value = element ? element.id : '';
}

const maxBinaryLength = computed(() => Math.ceil(Math.log2(muxA.value.length+1)));

const isInRange = (num: number, min: number, max: number) => num >= min && num <= max;

const blockExcessDecimalInput = (event: KeyboardEvent) => {
  let valueAfterInput = (decimal.value as any as string) + event.key;
  if (!isInRange(parseInt(valueAfterInput), -2147483648, 2147483647) && event.key !== "Backspace" && event.key !== "Delete" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    event.preventDefault();
  }
}

const blockInvalidHexInput = (event: KeyboardEvent) => {
    // Antizipiert das endgültige Wert nach der Tastatureingabe
    let valueAfterInput = (hex.value as any as string) + event.key;

    //Regex
    const regex = /^-?(0x)?[0-9A-Fa-f]*$/;
    if (!regex.test(valueAfterInput) && event.key !== "Backspace" && event.key !== "Delete" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    event.preventDefault();
    return;
  }

    // Überprüft, ob der Wert nach der Eingabe ein gültiger Hexadezimalwert ist und im gültigen Bereich liegt
    if (!isInRange(parseInt(valueAfterInput, 16), -2147483648, 2147483647)) {
        // Blockiert nur Ziffern- und Buchstabeneingaben, wenn das Maximum erreicht ist.
        if ((event.keyCode >= 48 && event.keyCode <= 57) || // Zifferntasten
            (event.keyCode >= 65 && event.keyCode <= 70) || // A-F
            (event.keyCode >= 97 && event.keyCode <= 102)) { // a-f
            event.preventDefault();
        }
    }
}

const convertToDec = () => {
  if(hex.value !== '') {
    let hexNum = parseInt(hex.value, 16);
    if(isInRange(hexNum, -2147483648, 2147483647)){
      decimal.value = hexNum.toString(10);
    }
  }else{
    decimal.value = '';
  } 
}

const convertToHex = () => {
  if (decimal.value !== '') {
    let decimalNum = parseInt(decimal.value);
    let hexValue = '';

    if (isInRange(decimalNum, -2147483648, 2147483647)) {
      if (decimalNum < 0) {
        // Umwandlung einer negativen Dezimalzahl in Hexadezimal mit Zweierkomplement
        decimalNum = 4294967296 + decimalNum;
      }
      hexValue = decimalNum.toString(16).toUpperCase();
    }
    hex.value = hexValue;
  } else {
    hex.value = '';
  }
};

function submitForm() {
  // Stellen Sie sicher, dass entweder selectedRegister ausgewählt wurde oder decimal.value nicht leer ist
  if (!selectedRegister && !decimal.value) {
    return; // Beendet die Funktion vorzeitig
  }
  if(regORNum.value) {
    if(side.value == 'left') {
        addMultiplexerA(null, parseInt(decimal.value));
    } else {
        addMultiplexerB(null,parseInt(decimal.value))
    }
  }else{
    if(side.value == 'left') {
        addMultiplexerA(selectedRegister,null)
    } else {
        addMultiplexerB(selectedRegister,null)
    }
  }
}

const deleteMux = (id: string, muxSide: string) =>{
    if(muxSide == 'muxA') {
        removeMultiplexerA(id)
    } else {
       removeMultiplexerB(id)
    }
}

</script>
