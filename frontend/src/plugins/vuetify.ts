import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.min.css'

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'sk',
    fallback: 'en',
    messages: {
      sk: {
        datePicker: {
          itemsSelected: 'Vybrané položky: {0}',
        },
      },
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#116466',
          secondary: '#D9B08C',
          tertiary: '#B7846C',
          accent: '#D1E8E2',
          error: '#5c2018',
          warning: '#FFCB9A',
          info: '#D1E8E2',
          success: '#3C888C',
          background: '#fff',
          surface: '#f7f7f7',
        },
      },
    },
  },
})

export default vuetify
