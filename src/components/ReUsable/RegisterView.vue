<template>
    <v-card variant="outlined" class="mt-2">
        <v-card-title>
            Register
        </v-card-title>
        <v-card-text>
            <v-table 
                fixed-header
                density="compact"
                height="30vh"
            >
            <thead>
                <tr>
                    <th class="pl-0 text-center pr-0">
                        Name
                    </th>
                    <th class="pl-0 text-center pr-0">
                        Value
                    </th>
                    <th class="pl-0 text-center pr-0">
                        Hexadecimal
                    </th>
                    <th>

                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(data,index) in registerStore.registerOrder"
                    :key="data.id"
                >
                    <td class=" pl-0 text-center pr-0">{{ data.title }}</td>
                    <td class=" pl-0 text-center pr-0">{{ data.Value }}</td>
                    <td class=" pl-0 text-center pr-0">0x{{ toHex(data.Value) }}</td>
                    <td width="10vw">
                        <v-icon @click="changeValue">mdi-pencil</v-icon>
                    </td>
                </tr>
            </tbody>
            </v-table>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { useRegisterStore } from '@/store/RegisterStore';
import Dec_Hex_Bin_Inputs from './Dec_Hex_Bin_Inputs.vue';

const registerStore = useRegisterStore();

function toHex(value): string {
  if (value < 0) {
    value = 0xFFFFFFFF + value + 1; // Umwandlung in das Zweierkomplement
  }
  
  let hex = value.toString(16).toUpperCase(); // Umwandlung in eine Hexadezimalzeichenfolge
  while (hex.length < 6) { // Stellen sicher, dass die Länge der Zeichenfolge 8 beträgt
      hex = '0' + hex;
  }
  
  return hex; // Rückgabe mit dem "0x" Präfix
}

function changeValue() {
  console.log('changeValue');
}
</script>