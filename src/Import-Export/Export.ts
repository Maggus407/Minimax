import { useRegisterStore } from "@/store/RegisterStore";
import { useMultiplexerStore } from "@/store/MultiplexerStore";
import { useControlTableStore } from "@/store/ControlTableStore";
import { useAluStore } from "@/store/AluStore";
import { defineStore } from 'pinia';
import JSZip from 'jszip';


export const useExport = defineStore('export', () => {
    const register = useRegisterStore();
    const multiplexer = useMultiplexerStore();
    const controlTable = useControlTableStore();
    const alu = useAluStore();

    
//Get the data from the stores
let regOb: any;
let muxA: any;
let muxB: any;
let aluSel: any;
let ct: any;

function getData(){
    regOb = register.registerOrder;
    muxA = multiplexer.muxA;
    muxB = multiplexer.muxB;
    aluSel = alu.getOperation_Export();
    ct = controlTable.controlTable;
}

//Prepare the data to be exported

//Create the files with the data
//machine.json
let machineJson: any;
function determineType(title:any) {
    // Prüft, ob der Titel eine Zahl ist
    return isNaN(title) ? "register" : "constant";
  }

  function createData_For_machine() {
    getData(); // Stellen Sie sicher, dass diese Funktion die notwendigen Daten lädt

    machineJson = {
        machine: { // Fügen Sie hier das Elternelement "machine" hinzu
            muxInputs: [
                {
                    input: muxA.length > 0 ? muxA.map((mux: any) => ({ type: determineType(mux.title), value: mux.title })) : [],
                    muxType: "A"
                },
                {
                    input: muxB.length > 0 ? muxB.map((mux: any) => ({ type: determineType(mux.title), value: mux.title })) : [],
                    muxType: "B"
                }
            ],
            registers: {
                register: regOb.filter((reg: any) => !register.BASE_REGISTERS.includes(reg.title)).map((reg: any) => ({
                    size: "BITS_32",
                    name: reg.title,
                    description: reg.Description || "" // Stellen Sie sicher, dass ein leerer String als Fallback vorhanden ist
                }))
            },
            alu: {
              operation: aluSel // Direktes Zuweisen der Operationen als Array von Zeichenketten
            }
        }
    };

    return { machineJson };
}


//Create the files for the controltable
//signal.json
let table: any;
function createData_For_signal() {
  getData(); // Stellen Sie sicher, dass Sie die neuesten Daten laden
  let signalTable: any = { signaltable: { row: [] } };

  ct.forEach((row: any) => {
      let rowEntry: any = { signal: [] };

      // Label hinzufügen, falls vorhanden
      if (row.label) {
          rowEntry.label = row.label;
      }

      // Index für ALU_SELECT_A und ALU_SELECT_B basierend auf muxA und muxB
      const indexA = muxA.findIndex((mux: any) => mux.title === row.AluSelA?.title);
      const indexB = muxB.findIndex((mux: any) => mux.title === row.AluSelB?.title);

      if (indexA >= 0) {
          rowEntry.signal.push({ name: "ALU_SELECT_A", value: indexA.toString() });
      }
      if (indexB >= 0) {
          rowEntry.signal.push({ name: "ALU_SELECT_B", value: indexB.toString() });
      }

            if (row.Hs_R_W !== undefined && row.Hs_R_W === 1) {
              rowEntry.signal.push({ name: "MEM_RW", value: row.Hs_R_W ? "1" : "0" });
            }
            if (row.MDRSel !== undefined && row.MDRSel === 1) {
                rowEntry.signal.push({ name: "MDR_SEL", value: row.MDRSel ? "1" : "0" });
            }
            if (row.HsCs !== undefined) {
                rowEntry.signal.push({ name: "MEM_CS", value: row.HsCs ? "1" : "0" });
            }

      // Aktive RegisterWrite Signale hinzufügen
      row.registerWrite.forEach((register: any) => {
          if (register.isActive) {
              rowEntry.signal.push({ name: `${register.title}.W`, value: "1" });
          }
      });

        // AluCtrl Signal mit Index hinzufügen
        if (row.AluCtrl) {
            const aluCtrlIndex = alu.aluOperationsListAdded.findIndex((op: string) => op === row.AluCtrl);
            rowEntry.signal.push({ name: "ALU_CTRL", value: aluCtrlIndex.toString() });
        }


      // Sprunglogik hinzufügen
      if (row.jumpSet && row.jump === null) {
          rowEntry["unconditional-jump"] = { target: row.next?.adress.toString() || "0" };
      }
      if (row.next && row.jump) {
          rowEntry["conditional-jump"] = {
              "cond0-target": row.next.adress.toString(),
              "cond1-target": row.jump.adress.toString()
          };
      }
      if(row.comment) {
        rowEntry["comment"] = row.comment
      }

      signalTable.signaltable.row.push(rowEntry);
  });

  table = signalTable;
  return {table};
}

async function exportZip(){
// JSON ausgeben (zur Demonstration)
const machineData = createData_For_machine();
const signalData = createData_For_signal();
console.log("machine.json", JSON.stringify(machineJson, null, 2));
console.log("signal.json", JSON.stringify(table, null, 2));

// Erstelle ein neues JSZip-Objekt
const zip = new JSZip();

// Füge machine.json und signal.json zur ZIP-Datei hinzu
zip.file("machine.json", JSON.stringify(machineData.machineJson, null, 2));
zip.file("signal.json", JSON.stringify(signalData.table, null, 2));

// Generiere die ZIP-Datei und starte den Download
zip.generateAsync({ type: "blob" })
    .then(function(content) {
        // Nutze FileSaver.js oder einen ähnlichen Mechanismus, um die Datei herunterzuladen
        // Beispiel: saveAs(content, "export.zip");
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "export.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

//only for the machine.json No zip file
async function exportMachine(){
    const machineData = createData_For_machine();
    const machineJsonString = JSON.stringify(machineData.machineJson, null, 2);
    
    const blob = new Blob([machineJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'machine.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

//only for the signal.json No zip file
async function exportSignal(){
    const signalData = createData_For_signal();
    const signalJsonString = JSON.stringify(signalData.table, null, 2);
    
    const blob = new Blob([signalJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signal.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

//QuickSave
async function quickSave() {
    const machineData = createData_For_machine();
    const signalData = createData_For_signal();

    // Erstelle ein neues JSZip-Objekt
    const zip = new JSZip();

    // Füge machine.json und signal.json zur ZIP-Datei hinzu
    zip.file("machine.json", JSON.stringify(machineData.machineJson, null, 2));
    zip.file("signal.json", JSON.stringify(signalData.table, null, 2));

    // Generiere die ZIP-Datei als Blob
    const zipBlob = await zip.generateAsync({ type: "blob" });

    return zipBlob;
}

return{
    exportZip,
    exportMachine,
    exportSignal,
    quickSave,
}
});

