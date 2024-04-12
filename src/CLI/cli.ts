import { createPinia, setActivePinia } from 'pinia';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { useMemoryStore } from '../store/MemoryStore.ts';
import { useImport } from '../Import-Export/Import.ts';
import { useDebugerStore } from '../store/DebugerStore.ts';

const pinia = createPinia(); 
setActivePinia(pinia);

const program = new Command();

program
  .version('2.0.0')
  .description('Minimax Simulator CLI')
  .option('-e, --exportFile <path>', 'Path to the file the machine memory should be exported to.')
  .option('-ef, --exportFrom <address>', 'First address of the memory to be included in the dump.')
  .option('-et, --exportTo <address>', 'Last memory address to be included in the dump.')
  .option('-i, --importFile <path>', 'Path to the file that will be imported into the machine memory.')
  .option('-if, --importFrom <address>', 'First address in the machine memory to which the file will be imported (Standard is 0).')
  .option('-ib, --importBytes <bytes>', 'Number of bytes to import.')
  .arguments('<file>')
  .action((file, options) => {
    const memoryStore = useMemoryStore();
    if (options.importFile) {
      const filePath = options.importFile;
      console.log(`Importiere Datei: ${filePath}`);
      const importFrom = options.importFrom || "0";
      const importBytes = options.importBytes ? parseInt(options.importBytes) : 0;
      
          // Lies die Datei als Buffer
          fs.readFile(filePath, (err, data) => {
              if (err) {
                  console.error(`Fehler beim Lesen der Datei: ${err.message}`);
                  return;
              }
              // Da wir nicht FileReader verwenden, passen wir den Buffer direkt an
              // Konvertiere den Buffer in ein Array, das von deiner Importfunktion verarbeitet werden kann
              const buffer = new ArrayBuffer(data.length);
              const view = new Uint8Array(buffer);
              for (let i = 0; i < data.length; ++i) {
                  view[i] = data[i];
              }
              // Rufe die angepasste Importfunktion auf
              memoryStore.FileImport({name: path.basename(filePath), data: buffer}, importBytes, importFrom);
          });
      }
        // Specify the path to the ZIP file
        const debug = useDebugerStore();
        fs.readFile(file, async (err, data) => {
          if (err) {
            console.error(`Error reading the file: ${err.message}`);
            return;
          }
          
          // Verwende den Import-Store, um die Datei zu importieren
          // Deine Import-Funktion muss angepasst werden, um mit Buffern umzugehen
          const importStore = useImport();
          try {
            const fileObject = {
              name: path.basename(file), // Extrahiere den Dateinamen aus dem Pfad
              data: data // Der gelesene Buffer
            };
            await importStore.Import_CLI( fileObject );
            console.log('File imported successfully');
          } catch (error: any) {
            console.error(`Error importing the file: ${error.message}`);
          }
          debug.start();
          if(options.exportFile) {
             debug.path = options.exportFile;
             debug.exportFrom = options.exportFrom || "0";
             debug.exportTo = options.exportTo || "FFFFFF";
          }
          setTimeout(() => {
            debug.run();
          },0)
        });
  });

program.parse(process.argv);