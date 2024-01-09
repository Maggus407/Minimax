<template>
    <v-row>
      <!-- Add Register Card -->
      <v-col xs="12" sm="12" md="6" lg="6">
        <v-card class="pa-3" variant="outlined">
          <h1>Add Register</h1>
          <v-text-field
            label="Register Name (required)"
            v-model="name"
            clearable
          ></v-text-field>
          <v-text-field
            label="Register Description"
            v-model="description"
            clearable
          ></v-text-field>
          <v-btn color="primary" @click="addReg" :disabled="name == '' || name == null">Add Register</v-btn>
        </v-card>

      <!-- Base Registers Card -->
        <v-card class="pa-3 mt-6" title="Base register" variant="outlined">
          <v-expansion-panels>
            <v-expansion-panel
              v-for="regName in registerStore.BASE_REGISTERS"
              :key="regName"
              :title="regName"
              :text="registerDescriptions[regName]"
            ></v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
  
      <!-- Register List Card -->
      <v-col xs="12" sm="12" md="6" lg="6">
        <v-card class="pa-3" 
        height="95vh" 
        style="overflow-y: auto;" 
        variant="outlined"
        title="User Register"
        >
        <v-expansion-panels>
            <v-expansion-panel
              v-for="regName in registerStore.registerOrder"
              :key="regName"
              :title="regName"
              :text="registerStore.getRegisterData(regName)?.Description"
            >
                <v-card-text>
                  <v-btn color="secondary" @click="openEditForm(regName)">Edit</v-btn>
                  <v-btn color="error" @click="registerStore.deleteRegister(regName)">Delete</v-btn>
                </v-card-text>
                <!-- Edit Form -->
                <v-card-text v-if="currentEditing === regName">
                  <v-text-field v-model="editedName" label="Name"></v-text-field>
                  <v-text-field v-model="editedDescription" label="Description"></v-text-field>
                  <v-btn color="success" @click="saveChanges(regName)">Save</v-btn>
                  <v-btn color="grey" @click="cancelEdit(regName)">Cancel</v-btn>
                </v-card-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>
  </template>
  

  <script setup lang="ts">
  import { useRegisterStore } from '@/store/RegisterStore';
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  
  const registerStore = useRegisterStore();
  const { t } = useI18n();
  
  const name = ref('');
  const description = ref('');
  const currentEditing = ref<string | null>(null);
  const editedName = ref('');
  const editedDescription = ref('');
  
  // Erstellen Sie eine berechnete Eigenschaft, um die Beschreibungen zu erhalten.
  const registerDescriptions = computed(() => {
    const descriptions: Record<string, string> = {};
    registerStore.BASE_REGISTERS.forEach((regName) => {
      descriptions[regName] = t(`register.${regName.toLowerCase()}`);
    });
    return descriptions;
  });
  
  const addReg = () => {
    registerStore.addRegister(name.value, description.value);
  };

const cancelEdit = (registerName: string) => {
  // Beenden des Bearbeitungsmodus
  currentEditing.value = null;

  // Zurücksetzen der bearbeiteten Werte auf die ursprünglichen Daten
  const registerData = registerStore.getRegisterData(registerName);
  if (registerData) {
    editedName.value = registerName;
    editedDescription.value = registerData.Description;
  }
};

  const openEditForm = (registerName: string) => {
    currentEditing.value = registerName;
    const registerData = registerStore.getRegisterData(registerName);
    editedName.value = registerName;
    editedDescription.value = registerData!.Description;
  };
  
  const saveChanges = (registerName: string) => {
  const newName = editedName.value;

  // Wenn sich der Name geändert hat, benennen Sie das Register um
  if (registerName !== newName) {
    registerStore.renameRegister(registerName, newName);
  }

  // Aktualisieren Sie die Beschreibung des Registers
  const existingData = registerStore.getRegisterData(newName);
  if (existingData) {
    registerStore.updateRegisterData(newName, {
      ...existingData,
      Description: editedDescription.value,
    });
  }

  currentEditing.value = null;
};


  </script>
  
