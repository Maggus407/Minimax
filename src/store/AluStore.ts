import { defineStore } from 'pinia';
import { ref } from 'vue';

// Definieren des Typs für die ALU-Operationen
type AluOperation = (a: number, b: number) => number;

type AluOperationInfo = {
    operation: AluOperation;
    description: string;
    rt: string;
    
  };

export const useAluStore = defineStore('Alu', () => {
    /**
     * Map mit allen ALU-Operationen.
     * List of all ALU operations.
     * Add, SubA, SubB, TransferA, TransferB, IncrementA, IncrementB, DecrementA, DecrementB, ModuloA, ModuloB, And, Or, Xor, Multiplikation, DivisionA, DivisionB, InvertA, InvertB, ShiftLeftA, ShiftLeftB, ShiftRightA, ShiftRightB, ShiftLeft_by_X, ShiftRight_by_X, ShiftRightUnsigned, ShiftRightUnsignedByX, RotateLeft, RotateLeftByX, RotateRight, RotateRightByX
     */
    const aluOperations = new Map<string, AluOperationInfo>();

    // Hier können Sie Ihre ALU-Operationen hinzufügen
    aluOperations.set('A ADD B', {
        operation: Add,
        description: 'add',
        rt: 'ALU.result ← A + B'
    });

    aluOperations.set('B SUB A', {
        operation: SubB,
        description: 'A_sub_B',
        rt: 'ALU.result ← A - B'
    });

    aluOperations.set('A SUB B', {
        operation: SubA,
        description: 'B_sub_A',
        rt: 'ALU.result ← B - A'
    });

    aluOperations.set('Transfer A', {
        operation: transferA,
        description: 'transferA',
        rt: 'ALU.result ← A'
    });

    aluOperations.set('Transfer B', {
        operation: transferB,
        description: 'transferB',
        rt: 'ALU.result ← B'
    });

    aluOperations.set('Increment A', {
        operation: increment,
        description: 'incA',
        rt: 'ALU.result ← A + 1'
    });

    aluOperations.set('Increment B', {
        operation: increment,
        description: 'incB',
        rt: 'ALU.result ← B + 1'
    });

    aluOperations.set('Decrement A', {
        operation: decrement,
        description: 'decA',
        rt: 'ALU.result ← A - 1'
    });

    aluOperations.set('Decrement B', {
        operation: decrement,
        description: 'decB',
        rt: 'ALU.result ← B - 1'
    });

    aluOperations.set('A MOD B', {
        operation: Modulo,
        description: 'A_mod_B',
        rt: 'ALU.result ← A % B'
    });

    aluOperations.set('B MOD A', {
        operation: Modulo,
        description: 'B_mod_A',
        rt: 'ALU.result ← B % A'
    });

    aluOperations.set('A AND B', {
        operation: And,
        description: 'A_and_B',
        rt: 'ALU.result ← A & B'
    });

    aluOperations.set('A OR B', {
        operation: Or,
        description: 'A_OR_B',
        rt: 'ALU.result ← A | B'
    });

    aluOperations.set('A XOR B', {
        operation: Xor,
        description: 'A_XOR_B',
        rt: 'ALU.result ← A ^ B'
    });

    aluOperations.set('A MUL B', {
        operation: Multiplikation,
        description: 'A_mul_B',
        rt: 'ALU.result ← A * B'
    });
    aluOperations.set('A DIV B', {
        operation: Division,
        description: 'A_div_B',
        rt: 'ALU.result ← A / B',
    });

    aluOperations.set('B DIV A', {
        operation: Division,
        description: 'B_div_A',
        rt: 'ALU.result ← B / A'
    });

    aluOperations.set('Invert A', {
        operation: Invert,
        description: 'INV_A',
        rt: 'ALU.result ← ~A',
    });

    aluOperations.set('Invert B', {
        operation: Invert,
        description: 'INV_B',
        rt: 'ALU.result ← ~B'
    });
    aluOperations.set('A S.L.', {
        operation: ShiftLeft,
        description: 'A_SL',
        rt: 'ALU.result ← A[30..0]@0'
    });

    aluOperations.set('B S.L.', {
        operation: ShiftLeft,
        description: 'B_SL',
        rt: 'ALU.result ← B[30..0]@0'
    });
    aluOperations.set('A S.R.', {
        operation: ShiftRight,
        description: 'A_SR',
        rt: 'ALU.result ← A [31]@A[31..1]'
    });

    aluOperations.set('B S.R.', {
        operation: ShiftRight,
        description: 'B_SR',
        rt: 'ALU.result ← B [31]@B[31..1]'
    });

    aluOperations.set('A S.L. B', {
        operation: ShiftLeft_by_X,
        description: 'A_SL_B',
        rt: 'ALU.result ← A[31-B..0]@0^B'
    });

    aluOperations.set('B S.L. A', {
        operation: ShiftLeft_by_X,
        description: 'B_SL_A',
        rt: 'ALU.result ← B[31-A..0]@0^A'
    });

    aluOperations.set('B S.R. A', 
    {
        operation: ShiftRight_by_X,
        description: 'B_SR_A',
        rt: 'ALU.result ← B[31]^A@B[31..A]'
    });

    aluOperations.set('A S.R. B', 
    {
        operation: ShiftRight_by_X,
        description: 'A_SR_B',
        rt: 'ALU.result ← A[31]^B@A[31..B]'
    });

    aluOperations.set('A S.R.U.', 
    {
        operation: ShiftRightUnsigned,
        description: 'A_SRU',
        rt: 'ALU.result ← 0@A[31..1]'
    });

    aluOperations.set('B S.R.U.', 
    {
        operation: ShiftRightUnsigned,
        description: 'B_SRU',
        rt: 'ALU.result ← 0@B[31..1]'
    });

    aluOperations.set('B S.R.U. A', 
    {
        operation: ShiftRightUnsignedByX,
        description: 'B_SRU_A',
        rt: 'ALU.result ← 0^A@B[31..A]'
    });

    aluOperations.set('A S.R.U. B', 
    {
        operation: ShiftRightUnsignedByX,
        description: 'A_SRU_B',
        rt: 'ALU.result ← 0^B@A[31..B]'
    });

    aluOperations.set('A R.L', 
    {
        operation: RotateLeft,
        description: 'A_RL',
        rt: 'ALU.result ← A [31]@A[31..1]'
    });

    aluOperations.set('B R.L.', 
    {
        operation: RotateLeft,
        description: 'B_RL',
        rt: 'ALU.result ← B [31]@B[31..1]'
    });

    aluOperations.set('B R.L. A', 
    {
        operation: RotateLeftByX,
        description: 'B_RL_A',
        rt: 'ALU.result ← B[31-A..0]@B[31..32-A]'
    });

    aluOperations.set('A R.L. B', 
    {
        operation: RotateLeftByX,
        description: 'A_RL_B',
        rt: 'ALU.result ← A[31-B..0]@A[31..32-B]'
    });

    aluOperations.set('A R.R.', 
    {
        operation: RotateRight,
        description: 'A_RR',
        rt: 'ALU.result ← A [31]@A[31..1]'
    });

    aluOperations.set('B R.R.', 
    {
        operation: RotateRight,
        description: 'B_RR',
        rt: 'ALU.result ← B [31]@B[31..1]'
    });

    aluOperations.set('A R.R. B', 
    {
        operation: RotateRightByX,
        description: 'A_RR_B',
        rt: 'ALU.result ← A[B-1..0]@A[31..B]'
    });

    aluOperations.set('B R.R. A', 
    {
        operation: RotateRightByX,
        description: 'B_RR_A',
        rt: 'ALU.result ← B[A-1..0]@B[31..A]'
    });


    // Überprüft, ob die Eingabezahl gültig ist.
function checkNumber(input: number | null | undefined): void {
    if (input === null || input === undefined) {
        throw new Error("Input cannot be null or undefined");
    }
}

// Addiert zwei Zahlen im 32-Bit-Int-Fenster.
 function Add(a: number, b: number): number {
    checkNumber(a);
    checkNumber(b);
    const arrayA = new Int32Array([a]);
    const arrayB = new Int32Array([b]);
    return arrayA[0] + arrayB[0];
}

// Subtrahiert b von a im 32-Bit-Int-Fenster.
 function SubB(a: number, b: number): number {
    checkNumber(a);
    checkNumber(b);
    const arrayA = new Int32Array([a]);
    const arrayB = new Int32Array([b]);
    return arrayA[0] - arrayB[0];
}

// Subtrahiert a von b im 32-Bit-Int-Fenster.
 function SubA(a: number, b: number): number {
    checkNumber(a);
    checkNumber(b);
    const arrayA = new Int32Array([a]);
    const arrayB = new Int32Array([b]);
    return arrayB[0] - arrayA[0];
}

// Überträgt den Wert a im 32-Bit-Int-Fenster.
 function transferA(a: number, b:any): number {
    checkNumber(a);
    const arrayA = new Int32Array([a]);
    return arrayA[0];
}

// Überträgt den Wert b im 32-Bit-Int-Fenster.
 function transferB(a: any, b:number): number {
    checkNumber(b);
    const arrayB = new Int32Array([b]);
    return arrayB[0];
}

// Inkrementiert a um 1 im 32-Bit-Int-Fenster.
 function increment(a: number, b:any): number {
    checkNumber(a);
    const arrayA = new Int32Array([a]);
    arrayA[0] += 1;
    return arrayA[0];
}

// Dekrementiert a um 1 im 32-Bit-Int-Fenster.
 function decrement(a: number, b:any): number {
    checkNumber(a);
    const arrayA = new Int32Array([a]);
    arrayA[0] -= 1;
    return arrayA[0];
}

     function Multiplikation(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return (arrayA[0] * arrayB[0]);
    }
    
     function Division(a: number, b: number): number {
        checkNumber(a);
        if (b === 0) {
            return 0;
        }
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return (arrayA[0] / arrayB[0]);
    }
    
     function Modulo(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        if (b === 0) {
            throw new Error("Modulo by zero is not allowed");
        }
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return (arrayA[0] % arrayB[0]);
    }
    
     function And(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return (arrayA[0] & arrayB[0]);
    }
    
     function Or(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return (arrayA[0] | arrayB[0]);
    }
    
     function Xor(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return (arrayA[0] ^ arrayB[0]);
    }

    function Invert(a: number, b:any): number {
        checkNumber(a);
        const arrayA = new Int32Array([a]);
        return ~arrayA[0];
    }
    
    function ShiftLeft(a: number, b:any): number {
        checkNumber(a);
        const arrayA = new Int32Array([a]);
        return arrayA[0] << 1;
    }
    
    function ShiftRight(a: number, b:any): number {
        checkNumber(a);
        const arrayA = new Int32Array([a]);
        return arrayA[0] >> 1;
    }
    
    function ShiftLeft_by_X(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return arrayA[0] << arrayB[0];
    }
    
    function ShiftRight_by_X(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return arrayA[0] >> arrayB[0];
    }
    
    function ShiftRightUnsigned(a: number, b:any): number {
        checkNumber(a);
        const arrayA = new Int32Array([a]);
        return arrayA[0] >>> 1;
    }
    
    function ShiftRightUnsignedByX(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const arrayA = new Int32Array([a]);
        const arrayB = new Int32Array([b]);
        return arrayA[0] >>> arrayB[0];
    }
    
    function RotateLeft(a: number, b:any): number {
        checkNumber(a);
        const MSB = 0x80000000;
        const LSB = 0x00000001;
        const arrayA = new Int32Array([a]);
    
        let carry = arrayA[0] & MSB;
        return (arrayA[0] << 1) | (carry ? LSB : 0);
    }
    
    function RotateLeftByX(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const MSB = 0x80000000;
        const LSB = 0x00000001;
        const arrayA = new Int32Array([a]);
        let result = arrayA[0];
    
        for (let j = 0; j < b; j++) {
            let carry = result & MSB;
            result = ((result << 1) | (carry ? LSB : 0)) >>> 0;
        }
        return result;
    }
    
    function RotateRight(a: number, b:any): number {
        checkNumber(a);
        const MSB = 0x80000000;
        const LSB = 0x00000001;
        const arrayA = new Int32Array([a]);
    
        let carry = arrayA[0] & LSB;
        return (arrayA[0] >>> 1) | (carry ? MSB : 0);
    }
    
    function RotateRightByX(a: number, b: number): number {
        checkNumber(a);
        checkNumber(b);
        const MSB = 0x80000000;
        const LSB = 0x00000001;
        const arrayA = new Int32Array([a]);
        let result = arrayA[0];
    
        for (let j = 0; j < b; j++) {
            let carry = result & LSB;
            result = ((result >>> 1) | (carry ? MSB : 0)) >>> 0;
        }
        return result;
    }
    
                // Basisoperationen
        const BASE_OPERATIONS = ['A ADD B', 'B SUB A', 'Transfer A', 'Transfer B'];

        // Reactive Listen für die ALU-Operationen
        const aluOperationsListAdded = ref<string[]>([...BASE_OPERATIONS]);
        const aluOperationsListAvailable = ref<string[]>([]);
    
        // Operationen zu den Listen hinzufügen
        aluOperations.forEach((_, key) => {
            if (!BASE_OPERATIONS.includes(key)) {
                aluOperationsListAvailable.value.push(key);
            }
        });
    
    return {
        aluOperations,
        aluOperationsListAdded,
        aluOperationsListAvailable,
    };
});
