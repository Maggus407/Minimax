<template>
  
</template>

<script setup lang="ts">   
import draggable from 'vuedraggable'; 
defineProps({
    addedOperation:{
        type:Array,
        default:[]
    },
    group:{
        type:String,
        default:''
    },
    tag:{
        type:String,
        default:''
    },
    added:{
        type:Boolean,
        default:false
    }
})
</script>