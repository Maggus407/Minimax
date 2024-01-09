<template>
    <div class="flex flex-row p-4">
        <label v-if="label" class="text-dark_text dark:text-white mx-3">{{label}}</label>
        <input 
            class="rounded-md"
            v-bind="$attrs"
            @change="$emit('sendData', $event)"
            >
    </div>
</template>

<script setup lang="ts">
defineProps({
    label:{
        type:[String, Boolean],
        default:false
    },
})

</script>
