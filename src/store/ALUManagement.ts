import {defineStore} from "pinia"; 
import { v4 as uuidv4 } from 'uuid'

export function Add(a: Int32Array  , b: Int32Array): Int32Array {
    if (typeof a === 'number') {
        a = new Int32Array([a]);
    }
    if (typeof b === 'number') {
            b = new Int32Array([b]);
    }
    const result = new Int32Array(1);
    result[0] = a[0] + b[0];
    console.log("Add ausgeführt: " + result[0]);
    return result;
}

export function SubA(a: Int32Array, b: Int32Array): Int32Array {
    if (typeof a === 'number') {
        a = new Int32Array([a]);
    }
    if (typeof b === 'number') {
            b = new Int32Array([b]);
    }
    const result = new Int32Array(1);
    result[0] = a[0] - b[0];
    console.log("Add ausgeführt: " + result[0]);
    return result;
}

export function SubB(a: Int32Array, b: Int32Array): Int32Array {
    if (typeof a === 'number') {
        a = new Int32Array([a]);
    }
    if (typeof b === 'number') {
            b = new Int32Array([b]);
    }
    const result = new Int32Array(1);
    result[0] = a[0] - b[0];
    console.log("Add ausgeführt: " + result[0]);
    return result;
}

export function transfer(a: Int32Array): Int32Array {
    if (typeof a === 'number') {
        a = new Int32Array([a]);
    }
    const result = new Int32Array(1);
    result[0] = a[0];
    return result
}

export function increment(a: Int32Array): Int32Array {
    if (typeof a === 'number') {
        a = new Int32Array([a]);
    }
    const result = new Int32Array(1);
    result[0] = a[0] + 1;
    return result;
}

export function decrement(a: Int32Array): Int32Array {
    if (typeof a === 'number') {
        a = new Int32Array([a]);
    }
    const result = new Int32Array(1);
    result[0] = a[0] - 1;
    return result;
}

export function Multiplikation(a: Int32Array, b: Int32Array): Int32Array {
    if (typeof a === 'number') {
        a = new Int32Array([a]);
    }
    if (typeof b === 'number') {
            b = new Int32Array([b]);
    }
    const result = new Int32Array(1);
    result[0] = a[0] * b[0];
    console.log("MULtiplikation ausgeführt: " + result[0]);
    return result;
  }

export const useAluStore = defineStore("alu", {
    state: () => ({
        aluoperation: [
        {
            id: uuidv4(),
            name: "Add",
            rt: "A + B",
            active: true,
            description: "add",
            rt_notation: "ALU.result ← A + B",
            inputA: "",
            inputB: "",
            output: (store) => Add(store.inputA, store.inputB),
        },
        {
            id: uuidv4(),
            name: "A Sub B",
            rt: "A - B",
            active: false,
            description: "A_sub_B",
            rt_notation: "ALU.result ← A - B",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputA: Int32Array; inputB: Int32Array; }) => SubA(store.inputA, store.inputB),
        },
        {
            id: uuidv4(),
            name: "B Sub A",
            rt: "B - A",
            active: true,
            description: "B_sub_A",
            rt_notation: "ALU.result ← B - A",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputA: Int32Array; inputB: Int32Array; }) => SubB(store.inputB, store.inputA),
        },
        {
            id: uuidv4(),
            name: "TRANSFER A",
            rt: "A",
            active: true,
            description: "transferA",
            rt_notation: "ALU.result ← A",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputA: Int32Array; }) => transfer(store.inputA),
        },
        {
            id: uuidv4(),
            name: "TRANSFER B",
            rt: "B",
            active: true,
            description: "transferB",
            rt_notation: "ALU.result ← B",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputB: Int32Array; }) => transfer(store.inputB),
        },
        {
            id: uuidv4(),
            name: "INC A",
            rt: "A + 1",
            active: false,
            description: "incA",
            rt_notation: "ALU.result ← A + 1",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputA: Int32Array; }) => increment(store.inputA),
        },
        {
            id: uuidv4(),
            name: "INC B",
            rt: "1 + B",
            active: false,
            description: "incB",
            rt_notation: "ALU.result ← B + 1",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputB: Int32Array; }) => increment(store.inputB),
        },
        {
            id: uuidv4(),
            name: "DEC A",
            rt: "A - 1",
            active: false,
            description: "decA",
            rt_notation: "ALU.result ← A - 1",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputA: Int32Array; }) => decrement(store.inputA),
        },
        {
            id: uuidv4(),
            name: "DEC B",
            rt: "B - 1",
            active: false,
            description: "decB",
            rt_notation: "ALU.result ← B - 1",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputB: Int32Array; }) => decrement(store.inputB),
        },
        {
            id: uuidv4(),
            name: "A MUL B",
            rt: "A * B",
            active: false,
            description: "A_mul_B",
            rt_notation: "ALU.result ← A * B",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: (store: { inputA: Int32Array; inputB: Int32Array; }) => Multiplikation(store.inputA, store.inputB),
        },
        {
            id: uuidv4(),
            name: "A DIV B",
            rt: "A / B",
            active: false,
            description: "A_div_B",
            rt_notation: "ALU.result ← A / B",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: ""
        },
        {
            id: uuidv4(),
            name: "B DIV A",
            active: false,
            description: "B_div_A",
            rt_notation: "ALU.result ← B / A",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: ""
        },
        {
            id: uuidv4(),
            name: "A MOD B",
            active: false,
            description: "A_mod_B",
            rt_notation: "ALU.result ← A mod A",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: ""
        },
        {
            id: uuidv4(),
            name: "B MOD A",
            active: false,
            description: "B_mod_A",
            rt_notation: "ALU.result ← B mod A",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: ""
        },
        {
            id: uuidv4(),
            name: "A AND B",
            active: false,
            description: "A_and_B",
            rt_notation: "ALU.result ← A & B",
            inputA: new Int32Array(1),
            inputB: new Int32Array(1),
            output: ""
        }
    ],
    currentValue: new Int32Array(1),
    }),
    getters: {
        getActiveAluOperation(): any{
            return this.aluoperation.filter(op => op.active);
        },
        getFalseAluOperation(): any{
            return this.aluoperation.filter(op => !op.active);
        },
        getRtNotation(): string{

            return ""
        }
    }
});
