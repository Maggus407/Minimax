import { createI18n } from 'vue-i18n'

const messages = {};
const locales = import.meta.glob('./locales/*.json')
for (const key in locales) {
  const locale = key.match(/([A-Za-z0-9-_]+)\.json$/i)[1]
  messages[locale] = (await locales[key]()).default
}

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages
})

export default i18n
