import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Overview',
            component: () => import('../components/Overview.vue'),
        },
        {
            path: '/controltable',
            name: 'ControlTable',
            component: () => import('../components/ControlTable.vue'),
        },
        {
            path: '/addregister',
            name: 'AddRegister',
            component: () => import('../components/AddRegister.vue'),
        },
        {
            path: '/debugger',
            name: 'Debugger',
            component: () => import('../components/Debugger.vue'),
        },
        {
            path: '/speicher',
            name: 'Speicher',
            component: () => import('../components/Speicher.vue'),
        },
        {
            path:'/muxConfig',
            name: 'MuxConfig',
            component: () => import('../components/MUXConfig.vue'),
        },
        {
            path:'/aluConfig',
            name: 'AluConfig',
            component: () => import('../components/AluConfig.vue'),
        }
        
            
    ]
    })

    
export default router