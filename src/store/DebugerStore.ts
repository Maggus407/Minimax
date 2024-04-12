import { defineStore } from 'pinia';
import { useControlTableStore } from './ControlTableStore.ts';
import { useRegisterStore } from './RegisterStore.ts';
import { useMemoryStore } from './MemoryStore.ts';
import { useAluStore } from './AluStore.ts';
import { ref, watch } from 'vue';

interface StepBack{
    Register: any;
    Alu: number;
    Memory: any;
}

export const useDebugerStore = defineStore('debugger', () => {

    const controlTable = useControlTableStore();
    const registerStore = useRegisterStore();
    const memoryStore = useMemoryStore();
    const aluStore = useAluStore();
    const debuggerCompiled: any = [];
    let aluResult = 0;
    let Alu_UI = ref(0);
    let currentRow: any;
    let finished = ref(false);
    const counter = ref(0);
    let currentStep = 0;
    const executing = ref(false);
    const currentAdress = ref(0);
    const stopping = ref(false);
    let path = ref("");
    let exportFrom = ref("0");
    let exportTo = ref("FFFFFF");

    const ringBuffer = new Map<number, StepBack>();
    const ringBufferSize = 200;

    /**
     * Prepare the debuger for the start
     * Create's an array with essential information for the debuger.
     * @returns void
     */
    function start(){
        //Init the RingBuffer
        ringBuffer.clear();
        for(let i = 0; i < ringBufferSize; i++){
            ringBuffer.set(i, {} as StepBack);
        }

        let a = [...registerStore.register];
        a.forEach((value) => {
            registerStore.register.set(value[0], value[1]);
        });
        //console.log(registerStore.register);
        if(controlTable.controlTable.length === 0){
            return;
        }
        controlTable.controlTable.forEach((row: any) => {
            //console.log(row);
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
            let mdr = row.registerWrite.find((reg: any) => reg.title === "MDR" && reg.isActive);
            //Remove MDR if MDR is selected for Memory Operation
            if(row.MDRSel){
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

            if(row.Hs_R_W && row.HsCs && row.MDRSel && mdr){
                memOP = writeMemoryToMDR;
            }
            if(row.HsCs && row.Hs_R_W == false){
                memOP = writeToMemory;
            }
            let alu = null;
            if(row.AluCtrl === null || row.AluCtrl === undefined || row.AluCtrl === "-"){
                alu = null;
            }else{
                alu = row.AluCtrl;
            
            }

            debuggerCompiled.push({
                predecessor: [],
                breakpoint: row.breakpoint,
                address: row.adress,
                registerWrite: regNames,
                aluA: convertIfNumeric(row.AluSelA),
                aluB: convertIfNumeric(row.AluSelB),
                aluCtrl: alu,
                read_or_write_mem: memOP,
                next: next,
                jump: jump,
            });
            
        });
        //console.log(debuggerCompiled);
        currentRow = debuggerCompiled[0];
    }

        // Hilfsfunktion, um zu prüfen, ob ein Wert ein numerischer String ist, und diesen in eine Zahl umzuwandeln
        const convertIfNumeric = (value:any) => {
            if(value === null || value === undefined){
                return value;
            }
            // Versuche, den Wert in eine Zahl umzuwandeln
            const num = Number(value.title);
            //console.log(num);
            // Prüfe, ob die Umwandlung gültig ist (nicht NaN)
            return isNaN(num) ? value.title : num;
        };

        function calculateOperation(){
            currentStep++;
            let ringbufferIndex = currentStep % ringBufferSize;
            let memorySave = {changed: false, index: 0, value: 0};
            let tmpAlu = aluResult;
            let result:any = 0;
            //Start Alu Operation
            if(currentRow.aluCtrl !== null){
                let A = 0;
                let B = 0;
                if(typeof currentRow.aluA === 'string'){
                    A = registerStore.register.get(currentRow.aluA) as number;
                }else{
                    A = currentRow.aluA;
                }
                if(typeof currentRow.aluB === 'string'){
                    B = registerStore.register.get(currentRow.aluB) as number;
                }else{
                    B = currentRow.aluB;
                }
                result = aluStore.aluOperations.get(currentRow.aluCtrl)?.operation(A, B);
                aluResult = result;
            }
            //Start Memory Operation
            if(currentRow.read_or_write_mem !== null){
                if(currentRow.read_or_write_mem === writeToMemory) {
                    //Speicher Zelle sichern
                    memorySave.changed = true;
                    memorySave.index = registerStore.register.get("MAR") as number;
                    memorySave.value = memoryStore.getValue_at_MAR_Address(memorySave.index);
                    currentRow.read_or_write_mem();
                } else {
                    // Andere Funktion ausführen
                    currentRow.read_or_write_mem();
                }                
            }
            //Save StepBack
            ringBuffer.set(ringbufferIndex, {
                Register: registerStore.getRegisters(),
                Alu: tmpAlu,
                Memory: memorySave
            });

            //Write to Register
            if(currentRow.registerWrite.length > 0){
                currentRow.registerWrite.forEach((register: string) => {
                    registerStore.register.set(register, result);
                });
            }
            //Jump to next row
            if(currentRow.next === -1){
                finished.value = true;
                console.log(memoryStore.rawMemory.slice(0, 10));
                if(path.value != ""){
                    memoryStore.exportMemoryToFile(path.value, exportFrom.value, exportTo.value);
                    console.log(path.value);
                    console.log("Test");
                }
                return;
            }

            // Zur nächsten Zeile springen
            let tmp = currentRow.address;
            if (currentRow.jump !== null && result === 0) {
                currentRow = debuggerCompiled[currentRow.jump];
                currentRow.predecessor.push(tmp);
            } else {
                currentRow = debuggerCompiled[currentRow.next];
                currentRow.predecessor.push(tmp);
            }
        }

        function step(){
            console.log(debuggerCompiled);  
            console.log(currentRow);
            if(debuggerCompiled.length === 0)return;
            if(finished.value){
                writeToRegister();
                return; 
            }else{
                calculateOperation();
                writeToRegister();
                counter.value = currentStep;
                Alu_UI.value = aluResult;
                currentAdress.value = currentRow.address;
                console.log("CurrentRow" + currentRow.address);
                console.log(currentAdress.value);
            }
            console.log(ringBuffer);
        }
        

// Füge eine neue Zustandsvariable hinzu, um zu verfolgen, ob die Ausführung bei einem Breakpoint pausiert wurde
let isPausedAtBreakpoint = false;

let intervalId:any = null; // Globale Variable, um den Interval zu speichern
const stepsPerInterval = 10000; // Anzahl der Schritte, die pro Interval durchgeführt werden sollen
let stopped = ref(false)
let running = ref(false)
function run() {
    running.value = true;
    if (debuggerCompiled.length === 0 || finished.value) {
        finishOperation();
        return;
    }

    if (intervalId !== null) {
        // Bereits laufende Simulation stoppen, falls bereits eine läuft
        clearInterval(intervalId);
    }
    if (isPausedAtBreakpoint) {
        // Wenn ja, versuche, mit dem nächsten Schritt fortzufahren, bevor die Schleife beginnt
        calculateOperation();
        currentAdress.value = currentRow.address;
        Alu_UI.value = aluResult;
        isPausedAtBreakpoint = false; // Setze das Flag zurück, da wir versuchen, fortzufahren
    }

    const startTime = performance.now(); // Startzeit messen
    console.log("Start")
    intervalId = setInterval(() => {
        for (let i = 0; i < stepsPerInterval; i++) {
            if(stopped.value === true){
                console.log("Stopped");
                currentAdress.value = currentRow.address;
                Alu_UI.value = aluResult;
                writeToRegister();
                stopped.value = false;
                counter.value = currentStep;
                running.value = false;
                clearInterval(intervalId);
                break;
            }
            if (!currentRow.breakpoint && !finished.value && stopped.value == false) {
                calculateOperation();
            } else {
                // Bedingungen, um die Ausführung zu stoppen
                clearInterval(intervalId);
                intervalId = null;
                finishOperation();
                running.value = false;

                const endTime = performance.now(); // Endzeit messen
                console.log(`Ausführungszeit: ${endTime - startTime} Millisekunden`); // Ausführungszeit berechnen und ausgeben

                return;
            }
        }
    }, 0); // 10 Millisekunden Pause zwischen den Intervallen
}

function finishOperation() {
    if (currentRow.breakpoint) {
        isPausedAtBreakpoint = true;
    }
    writeToRegister();
    currentAdress.value = currentRow.address;
    Alu_UI.value = aluResult;
    counter.value = currentStep;
    let page = memoryStore.getDebuggerPage();
    memoryStore.setDebuggerPage(page);
    currentAdress.value = currentRow.address;
    const endTime = performance.now();
    console.log(`Ausführungszeit: ${endTime - performance.now()} Millisekunden`);
}


    function writeToRegister(){
        let a = [...registerStore.register.keys()];
        a.forEach((value) => {
            registerStore.registerOrder.forEach((reg: any) => {
                if(reg.title === value){
                    reg.Value = registerStore.register.get(value) as number;
                }
            });
        });
    }

    function resetForStepBack(){
        registerStore.registerReset();
        //memoryStore.setInitialMemory();
        finished.value = false;
        currentStep = 0;
        counter.value = 0;
        Alu_UI.value = 0;
        aluResult = 0;
        currentAdress.value = 0;
    }

    function stepBack() {
        console.log(ringBuffer);
        if (currentStep <= 0) {
            currentRow = debuggerCompiled[0];
            currentAdress.value = currentRow.address;
            resetForStepBack();
            return;
        } else {
            if(finished.value){
                set_Data_Back();
                return;
            }
            const tmp = currentRow.predecessor.pop();
            if(tmp !== undefined){
                currentRow = debuggerCompiled[tmp];
            }
            set_Data_Back();
            currentAdress.value = currentRow.address;
            console.log(registerStore.register);
        }
    }

    function set_Data_Back(){
        finished.value = false;
        let ringbufferIndex = currentStep % ringBufferSize;
        let stepBack = ringBuffer.get(ringbufferIndex);
        if (stepBack === undefined) return;
        if (stepBack.Memory != undefined && stepBack.Memory.changed === true) {
            memoryStore.setRawMemoryValue(stepBack.Memory.index, stepBack.Memory.value);
        }
        if (stepBack.Alu !== undefined) {
            aluResult = stepBack.Alu;
            Alu_UI.value = stepBack.Alu;
        }
        //Set the Register
        if(stepBack.Register !== undefined){
            stepBack.Register.forEach((value: any) => {
                console.log(value);
                registerStore.register.set(value.value, value.title);
            });
        }
        currentStep--;
        counter.value = currentStep;
        writeToRegister();
        console.log("StepBack");
    }

    //watch if executing got changed to false then stop the execution
    watch(executing, (value) => {
        if(value === false){
            stop();
        }
    });

    function stop(){
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        //clear the debuggerCompiled
        executing.value = false;
        stopped.value = false;
        running.value = false;
        debuggerCompiled.splice(0, debuggerCompiled.length);
        registerStore.registerReset();
        memoryStore.setInitialMemory();
        finished.value = false;
        currentStep = 0;
        counter.value = 0;
        Alu_UI.value = 0;
        aluResult = 0;
        currentAdress.value = 0;
    }

    /**
     * Writes the value from the MDR (Memory Data Register) to the memory at the specified index.
     */
    function writeToMemory(){
        const index = registerStore.register.get("MAR") as number;
        const value = registerStore.register.get("MDR") as number;
        memoryStore.setRawMemoryValue(index, value);
    }

    /**
     * Writes the value from the memory at the MAR (Memory Address Register) to the MDR (Memory Data Register).
     * The value is retrieved from the memory store using the address stored in the MAR register.
     */
    function writeMemoryToMDR(){
        registerStore.register.set("MDR", memoryStore.getValue_at_MAR_Address(registerStore.register.get("MAR") as number));
    }

    /**
     * Changes the breakpoint status of the row at the specified index.
     * Change in ControlTabel and debuggerCompiled
     * @param index The index of the row to change the breakpoint status of.
    */
    function changeBreakpoint(index: number){
        console.log(index);
        if(executing.value){
            debuggerCompiled[index].breakpoint = !debuggerCompiled[index].breakpoint;
        }
        controlTable.controlTable[index].breakpoint = !controlTable.controlTable[index].breakpoint;
        console.log(debuggerCompiled[index]);
    }

    return{
        start,
        step,
        stepBack,
        stop,
        run,
        counter,
        writeToRegister,
        Alu_UI,
        executing,
        changeBreakpoint,
        currentAdress,
        stopped,
        running,
        finished,
        debuggerCompiled,
        path,
        exportFrom,
        exportTo,
    }

});