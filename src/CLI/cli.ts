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
  .option('-i, --importFiles <items...>', 'Files to be imported', (val, prev) => prev.concat(val as any), [])
  .option('-if, --importFrom <addresses...>', 'Start addresses for the imported files', (val, prev) => prev.concat(val as any), [])
  .option('-ib, --importBytes <bytes>', 'Number of bytes to import.')
  .arguments('<file>')
  .action((file:any, options:any) => {
    const memoryStore = useMemoryStore();
    const importFiles = options.importFiles;
    const importFrom = options.importFrom;
    console.log('Importing files:', importFiles);
    console.log('Start addresses:', importFrom);
    if (options.importFiles) {
      const filePath = options.importFiles;
      console.log(`Importiere Datei: ${filePath}`);

        if (importFiles.length > 0 && importFrom.length > 0) {
          if (importFiles.length !== importFrom.length) {
            console.error('Number of import files and start addresses must match.');
            return;
          }

          importFiles.forEach((filePath: any, index: any) => {
            const startAddress = importFrom[index];
            console.log(`Importing file: ${filePath} to address ${startAddress}`);

            fs.readFile(filePath, (err, data) => {
              if (err) {
                console.error(`Error reading file: ${err.message}`);
                return;
              }

              const buffer = Buffer.from(data);
              memoryStore.FileImport(buffer, buffer.length, startAddress);
            });
          })
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
        }
    }
  });

program.parse(process.argv);