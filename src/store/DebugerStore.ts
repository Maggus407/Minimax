import { defineStore } from 'pinia';
import { useControlTableStore } from './ControlTableStore';
import { useRegisterStore } from './RegisterStore';
import { useMemoryStore } from './MemoryStore';
import { useAluStore } from './AluStore';


export const useDebugerStore = defineStore('debugger', () => {

    const controlTable = useControlTableStore();
    const registerStore = useRegisterStore();
    const memoryStore = useMemoryStore();
    const aluStore = useAluStore();
    const debuggerCompiled: any = [];
    const aluResult = 0;
    let currentRow: any;
    let finished = false;

    //faster?
    const tempRegister: Map<string, number> = new Map();

    /**
     * Prepare the debuger for the start
     * Create's an array with essential information for the debuger.
     * @returns void
     */
    function start(){
        let a = [...registerStore.register];
        a.forEach((value) => {
            tempRegister.set(value[0], value[1]);
        });
        console.log(tempRegister);
        if(controlTable.controlTable.length === 0){
            return;
        }
        controlTable.controlTable.forEach((row: any) => {
            console.log(row);
            const regNames: string[] = [];
            let next = null;
            let jump = null;

            if(row.registerWrite.length > 0){
                row.registerWrite.forEach((reg: any) => {
                        if(reg.isActive){
                            regNames.push(reg.title);
                        }
                });
            }
            //Remove MDR if MDR is selected for Memory Operation
            if(row.MDRSel && row.HsCs){
                regNames.splice(regNames.indexOf("MDR"), 1);
            }

            if(typeof row.next === 'object'){
                next = row.next.adress;
            }else{
                next = row.next;
            }

            if(row.jump && typeof row.jump === 'object' && row.jump.hasOwnProperty('adress')){
                jump = row.jump.adress;
            }else{
                jump = row.jump;
            }
            
            /**
             * read = true 
             * write = false
             */
            let memOP = null;

            if(row.HsCs && row.Hs_R_W){
                memOP = writeMemoryToMDR;
            }
            if(row.HsCs && !row.Hs_R_W){
                memOP = writeToMemory;
            }

            debuggerCompiled.push({
                breakpoint: row.breakpoint,
                registerWrite: regNames,
                aluA: convertIfNumeric(row.AluSelA),
                aluB: convertIfNumeric(row.AluSelB),
                aluCtrl: row.AluCtrl,
                read_or_write_mem: memOP,
                next: next,
                jump: jump,
            });
        });
        console.log(debuggerCompiled);
        currentRow = debuggerCompiled[0];
    }

        // Hilfsfunktion, um zu prüfen, ob ein Wert ein numerischer String ist, und diesen in eine Zahl umzuwandeln
        const convertIfNumeric = (value:any) => {
            if(value === null || value === undefined){
                return value;
            }
            // Versuche, den Wert in eine Zahl umzuwandeln
            const num = Number(value.title);
            // Prüfe, ob die Umwandlung gültig ist (nicht NaN)
            return isNaN(num) ? value.title : num;
        };

    function step(){
        let result:any = 0;
        if(finished)return;
        if(debuggerCompiled.length === 0 )return;
        //Start Alu Operation
        if(currentRow.aluCtrl !== null){
            let A = 0;
            let B = 0;
            if(typeof currentRow.aluA === 'string'){
                A = tempRegister.get(currentRow.aluA);
            }else{
                A = currentRow.aluA;
            }
            if(typeof currentRow.aluB === 'string'){
                B = tempRegister.get(currentRow.aluB);
            }else{
                B = currentRow.aluB;
            }
            result = aluStore.aluOperations.get(currentRow.aluCtrl)?.operation(A, B);
        }
        //Start Memory Operation
        if(currentRow.read_or_write_mem !== null){
            currentRow.read_or_write_mem();
        }
        //Write to Register
        if(currentRow.registerWrite.length > 0){
            currentRow.registerWrite.forEach((register: string) => {
                tempRegister.set(register, result);
            });
        }
        //Jump to next row
        if(currentRow.next === -1){
            finished = true;
            return;
        }
        if(currentRow.jump !== null && result === 0){
            currentRow = debuggerCompiled[currentRow.jump];
        }else{
            currentRow = debuggerCompiled[currentRow.next];
        }
        
    }

    function run(){
        const startTime = performance.now();
        while(!currentRow.breakpoint && !finished){
            step();
        }
        let a = [...tempRegister.keys()];

        a.forEach((value) => {
            registerStore.register.set(value, tempRegister.get(value));
        });
        // Nachdem die Funktion ausgeführt wurde
const endTime = performance.now();

// Berechne die Differenz, um die Ausführungszeit zu erhalten
const executionTime = endTime - startTime;

console.log(`Ausführungszeit: ${executionTime} Millisekunden`);
    }

    function stepBack(){
        console.log("StepBack");
    }

    function stop(){
        //clear the debuggerCompiled
        debuggerCompiled.splice(0, debuggerCompiled.length);
        registerStore.registerReset();
        finished = false;
    }

    function writeToMemory(){
        const index = registerStore.register.get("MAR") as number;
        const value = registerStore.register.get("MDR") as number;
        memoryStore.setRawMemoryValue(index, value);
    }

    function writeMemoryToMDR(){
        registerStore.register.set("MDR", memoryStore.getValue_at_MAR_Address());
    }

    return{
        start,
        step,
        stepBack,
        stop,
        run
    }

});