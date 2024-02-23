import { defineStore } from 'pinia';
import { useControlTableStore } from './ControlTableStore';
import { useRegisterStore } from './RegisterStore';
import { useMemoryStore } from './MemoryStore';
import { useAluStore } from './AluStore';
import { ref } from 'vue';


export const useDebugerStore = defineStore('debugger', () => {

    const controlTable = useControlTableStore();
    const registerStore = useRegisterStore();
    const memoryStore = useMemoryStore();
    const aluStore = useAluStore();
    const debuggerCompiled: any = [];
    let aluResult = 0;
    let Alu_UI = ref(0);
    let currentRow: any;
    let finished = false;
    const counter = ref(0);
    let currentStep = 0;

    /**
     * Prepare the debuger for the start
     * Create's an array with essential information for the debuger.
     * @returns void
     */
    function start(){
        let a = [...registerStore.register];
        a.forEach((value) => {
            registerStore.register.set(value[0], value[1]);
        });
        console.log(registerStore.register);
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
                breakpoint: row.breakpoint,
                registerWrite: regNames,
                aluA: convertIfNumeric(row.AluSelA),
                aluB: convertIfNumeric(row.AluSelB),
                aluCtrl: alu,
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
            console.log(num);
            // Prüfe, ob die Umwandlung gültig ist (nicht NaN)
            return isNaN(num) ? value.title : num;
        };

        function calculateOperation(){
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
                currentRow.read_or_write_mem();
            }
            //Write to Register
            if(currentRow.registerWrite.length > 0){
                currentRow.registerWrite.forEach((register: string) => {
                    registerStore.register.set(register, result);
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

        function step(){
            if(debuggerCompiled.length === 0)return;
            if(finished){
                writeToRegister();
                return; 
            }else{
                calculateOperation();
                currentStep++;
                counter.value = currentStep;
                Alu_UI.value = aluResult;
            }
        }
        

// Füge eine neue Zustandsvariable hinzu, um zu verfolgen, ob die Ausführung bei einem Breakpoint pausiert wurde
let isPausedAtBreakpoint = false;

function run() {
    const startTime = performance.now();
    if(debuggerCompiled.length === 0)return;
    if(finished){
        writeToRegister();
        return; 
    }
    // Prüfen, ob die Ausführung beim letzten Mal bei einem Breakpoint pausiert wurde
    if (isPausedAtBreakpoint) {
        // Wenn ja, versuche, mit dem nächsten Schritt fortzufahren, bevor die Schleife beginnt
        calculateOperation();
        currentStep++;
        Alu_UI.value = aluResult;
        isPausedAtBreakpoint = false; // Setze das Flag zurück, da wir versuchen, fortzufahren
    }

    // Laufe durch die Befehle, bis ein Breakpoint erreicht oder die Ausführung beendet ist
    while (!currentRow.breakpoint && !finished) {
        calculateOperation();
        currentStep++;
    }

    if (currentRow.breakpoint) {
        // Wenn die Ausführung aufgrund eines Breakpoints pausiert wird, setze das Flag
        isPausedAtBreakpoint = true;
    }
    counter.value = currentStep;
    let page = memoryStore.getDebuggerPage();
    writeToRegister();
    memoryStore.setDebuggerPage(page);

    // Nachdem die Funktion ausgeführt wurde
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log(`Ausführungszeit: ${executionTime} Millisekunden`);
}


    function writeToRegister(){
        let a = [...registerStore.register.keys()];

        a.forEach((value) => {
            registerStore.register.set(value, registerStore.register.get(value) as number);
            registerStore.registerOrder.forEach((reg: any) => {
                if(reg.title === value){
                    reg.Value = registerStore.register.get(value) as number;
                }
            });
        });
    }

    function stepBack(){
        console.log("StepBack");
    }

    function stop(){
        //clear the debuggerCompiled
        debuggerCompiled.splice(0, debuggerCompiled.length);
        registerStore.registerReset();
        memoryStore.setInitialMemory();
        finished = false;
        currentStep = 0;
        counter.value = 0;
        Alu_UI.value = 0;
        aluResult = 0;
    }

    function writeToMemory(){
        const index = registerStore.register.get("MAR") as number;
        const value = registerStore.register.get("MDR") as number;
        memoryStore.setRawMemoryValue(index, value);
    }

    function writeMemoryToMDR(){
        registerStore.register.set("MDR", memoryStore.getValue_at_MAR_Address(registerStore.register.get("MAR") as number));
    }

    return{
        start,
        step,
        stepBack,
        stop,
        run,
        counter,
        writeToRegister,
        Alu_UI
    }

});