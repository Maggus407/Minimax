/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-virtual-draglist' {
  export const VirtualList: any; // You can replace `any` with more specific types if you know the API
}