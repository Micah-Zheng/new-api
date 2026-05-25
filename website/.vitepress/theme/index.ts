import DefaultTheme from 'vitepress/theme'
import HomeVideo from './HomeVideo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeVideo', HomeVideo)
  },
}
