<template>
    <div class="grid lg:grid-cols-10 md:grid-cols-1 gap-10 p-5">
        <!--Add/Edit Register-->
        <div class="flex flex-col bg-glassy_blue rounded-md p-3 lg:col-span-6">
            <div>
                <!--ADD Register Name-->
                <h1>{{$t('nav.addRegister')}}</h1>
                <input class="w-full rounded-lg border border-b-dark_bg" type="text" v-model="name" id="register-input">
            </div>
            <div>   
                <p>Größe</p>
                <select name="bit-size" id="" disabled="true">
                    <option value="32">32 Bit</option>
                    <option value="8">8 Bit</option>
                    <option value="16">16 Bit</option>
                    <option value="64">64 Bit</option>
                </select>
            </div>
            <!--ADD Description-->
            <div>
                <p>{{$t('register.description')}}</p>
                <textarea class="w-1/2 rounded-lg border border-b-dark_bg" name="description" id="textarea" cols="30" rows="10" v-model="description"></textarea>
            </div>
            <!--Buttons-->
            <button v-if="toggle" @click="() => addNewRegister(name,description)">{{$t('button.add')}}</button>
            <button v-else @click="savecurrentRegister()">{{$t('button.save')}}</button>
            </div>
        <div class="flex flex-col gap-5 lg:col-span-3">
            <!--Show Base Register-->
            <div class="bg-glassy_blue rounded-md p-3">
                <h2>{{$t('register.baseRegister')}}</h2>
                <ul>
                    <li v-for="n in register" :key="n.id" @click="getRegisterDescription(n.id)">
                        <p v-if="!n.userReg" class="cursor-pointer">{{ n.registerName }}</p>
                    </li>
                </ul>
            </div>
            <!--Show Extended Register from User-->
            <div class="bg-glassy_blue rounded-md p-3">
                <h2>{{$t('register.extendedRegister')}}</h2>
                <ul class="mb-5">
                    <li class="flex flex-row justify-between" v-for="i in register" :key="i.id">
                        <div v-if="i.userReg" class="flex flex-row">
                            <p @click="getRegisterDescription(i.id), toggle=false" class="cursor-pointer">{{ i.registerName }}</p>
                            <button @click="reg.deleteRegister(i.id)" ><i title='Delete' class="fa-solid fa-trash"></i></button>
                        </div>
                    </li>
                </ul>
                <button @click="savecurrentRegister()">{{$t('button.add')}}</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRegisterStore } from '../store/RegisterStore'
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

interface Register {
  registerName: string;
  // add any other properties here
}

//safe the Text from Input field's
const name = ref("");
const description = ref("");
const toggle = ref(false);

//Access the StateManagement Store
const reg = useRegisterStore();
//Make the Store Reactive, as soon a new Register got added it will be shown
const {register} = storeToRefs(reg);

const { addRegister } = useRegisterStore();

const addNewRegister = (regName: string, regDescription: string) =>{
    addRegister(regName,regDescription);
    name.value = "";
    description.value = "";
}

const getRegisterDescription = (id: string) => {
    let des = reg.getDescription(id);
    const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
    if (des !== undefined) {
        textarea.value = des;
    }else{
        textarea.value = "";
    }
}

const savecurrentRegister = () => {
    toggle.value = true;
    const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
    textarea.value = "";
}
</script>
