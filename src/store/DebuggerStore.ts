import {defineStore} from "pinia";
import { useRegisterStore } from '../store/RegisterStore';
import { useControlTable } from '../store/ControlTableManagement';
import {useMemory} from '../store/MemoryManagement';

interface DebuggerLine {
    cycle: any;
    row: any,
    register: any,
    aluResult: number,
    memChange: {
      adress: number,  
      changed: boolean,
      value: number
  }
}

export const useDebuggerStore = defineStore("debugger", {
    state: () => ({
        executedRows:[] as DebuggerLine[],
        reg: useRegisterStore(),
        controlTable: useControlTable(),
        memory: useMemory(),
        cycle: 0,
        currentAluState: 0,
        //Stop Simulation after last Element
        finished: false,
        //StartButton
        start: false,
        currentRow: null as any,
            }),
    getters: {
    },
    actions: {
        stepBack() {
            this.finished = false;
            this.cycle--;
            if(this.cycle <= 0){
                this.cycle = 0;
                this.currentRow = this.executedRows[0].row;
            }
            if(this.executedRows.length > 0 && this.cycle >= 0){
              //Set Memory if it has changed
              if(this.executedRows[this.cycle].memChange.changed){
                this.memory.memory[this.executedRows[this.cycle].memChange.adress] = this.executedRows[this.cycle].memChange.value;
              }
                this.currentRow = this.executedRows[this.cycle].row;
                this.reg.setRegisterForBackStep(this.executedRows[this.cycle].register);
                this.executedRows[this.cycle].row.aluFlagZero = false;
                if(this.cycle-1 < 0 ){
                    this.currentAluState = 0
                }else{
                    this.currentAluState = this.executedRows[this.cycle-1].aluResult
                }
                console.log("Step back: " )
                console.log(this.currentAluState)
            }
        },
        stepForward() {
            let result = new Int32Array([0]);
            let memoryChange = {adress: 0, changed: false, value: 0};
            if(!this.finished){ 
                //Save the previous Register for Backwards
                //Save the previous Memory Change if it has changed
                let prevValues = [] as any;
                this.reg.register.forEach((element) => {
                let a = element.registerValue[0];
                prevValues.push({id: element.id, value: a});
                });

            //Memory Operation
            // Write in Memory
            if(this.currentRow.hsCS == 1 && this.currentRow.hsRW == 0){
              //Safe the current change for backsteps
              const adress = this.reg.getMARAdressValue();
              if (adress != null) {
                memoryChange.changed = true;
                memoryChange.adress = adress[0];
                memoryChange.value = this.memory.memory[adress[0]];
              }
              //Write
              this.memory.setMemoryValueAtMarAdress();
          }
            // Read from Memory
            if(this.currentRow.hsCS == 1 && this.currentRow.hsRW == 1 && this.currentRow.mdrSel == 1){
                this.memory.getValueAtMarAdress();
            }

            //Check if alu is set and at least one Input
            if (this.currentRow.aluOp) {
                if (this.currentRow.aluSelA) {
                  this.currentRow.aluOp.inputA = this.currentRow.aluSelA.register?.registerValue ?? this.currentRow.aluSelA.value;
                } else {
                  console.log("No AluSelA found");
                }
                
                if (this.currentRow.aluSelB) {
                  this.currentRow.aluOp.inputB = this.currentRow.aluSelB.register?.registerValue ?? this.currentRow.aluSelB.value;
                } else {
                  console.log("No AluSelB found");
                }
                
                if (this.currentRow.aluOp.inputA != null || this.currentRow.aluOp.inputB != null) {
                  result = this.currentRow.aluOp.output(this.currentRow.aluOp);
                  this.currentAluState = result[0];
                }
              }
              
            //Set Alu Flag = 0
                if(result[0] == 0){
                this.currentRow.aluFlagZero = true;
                }
                //Write the result in every register that is active
                //Check if MDRSel is active = dont write alu Operation in MDR Register
                this.currentRow.registerWrite.forEach((element: { active: any; id: string; registerValue: number; }) => {
                if (element.active && !((element.id === this.reg.getMDRId()) && this.currentRow.mdrSel)) {
                    element.registerValue = result[0];
                    this.reg.setRegisterValue(element.id, result);
                }
            });

            this.cycle++;
            //Data for Backsteps
            if (!this.executedRows.some(e => e.cycle === this.cycle)) {
                this.executedRows.push({cycle: this.cycle, row: this.currentRow, register: prevValues, aluResult: result[0], memChange: memoryChange});
            }
            console.log(this.executedRows)
            this.nextInstruction() 
            }
        },
        fullsimulation() {
            this.start = true;
            if(this.controlTable.row.length == 0){
              alert("No Control Table found!")
              return;
            }else{
              while(!this.finished){
                if(this.currentRow.breakpoint){
                  break;
                }else{
                  this.stepForward();
                }
              }
            }
        },
        startSimulation() {
            console.log("Testing aus dem Pinia Store: " + this.start)
            if(this.controlTable.row.length == 0){
              alert("No Control Table found!")
              return;
            }else{
                this.start = true;
              this.currentRow = this.controlTable.row[0]
            }
            console.log(this.currentRow)
        },
        stopSimulation() {
            console.log("End Simulation")
            this.start = false;
            this.finished = false;
            this.cycle = 0;
            this.currentAluState = 0;
            this.currentRow = null;
            this.executedRows = [];
            this.reg.setEveryRegisterToInitialValue();
            this.memory.setInitialState();
            //Row-Object are still there only the Alu-Flag are resetted
            this.controlTable.setInitialState();
        },
        nextInstruction(){
            if(this.currentRow.nextInstruction == null && this.currentRow.jump.length == 0){
                this.finished = true;
                return;
              }
              if(this.currentRow.aluFlagZero && this.currentRow.jump.length == 2){
                this.currentRow = this.currentRow.jump[1]
              }else if(!this.currentRow.aluFlagZero && this.currentRow.jump[0] != null && this.currentRow.jump.length == 2){
                this.currentRow = this.currentRow.jump[0]
              }else{
                this.currentRow = this.currentRow.nextInstruction;
              }
        },
        updateFinished_to_false(){
            if(this.finished){
              this.finished = false;
              this.nextInstruction();
            }
        }
    }
});