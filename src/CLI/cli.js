#!/usr/bin/env node
import { Command } from 'commander';
import { useMemoryStore } from '../store/MemoryStore'; // Use the path alias

const program = new Command();

program
.version('2.0.0')
.description('CLI für die Steuerung der Minimax-Simulation')
.option('-t, --test', 'Teste die Simulation')
.action(() => {
    const memoryStore = useMemoryStore();
    console.log('Hello World');
  });

// Add commands and options here
program.parse(process.argv);