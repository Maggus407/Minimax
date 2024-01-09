import {defineStore} from "pinia";
import { useDebuggerStore } from "./DebuggerStore";
import { v4 as uuidv4 } from 'uuid'
import _, { update } from 'lodash';

interface ControlTableLine {
    id: string,
    breakpoint: boolean,
    label: string,
    adresse: number,
    aluSelA: any | null,
    aluSelB: any | null,
    mdrSel: boolean | null,
    hsCS: number,
    hsRW: number | null,
    aluOp: any,
    registerWrite: any,
    aluFlagZero: boolean,
    nextInstruction: any,
    condJump: boolean,
    jump: any,
    rtNotation: any,
    description: string
}

export const useControlTable = defineStore("controlTable", {
    state: () => ({
        row:[] as ControlTableLine[],
    }),
    actions: {
        addNewControlTableLine(alu: any,register: any, muxA: any, muxB: any) {
            let original = {
                id: uuidv4(),
                breakpoint: false,
                label: "",
                adresse: 0,
                aluSelA: muxA,
                aluSelB: muxB,
                mdrSel: null,
                hsCS: 0,
                hsRW: null,
                aluOp: null,
                registerWrite: register,
                aluFlagZero: false,
                jump: [],
                condJump: false,
                nextInstruction: null,
                rtNotation: [],
                description: ""
            };
            //this.row.push(original);
            let copie = _.cloneDeep(original);
            this.row.push(copie);         
            this.updateNextInstruction();
            const debuggerStore = useDebuggerStore();
            debuggerStore.updateFinished_to_false();
        },
        deleteControlTableLine(id: string) {
            let s: string = "";
            let removedRow = this.row.find(line => line.id === id);
            if (removedRow) {
                s = removedRow.id;
            }
            this.row = this.row.filter(line => line.id !== id);
            this.updateNextInstruction();
            this.updateJumps(s);
        },
        setInitialState(){
            if(this.row.length > 0){
                this.row.forEach((line) => {
                    line.aluFlagZero = false;
                });
            }
        },
        updateNextInstruction() {
            this.row.forEach((line, index) => {
                if(line.jump.length != 0){
                    return;
                }else{
                    if(line.condJump === true && (line.nextInstruction === undefined || line.nextInstruction === null)) {
                        line.nextInstruction = -1;
                    }else if(line.condJump === true){
                        return;
                    }
                    if(this.row[index+1] !== undefined && this.row[index].condJump === false) {
                        line.nextInstruction = this.row[index+1];
                    }else if(this.row[index+1] === undefined) {
                        line.nextInstruction = null;
                    }
                }
            });
            console.log(this.row);
        },
        updateJumps(id: string) {
            this.row.forEach((line) => {
                if(line.jump.length != 0){
                    if(line.jump[0].id == id){
                        line.jump[0] = -1
                    }else if(line.jump[1].id == id){
                        line.jump[1] = -1
                    }
                }
            });
        },      
        updateRTNotation(element: any) {
            let aluOPString = "";
            let rtS = [] as string[];
            console.log("updateRTNotation:");
            console.log(element);
            if (element != null) {
                // HS Operation
                if(element.hsCS === 1 && element.hsRW === 1 && element.mdrSel && element.registerWrite.find((register: any) => register.active && register.registerName === "MDR" && register.userReg === false)){
                    rtS.push("MDR ← M[MAR]");
                    console.log("MDR ← M[MAR]");
                }
                if(element.hsCS === 1 && element.hsRW === 0){
                    rtS.push("M[MAR] ← MDR");
                    console.log("M[MAR] ← MDR");
                }
        
                // ALu Operation
                if(element.aluOp !== null){
                    aluOPString = element.aluOp.rt;
                    if(element.aluSelA !== null){
                        aluOPString = element.aluSelA.register === null ? aluOPString.replace("A", element.aluSelA.value.toString()) : aluOPString.replace("A", element.aluSelA.register.registerName);
                    }else{
                        aluOPString = aluOPString.replace("A", "???");
                    }
                    if(element.aluSelB !== null){
                        aluOPString = element.aluSelB.register === null ? aluOPString.replace("B", element.aluSelB.value.toString()) : aluOPString.replace("B", element.aluSelB.register.registerName);
                    }else{
                        aluOPString = aluOPString.replace("B", "???");
                    }
                    element.registerWrite.forEach((register: any) => {
                        if(register.active && !(element.mdrSel === true && (register.registerName === "MDR" && register.userReg === false))){
                            let newString = ""
                            newString = register.registerName + " ← " + aluOPString;
                            rtS.push(newString);
                        }
                    });
                }   
                console.log(rtS);   
                element.rtNotation = rtS;             
            }
        },        
        updateAllRt_notation() {
                this.row.forEach((line) => {
                    this.updateRTNotation(line);    
                    console.log(line);
                });
        },
        updateRegisterinControlTable(register: any) {
            if(this.row.length  > 0){
                this.row.forEach((line) => {
                    let registerCopy = _.cloneDeep(register);
                    line.registerWrite.push(registerCopy)
                });
            }
        },
        updateRemovedRegisterinControlTable(id: string) {
                if(this.row.length  > 0){
                    this.row.forEach((line) => {
                        line.registerWrite = line.registerWrite.filter((register: any) => register.id !== id);
                    });
                }
                this.updateAllRt_notation();
        },
        updateRow(id: string, rowName:string, value: any) {
            let row = this.row.find(line => line.id === id);
            if (row) {
                row = value;
            }
        }
    },
});
