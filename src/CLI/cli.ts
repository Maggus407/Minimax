#!/usr/bin/env node
import { createPinia, setActivePinia } from 'pinia';
import { Command } from 'commander';
import { useMemoryStore } from '../store/MemoryStore.js'; 
import { ref } from 'vue';

const pinia = createPinia();
setActivePinia(pinia);
const program = new Command();

program
.version('2.0.0')
.description('CLI für die Steuerung der Minimax-Simulation')
.option('-t, --test', 'Teste die Simulation')
.action(() => {
  
  const memoryStore = useMemoryStore();
    console.log('Hello World');
    console.log(memoryStore.getDebuggerPage());
  });

// Add commands and options here
program.parse(process.argv);
