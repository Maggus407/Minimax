<script setup lang="ts">
import { useVirtualList, useToggle } from '@vueuse/core'
import { computed } from 'vue'

const [isEven, toggle] = useToggle()
const allItems = Array.from(Array(99999).keys())
const filteredList = computed(() => allItems.filter(i => isEven.value ? i % 2 === 0 : i % 2 === 1))

const { list, containerProps, wrapperProps } = useVirtualList(
  filteredList,
  {
    itemHeight: 22,
  },
)
</script>

<template>
  <p>Showing {{ isEven ? 'even' : 'odd' }} items</p>
  <v-btn @click="toggle">
    Toggle Even/Odd
  </v-btn>
  <div v-bind="containerProps" style="height: 300px">
    <div v-bind="wrapperProps">
      <div v-for="item in list" :key="item.index" style="height: 22px">
        Row: {{ item.data }}
      </div>
    </div>
  </div>
</template>
