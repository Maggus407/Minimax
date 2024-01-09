<template>
    <div class="grid grid-cols-3">
        <section class="col-span-1 m-5 bg-glassy_blue rounded-md overflow-y-hidden">
            <p class="w-full bg-dark_blue rounded-t-md text-white p-4 text-center">{{ $t('alu.addedOps') }}</p>
                <draggable :list="activeOps" group="food" tag="ul" item-key="name" @change="handle(activeOps,true)">
                    <template #item="{element, index}">
                        <li class="flex items-center cursor-pointer hover:bg-light_bg justify-center relative bg-white p-5 m-5 rounded-md" 
                        :class="{
                            'bg-click': selectedElement === element.id,
                            'bg-white': selectedElement !== element.id
                        }" 
                        item-key="element.id" 
                        @click="showInfo(element)">
                            <p class="absolute left-0 p-5 ">{{ element.name }}</p>
                            <p class="absolute right-0 p-5">{{ index.toString(2) }}</p>
                        </li>
                    </template>
                </draggable>
        </section>
        <section class="flex flex-col col-span-1 m-5 bg-glassy_blue rounded-md">
            <p class="w-full bg-dark_blue rounded-t-md text-white p-4 text-center">{{ $t('alu.currentOps') }}</p>
            <p class="mx-5">RT-Notation</p>
            <textarea class="m-5 rounded-md" id="textarea" cols="30" rows="1"></textarea>
            <textarea class="m-5 rounded-md" cols="30" rows="10">{{ $t(des) }}</textarea>
        </section>
        <section class="col-span-1 m-5 bg-glassy_blue overflow-auto rounded-md relative">
            <p class="w-full bg-dark_blue rounded-t-md text-white p-4 text-center">{{ $t('alu.availableOps') }}</p>
            <draggable :list="availableOps" group="food" tag="ul" item-key="name" @change="handle(availableOps,false)">
                    <template #item="{element}">
                        <li class="flex items-center justify-center cursor-pointer relative hover:bg-light_bg bg-white p-5 m-5 rounded-md" 
                        item-key="element.id" 
                        :class="{
                            'bg-click': selectedElement === element.id,
                            'bg-white': selectedElement !== element.id
                        }" 
                        @click="showInfo(element)">
                            <p class="absolute left-0 p-5">{{ element.name }}</p>
                        </li>
                    </template>
            </draggable>
        </section>
    </div>
</template>

<script setup lang="ts">
import DraggableList from './ReUsable/DraggableList.vue';
import { reactive, ref } from 'vue';
import { useAluStore } from '../store/ALUManagement';
import draggable from 'vuedraggable';
import { storeToRefs } from 'pinia';
import { Ref } from 'vue';

let des: Ref<string> = ref('')

const alu = useAluStore();
const { getActiveAluOperation, getFalseAluOperation } = storeToRefs(alu);

let activeOps = reactive(getActiveAluOperation.value)
let availableOps = reactive(getFalseAluOperation.value)

let selectedElement = ref('');

const selectElement = (element: {id: string} | null) => {
        selectedElement.value = element ? element.id : '';
}

const handle = (list: any, status: boolean) => {
    list.map((item: any) => item.active = status)
}

const showInfo = (e: any) => {
    des.value = 'alu.' + e.description
    console.log(des.value)
    showRtInfo(e)
    selectElement(e)
}

const showRtInfo = (e: any) => {
    const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
    textarea.innerHTML = e.rt_notation
}

</script>