<template>
  <section v-once class="flex flex-row items-center justify-center h-[80px] bg-glassy_blue dark:bg-dark_blue rounded-t-md">
              <!--On Fontawsome icons which are renderd as svg you need extra div/span/p etc. around-->
              <span @click="jumptoAdress('start')"><i class="fa-solid fa-angles-left fa-2xl cursor-pointer"></i></span>
              <span @click="jumptoAdress('-site')"><i class="mx-10 fa-solid fa-angle-left fa-2xl cursor-pointer"></i></span>
              <input v-model.number="jump" type="number" min="0" class="mx-10 rounded-md">
              <button type="button" @click="handleScroll">Jump</button>
              <span @click="jumptoAdress('+site')"><i class="mx-10 fa-solid fa-angle-right fa-2xl cursor-pointer"></i></span>
              <span @click="jumptoAdress('end')"><i class="fa-solid fa-angles-right fa-2xl cursor-pointer"></i></span>
            </section>
            <section class="h-[600px] bg-dark_blue text-white">
                  <!--VirtualList-->        
                  <div class="grid grid-cols-6 bg-dark_bg">
                    <p class="mx-5 col-span-1">{{$t('memory.address')}}</p>
                    <p class="ml-10 col-span-2">{{ $t('memory.decimal') }}</p>
                    <p @click="toggleBinHex" class="mx-8 col-span-3 cursor-pointer">HEX / BIN </p>
                  </div>        
                  <div v-bind="containerProps" class="h-[600px]">
                    <div v-bind="wrapperProps">
                      <div v-for="{index,data} in list" :key="index" class="grid grid-cols-6">
                        <p class="mx-10 col-span-1">{{ index.toString(16).toUpperCase().padStart(6, '0') }}</p>
                        <p class=" ml-10 col-span-2 tracking-wide">{{ data }}</p>
                        <p v-if="bin" class=" mx-10 col-span-3 tracking-wide">{{ dec2Bin(data) }}</p>
                        <p v-else class=" mx-40 col-span-3 tracking-wide">0x{{ dec2Hex(data) }}</p>
                      </div>
                    </div>
                  </div>
            </section>
            <section class="flex items-center justify-center h-[60px] bg-glassy_blue dark:bg-dark_blue rounded-b-md"><p>{{ $t('memory.addresses') }} - {{ mem.memory.length-1 }}</p></section>
  </template>
  
  <script setup lang="ts">
    import { useMemory } from '../../store/MemoryManagement';
    import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
    import { useVirtualList } from '@vueuse/core';
    import { ref, Ref, watchEffect, watch } from 'vue';
  
    const mem = useMemory();
  
    const jump:Ref = ref(0)
    const bin:Ref = ref(true)
  
    const toggleBinHex = () => {
      bin.value = !bin.value
    }
  
    function handleScroll() {
      scrollTo(jump.value);
    }
  
        //VirtualList
        const {list, containerProps, wrapperProps, scrollTo} = useVirtualList(mem.getMemoryArray(), {
        itemHeight: 20, // Item height
        overscan: 10,
      });
  
   //Handle Arrow Keys
   const jumptoAdress = (direction: string) =>{
      if(direction == "start"){
        scrollTo(0)
        jump.value = 0
      }
      if(direction == "end"){
        scrollTo(mem.memory.length)
        jump.value = mem.memory.length-1
      }
      if(direction == "+site"){
        scrollTo(jump.value + 23)
        if(jump.value + 23 > mem.memory.length){
          jump.value = mem.memory.length-1
        }else{
        jump.value = jump.value + 23
        }
      }
      if(direction == "-site"){
        scrollTo(jump.value - 23)
        if(jump.value - 23 < 0){
          jump.value = 0
        }else{
          jump.value = jump.value - 23
        }
      }
    }
  
    const  dec2Bin = (dec:any) => {
        let a =  (dec >>> 0).toString(2);
        if(a.length < 32){
          a = a.padStart(32, '0');
        }
        return addSpacesTo8Digits(a);
      }
  
      const dec2Hex = (dec:any) => {
        let a =  (dec >>> 0).toString(16);
        if(a.length < 8){
          a = a.padStart(8, '0');
        }
        return addSpacesTo8Digits(a);
      }
  
      const addSpacesTo8Digits = (str: string) => {
        const chunks = str.match(/.{1,8}/g); // Teilt den String in 8-stellige Stücke auf
        if (chunks) {
          return chunks.join(' '); // Fügt ein Leerzeichen zwischen den Stücken hinzu und gibt den neuen String zurück
        }
        return str; // Gibt den ursprünglichen String zurück, wenn er weniger als 8 Zeichen hat
    }
  </script>