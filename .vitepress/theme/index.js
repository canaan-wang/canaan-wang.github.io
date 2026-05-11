import DefaultTheme from 'vitepress/theme'
import './custom.css'
import QACards from './QACards.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QACards', QACards)
  }
}
