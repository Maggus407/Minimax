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

        function step() {
            if (finished || debuggerCompiled.length === 0) {
                if (finished) writeToRegister();
                return;
            }
        
            const currentOperation = aluStore.aluOperations.get(currentRow.aluCtrl);
            let result = 0;
        
            if (currentOperation) {
                const A = typeof currentRow.aluA === 'string' ? tempRegister.get(currentRow.aluA) || 0 : currentRow.aluA;
                const B = typeof currentRow.aluB === 'string' ? tempRegister.get(currentRow.aluB) || 0 : currentRow.aluB;
                result = currentOperation.operation(A, B);
            }
        
            if (currentRow.read_or_write_mem) {
                currentRow.read_or_write_mem();
            }
        
            currentRow.registerWrite.forEach((register: any) => tempRegister.set(register, result));
        
            if (currentRow.next === -1) {
                finished = true;
            } else {
                currentRow = debuggerCompiled[currentRow.jump !== null && result === 0 ? currentRow.jump : currentRow.next];
            }
        }
        

// Füge eine neue Zustandsvariable hinzu, um zu verfolgen, ob die Ausführung bei einem Breakpoint pausiert wurde
let isPausedAtBreakpoint = false;

function run() {
    const startTime = performance.now();

    // Prüfen, ob die Ausführung beim letzten Mal bei einem Breakpoint pausiert wurde
    if (isPausedAtBreakpoint) {
        // Wenn ja, versuche, mit dem nächsten Schritt fortzufahren, bevor die Schleife beginnt
        step();
        isPausedAtBreakpoint = false; // Setze das Flag zurück, da wir versuchen, fortzufahren
    }

    // Laufe durch die Befehle, bis ein Breakpoint erreicht oder die Ausführung beendet ist
    while (!currentRow.breakpoint && !finished) {
        step();
    }

    if (currentRow.breakpoint) {
        // Wenn die Ausführung aufgrund eines Breakpoints pausiert wird, setze das Flag
        isPausedAtBreakpoint = true;
    }

    let page = memoryStore.getDebuggerPage();
    writeToRegister();
    memoryStore.setDebuggerPage(page);

    // Nachdem die Funktion ausgeführt wurde
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log(`Ausführungszeit: ${executionTime} Millisekunden`);
}


    function writeToRegister(){
        let a = [...tempRegister.keys()];

        a.forEach((value) => {
            registerStore.register.set(value, tempRegister.get(value) as number);
            registerStore.registerOrder.forEach((reg: any) => {
                if(reg.title === value){
                    reg.Value = tempRegister.get(value) as number;
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
        finished = false;
    }

    function writeToMemory(){
        const index = tempRegister.get("MAR") as number;
        const value = tempRegister.get("MDR") as number;
        memoryStore.setRawMemoryValue(index, value);
    }

    function writeMemoryToMDR(){
        tempRegister.set("MDR", memoryStore.getValue_at_MAR_Address(tempRegister.get("MAR") as number));
    }

    return{
        start,
        step,
        stepBack,
        stop,
        run
    }

});