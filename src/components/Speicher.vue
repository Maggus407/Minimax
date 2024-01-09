<template>
  <!-- Container für den Memory Content-->
      <div class="flex flex-col 2xl:flex-row bg-slate-300 ">
        <!--Memory Anzeige-->
        <div class="flex flex-col m-10 min-w-[900px]">
          <MemoryList/>
        </div>
        <!--Input Fields-->
        <div class="flex flex-col gap-10 m-10">
          <!--FileInput-->
          <form @submit.prevent="readFile(fileInput, fileLength)" class="bg-glassy_blue dark:bg-dark_blue rounded-md flex flex-col w-[600px]">
              <BaseInput @sendData="setFile" label="File" type="file" />
              <BaseInput @sendData="setStartAdress" :label="$t('memory.address')" type="number" />
              <BaseInput @sendData="setFileLength" label="Bytes" type="number" :value="fileLength" :max="fileLength" min="0"/>
            <button type="submit" class="p-5">{{$t('memory.import')}}</button>
          </form>
          <!--FileExport-->
          <form @submit.prevent="getMemoryDataToExport" class="bg-glassy_blue dark:bg-dark_blue rounded-md flex flex-col w-[600px]">
            <BaseInput @sendData="startAdress" :label="$t('memory.startAddress')" type="number" />
            <BaseInput @sendData="endAdress" :label="$t('memory.endAddress')" type="number" />
            <button type="submit" class="p-5">{{$t('memory.export')}}</button>
          </form>
          <!--Clear Memory-->
          <button @click="mem.$reset" class="bg-dark_blue text-white dark:bg-orange hover:bg-glassy_blue hover:text-dark_text dark:text-dark_bg rounded-full flex flex-row items-center justify-center w-[600px] h-10"><p>{{$t('memory.clear')}}</p></button>
        </div>
      </div>
  </template>
  <script setup lang="ts">
  import { useMemory } from '../store/MemoryManagement';
  import MemoryList from './ReUsable/MemoryList.vue';
  import BaseInput from './ReUsable/BaseInput.vue';
  import { storeToRefs } from 'pinia';
  import {ref} from 'vue';
  import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

  const mem = useMemory();
  const { memory } = storeToRefs(mem);

  //Start and End Adress for Exporting Memory
  const startAdress = (event: any) => {
    s = event.target.value;
  }

  const endAdress = (event: any) => {
    end = event.target.value;
  }

  let s = 0;
  let end = 0;
  
  function getMemoryDataToExport(){
    console.log(s, end )
    let data: Int32Array = new Int32Array((+end) - (+s) +1)
    console.log(data.length)
    for(let i = (+s); i <= (+end); i++){
      data[i - (+s)] = mem.memory[i]
      console.log(i)

    }
    console.log(Array.from(data))
    saveAs(data)
  }

async function saveAs(data) {
    try {
      // Open file picker dialog to select the save location and file name
      let fileHandle = await (window as any).showSaveFilePicker();

     // Create a writable stream for the selected file
    const writableStream = await fileHandle.createWritable();
      // Create a Blob from the data

    // Write the blob to the file using the writable stream
    await writableStream.write(data);

    // Close the writable stream
    await writableStream.close();
      
    console.log('File saved successfully!');
    } catch (error) {
    console.error('Error saving file:', error);
    }
  }

  let fileLength = ref<number>(0);

  const setfileLength = (data: any) => {
    fileLength.value = data.target.files[0].size;
  };

  const setFileLength = (event: any) => {
    fileLength.value = event.target.value
    fileLength.value = (+fileLength.value)
  };

  //Variable for File Input
  let fileInput: any = null;

  const setFile = (data: any) => {
  fileInput = data;
  setfileLength(data);
};

 //Set start address for VirtualList
  let start = 0;
  const setStartAdress = (data: any) => {
    start = data.target.value;
  };

    //Read File input and convert to ArrayBuffer
    //Write to Memory
    function readFile(fileInput: any, length: number) {
      const file = fileInput.target.files[0];

      const fileReader = new FileReader();
      fileReader.onload = () => {
        let buffer = fileReader.result as ArrayBuffer;
        buffer = buffer.slice(0, length);

        const dataView = new DataView(buffer);
        const dataArray = new Int32Array(Math.ceil(buffer.byteLength / 4));
        for (let i = 0; i < dataArray.length; i++) {
          const byteOffset = i * 4;
          if (byteOffset + 3 < buffer.byteLength) {
            dataArray[i] = dataView.getInt32(byteOffset, true);
          } else {
            let value = 0;
            let shift = 0;
            for (let j = 0; j < 4; j++) {
              if (byteOffset + j < buffer.byteLength) {
                value |= (dataView.getUint8(byteOffset + j) << shift);
                shift += 8;
              }
            }
            dataArray[i] = value;
          }
          mem.setMemoryValue(i + (+start), dataArray[i]);
        }
      };
      fileReader.readAsArrayBuffer(file);
      console.log(memory)
    }
  
</script>
