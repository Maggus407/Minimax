import { createI18n } from 'vue-i18n'

const messages = {}
const locales = import.meta.glob('./locales/*.json')

async function loadLocaleMessages(localeKey) {
  const locale = localeKey.match(/([A-Za-z0-9-_]+)\.json$/i)[1]
  messages[locale] = (await locales[localeKey]()).default
}

Object.keys(locales).forEach(async (key) => {
  await loadLocaleMessages(key)
})

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages
})

export default i18n