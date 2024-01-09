import {defineStore} from "pinia"
import { v4 as uuidv4 } from 'uuid'
import { useControlTable } from '../store/ControlTableManagement';
import _, { update } from 'lodash';



export const useRegisterStore = defineStore("register", {
    state: () => ({
        register: [{
            id: uuidv4(),
            registerValue: new Int32Array(1),
            registerName: "ACCU", 
            userReg: false,
            active: false,
            description: "Üblicherweise das benutzte Arbeitsregister für die meisten arithmetischen Operationen."
        },
        {
            id: uuidv4(),
            registerValue: new Int32Array(1),
            registerName: "PC",
            userReg: false,
            active: false,
            description: "Speichert die Adresse des nächsten auszuführenden Assembler-Befehls. Die 8 höchstwertigen Bits sind normalerweise Null."
        },
        {
            id: uuidv4(),
            registerValue: new Int32Array(1),
            registerName: "IR",
            userReg: false,
            active: false,
            description: "Accumulator"
        },
        {
            id: uuidv4(),
            registerValue: new Int32Array(1),
            registerName: "MAR",
            userReg: false,
            active: false,
            description: "Adressschnittstelle für Schreib- und Leseoperationen auf dem Hauptspeicher.\n"+
            "Mögliche Mikrobefehle sind:\n"+
            "M[MAR] ← MDR\n"+
            "MDR ← M[MAR]"
        },
        {
            id: uuidv4(),
            registerValue: new Int32Array(1),
            registerName: "MDR",
            userReg: false,
            active: false,
            mdrSel: "",
            description: "Accumulator"
        }
    ],
    }),
    getters: {
        // Get all registers
        getAllRegister: (state) => () => {
          return state.register;
        },
        //Get all user registers
        getAllUserRegister: (state) => () => {
            return state.register.filter((register) => register.userReg === true);
        },
        // Get all registers except MAR
        getRegisterExceptMAR: (state) => () => {
          return state.register.filter((register) => register.registerName !== "MAR" && register.userReg === false);
        },
      
        // Get the value of a register by ID
        getRegisterValue: (state) => (id: string) => {
          return state.register.find((register) => register.id === id)?.registerValue;
        },
      
        // Get the description of a register by ID
        getDescription: (state) => (id: string) => {
          return state.register.find((register) => register.id === id)?.description;
        },
      
        // Get the value of the MAR register
        getMARAdressValue: (state) => () => {
          return state.register.find((register) => register.registerName === "MAR" && register.userReg === false)?.registerValue;
        },
      
        // Get the value of the MDR register
        getMDRValue: (state) => () => {
          return state.register.find((register) => register.registerName === "MDR" && register.userReg === false)?.registerValue;
        },
      
        // Get the active status of the MDR register
        getMDRStatusActive: (state) => () => {
          return state.register.find((register) => register.registerName === "MDR" && register.userReg === false)?.active;
        },
      
        // Get the ID of the MDR register
        getMDRId: (state) => () => {	
          return state.register.find((register) => register.registerName === "MDR" && register.userReg === false)?.id;
        },
      
        // Get the user description of a register by ID
        getUserDescription: (state) => (id: string) => {
          return state.register.find((register) => register.id === id)?.description;
        },
        
        getAccuRegister: (state) => () => { 
            return state.register.find((register) => register.registerName === "ACCU" && register.userReg === false);
        },
        getPCRegister: (state) => () => {
            return state.register.find((register) => register.registerName === "PC" && register.userReg === false);
        },
        getIRRegister: (state) => () => {
            return state.register.find((register) => register.registerName === "IR" && register.userReg === false);
        },
        getMDRRegister: (state) => () => {
            return state.register.find((register) => register.registerName === "MDR" && register.userReg === false);
        }
    },
    actions: {
        addRegister(name: string, description: string) {
            if(!name) return;
            let newRegister = {
                id: uuidv4(),
                registerValue: new Int32Array(1),
                registerName: name,
                userReg: true,
                active: false,
                description: description
            };
            this.register.push(newRegister);
            const controlTable = useControlTable();
            let copie = _.cloneDeep(newRegister);
            controlTable.updateRegisterinControlTable(copie);
        },
        deleteRegister(id: string) {
            this.register = this.register.filter((register) => register.id !== id);
            const controlTable = useControlTable();
            controlTable.updateRemovedRegisterinControlTable(id);
        },
        setMDRSel(value: string){
            const mdrRegister = this.register.find((register) => register.registerName === "MDR" && register.userReg === false);
            if (mdrRegister) {
                mdrRegister.mdrSel = value;
            }
        },
        setMDRValue(value: Int32Array){
            const mdrRegister = this.register.find((register) => register.registerName === "MDR" && register.userReg === false);
            if (mdrRegister) {
                mdrRegister.registerValue = value;
            }
        },
        setRegisterValue(id: string, value: Int32Array) {
            this.register.find((register) => register.id === id)!.registerValue = value;
        },
        setEveryRegisterToInitialValue() {
            this.register.forEach((register) => {
                register.registerValue[0] = 0;
                });
        },
        setRegisterForBackStep(reg: any){
            this.register.forEach((register) => {
                reg.forEach((reg: any) => {
                    if(register.id === reg.id){
                        register.registerValue = new Int32Array([reg.value]);
                    }
                });
            });
        },
    }
})

