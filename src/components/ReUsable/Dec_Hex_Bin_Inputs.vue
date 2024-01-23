<template>
    <v-card>
      <v-card-text>
        <v-text-field
            label="Decimal"
            v-model="newItemValueDec"
            @input="handleInput('dec')"
            clearable
        ></v-text-field>
        <v-text-field
            label="Hexadecimal"
            v-model="newItemValueHex"
            @input="handleInput('hex')"
            clearable
        ></v-text-field>
        <v-text-field
            label="Binary"
            v-model="formattedBinary"
            @input="handleInput('bin')"
            clearable
        ></v-text-field>
      </v-card-text>
    </v-card>
  </template>

<script setup lang="ts">
import { ref, watch  } from 'vue';

// Definiere die Props und Emits
defineProps(['newItemValueDec', 'newItemValueHex', 'newItemValueBin']);
const emit = defineEmits(['update:dec', 'update:hex', 'update:bin', 'inputCleared']);

function emitUpdate() {
  emit('update:dec', newItemValueDec.value);
  emit('update:hex', newItemValueHex.value);
  emit('update:bin', newItemValueBin.value);
}

const newItemValueDec = ref('');
const newItemValueHex = ref('');
const newItemValueBin = ref('');

const formattedBinary = ref('');

watch(newItemValueDec, (newValue) => {
  if (newValue === '' || newValue === null) {
    emit('inputCleared'); // Event auslösen, wenn das Eingabefeld gelöscht wird
  }
});

function formatBinaryWithSpaces() {
  // Fügt alle 8 Zeichen ein Leerzeichen ein
  return newItemValueBin.value.replace(/(.{8})/g, '$1 ').trim();
}

// Maximale und minimale Werte für einen 32-Bit-Integer
const MAX_32BIT_INT = 2147483647;
const MIN_32BIT_INT = -2147483648;

function handleInput(type: string) {
  let result;

  if (type === 'bin') {
    // Entferne Leerzeichen und stelle sicher, dass die Länge 32 Zeichen beträgt
    let binaryValue = formattedBinary.value.replace(/\s+/g, '');
    newItemValueBin.value = binaryValue;
    result = convertTo32Bit(binaryValue, 'bin');
  }
  if (type === 'dec') {
    // Überprüfen, ob der Wert eine gültige Zahl oder nur ein Minuszeichen ist
    if (newItemValueDec.value === '-' || newItemValueDec.value === '') {
      // Wenn nur ein Minuszeichen oder leer, dann nicht konvertieren
      return;
    } else if (/^-?\d+$/.test(newItemValueDec.value)) {
      // Wenn es eine gültige Zahl ist, führe die Konvertierung durch
      let decValue = parseInt(newItemValueDec.value, 10);
      decValue = Math.min(Math.max(decValue, MIN_32BIT_INT), MAX_32BIT_INT);
      newItemValueDec.value = decValue.toString();
      result = convertTo32Bit(newItemValueDec.value, 'dec');
    } else {
      // Wenn es keine gültige Zahl ist, setze den Wert zurück
      newItemValueDec.value = '';
      return;
    }
  }
    if (type === 'hex') {
    // Begrenze die Länge des Hex-Werts auf 8 Zeichen
    newItemValueHex.value = newItemValueHex.value.slice(0, 8);
    result = convertTo32Bit(newItemValueHex.value, 'hex');
  }

  if (result) {
    newItemValueDec.value = result.dec;
    newItemValueHex.value = result.hex;
    newItemValueBin.value = result.bin;
    formattedBinary.value = formatBinaryWithSpaces(); // Aktualisieren Sie die formatierte Binärausgabe
  }
  emitUpdate();
}

function convertTo32Bit(value:string, type:string) {
  let intValue;

  switch (type) {
    case 'dec':
      intValue = parseInt(value, 10);
      break;
    case 'hex':
      intValue = parseInt(value, 16);
      break;
    case 'bin':
      // Spezialbehandlung für Binärwerte, um negative Zahlen im Zweierkomplement zu berücksichtigen
      if (value.length === 32 && value[0] === '1') {
        // Negative Zahl im Zweierkomplement
        intValue = -1 * ((~parseInt(value, 2)) + 1);
      } else {
        intValue = parseInt(value, 2);
      }
      break;
    default:
      throw new Error('Unbekannter Typ');
  }

  // Stelle sicher, dass der Wert im 32-Bit Bereich liegt
  intValue = intValue << 0;

  const decValue = intValue;
  const hexValue = intValue >>> 0; // Verwende Zero-Fill Right Shift für korrekte Hexadezimaldarstellung
  const binValue = (hexValue >>> 0).toString(2).padStart(32, '0'); // Füge führende Nullen hinzu

  return {
    dec: decValue.toString(),
    hex: hexValue.toString(16).toUpperCase(),
    bin: binValue
  };
}

</script>