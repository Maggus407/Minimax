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
            path: '/register',
            name: 'Register',
            component: () => import('../components/Register.vue'),
        },
        {
            path: '/debugger',
            name: 'Debugger',
            component: () => import('../components/Debugger.vue'),
        },
        {
            path: '/memory',
            name: 'Memory',
            component: () => import('../components/Memory.vue'),
        },
        {
            path:'/multiplexer',
            name: 'Multiplexer',
            component: () => import('../components/Multiplexer.vue'),
        },
        {
            path:'/alu',
            name: 'Alu',
            component: () => import('../components/Alu.vue'),
        }
        
            
    ]
    })

    
export default router