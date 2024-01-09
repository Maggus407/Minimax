import {defineStore} from "pinia";
import { v4 as uuidv4 } from 'uuid'
import {useRegisterStore} from "./RegisterStore";

interface Multiplexer {
    id: string;
    register: any;
    value:  number | null;
}

export const useMultiplexerStore = defineStore("multiplexer", {
    state: () => ({
        multiplexerA: [
            {
                id: uuidv4(),
                register: null,
                value: 0,
            },
            {
                id: uuidv4(),
                register: null,
                value: 1,
            },
        ] as Multiplexer[],
        multiplexerB: [
            {
                id: uuidv4(),
                register: useRegisterStore().getAccuRegister(),
                value: null,
            },
            {
                id: uuidv4(),
                register: useRegisterStore().getPCRegister(),
                value: null,
            },
            {
                id: uuidv4(),
                register: useRegisterStore().getMDRRegister(),
                value: null,
            },
            {
                id: uuidv4(),
                register: useRegisterStore().getIRRegister(),
                value: null,
            }
        ] as Multiplexer[],
    }),
    getters: {
        getAllMultiplexerA: (state) => () => { 
            return state.multiplexerA;
        },
        getAllMultiplexerB: (state) => () => {
            return state.multiplexerB;
        }
    },
    actions: {
        fillMultiplexer_B_withBaseRegister() {
            const registerStore = useRegisterStore();
            this.multiplexerB = [];
            registerStore.getRegisterExceptMAR().forEach((register) => {
                this.addMultiplexerB(register, 0);
            });
        },
        addMultiplexerA(register: any, value: number | null) {
            this.multiplexerA.push({
                id: uuidv4(),
                register: register,
                value: value,
            });
        },
        addMultiplexerB(register: any, value: number | null) {
            this.multiplexerB.push({
                id: uuidv4(),
                register: register,
                value: value
            });
        },
        removeMultiplexerA(id: string) {
            this.multiplexerA = this.multiplexerA.filter((item) => item.id !== id);
        },
        removeMultiplexerB(id: string) {
            this.multiplexerB = this.multiplexerB.filter((item) => item.id !== id);
        }
        
    },
});