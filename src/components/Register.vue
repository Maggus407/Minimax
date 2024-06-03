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
            >
            <v-expansion-panel-text>
              <p v-html="registerDescriptions[regName]"></p>
            </v-expansion-panel-text>
          </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
  
      <!-- Register List Card -->
      <v-col xs="12" sm="12" md="6" lg="6">
        <v-card class="pa-3" 
        height="98vh"
        style="overflow-y: auto;" 
        variant="outlined"
        :title="$t('register.extendedRegister')"
        >
        <v-expansion-panels>
            <v-expansion-panel
              v-for="regName in registerStore.registerOrder && registerStore.registerOrder.filter((reg: any) => !registerStore.BASE_REGISTERS.includes(reg.title))"
              :key="regName.title"
              :title="regName.title"
              :text="regName.Description"
            >
                <v-card-text class="d-flex flex-row justify-end pt-2 pb-2">
                  <v-tooltip text="Edit Register">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" @click="openEditForm(regName.title)" class="mr-8" size="24">mdi-pencil</v-icon>
                    </template>
                  </v-tooltip>
                  <v-icon color="error" @click="registerStore.deleteRegister(regName)" class="mr-2">mdi-delete</v-icon>
                </v-card-text>
                <v-card-text v-if="currentEditing === regName.title">
                  <v-text-field v-model="editedName" label="Name"></v-text-field>
                  <v-text-field v-model="editedDescription" :label="$t('generell.description')"></v-text-field>
                  <v-btn color="success" :disabled="correctSaving == false" @click="saveChanges(regName.title)">{{ $t('button.save') }}</v-btn>
                  <v-btn @click="cancelEdit(regName.title)" style="background-color: rgba(211, 211, 211, 0.7); opacity: 0.8" class="ml-8">Cancel</v-btn>
                </v-card-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
  <script setup lang="ts">
  import { useRegisterStore } from '@/store/RegisterStore';
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  
  const registerStore = useRegisterStore();
  const { t } = useI18n();
  
  const name = ref('');
  const description = ref('');
  const currentEditing = ref<string | null>(null);
  const editedName = ref('');
  const editedDescription = ref('');

  const correctSaving = ref(false)

  // Beobachte Änderungen an editedName und aktualisiere correctSaving
  watch(editedName, (newVal) => {
    correctSaving.value = newVal.trim().length > 0;
  });
  
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
  const registerData = registerStore.getRegisterDescription(registerName);
  if (registerData) {
    editedName.value = registerName;
    editedDescription.value = registerData.Description;
  }
};

  const openEditForm = (registerName: string) => {
    currentEditing.value = registerName;
    const registerData = registerStore.getRegisterDescription(registerName);
    console.log(registerData);
    editedName.value = registerName;
    editedDescription.value = registerData;
  };
  
  const saveChanges = (registerName: string) => {
  const newName = editedName.value;
  const newDescription = editedDescription.value === null || editedDescription.value === undefined ? '' : editedDescription.value;

  // Wenn sich der Name geändert hat, benennen Sie das Register um
  if(description.value !== newDescription){
    registerStore.updateRegisterDescription(registerName, newDescription);
  }
  if (registerName !== newName) {
    console.log(newName);
    registerStore.renameRegister(registerName, newName);
  }
  currentEditing.value = null;
};


  </script>
  
