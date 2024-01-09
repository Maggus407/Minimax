<template>
  <v-navigation-drawer
 app
  >
      <v-list>
        <v-list-group >
          <v-list-item v-for="link in links" :key="link.path" :to="link.path">
              <v-list-item-title>{{ link.label }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
      <v-btn @click="toggleTheme">
        <v-icon size="x-large">mdi-theme-light-dark</v-icon>
      </v-btn>
      <v-btn>
        Language
        <v-menu activator="parent">
          <v-list>
            <v-list-item
            v-for="lang in languages" :key="lang"
            >
              <v-btn @click="changeLanguage(lang)">{{lang}}</v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
    </v-navigation-drawer>
  </template>
  
  <script setup lang="ts">
  import { useTheme } from 'vuetify'
  import {useI18n} from 'vue-i18n'

const theme = useTheme()

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const { locale } = useI18n()
function changeLanguage(lang: string){
    locale.value = lang
}

const languages = ['de', 'en']
  
  const links = [
    { path: "/", label: "Overview" },
    { path: "/debugger", label: "Debugger" },
    { path: "/controltable", label: "Control Table" },
    { path: "/alu", label: "ALU" },
    { path: "/register", label: "Register" },
    { path: "/multiplexer", label: "MUX" },
    { path: "/memory", label: "Memory" },
  ];
  </script>
  