import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#8AB4F8',
          secondary: '#F28B82',
          accent: '#81C995',
          background: '#1E1E1E',
          surface: '#2D2D2D',
          'surface-variant': '#3C3C3C',
          'on-surface': '#E8EAED',
          'on-background': '#E8EAED',
          error: '#F28B82',
          info: '#8AB4F8',
          success: '#81C995',
          warning: '#FDD663',
        },
      },
      light: {
        dark: false,
        colors: {
          primary: '#1A73E8',
          secondary: '#EA4335',
          accent: '#34A853',
          background: '#eeefe9',
          surface: '#FFFFFF',
          'surface-variant': '#F1F3F4',
          'on-surface': '#202124',
          'on-background': '#202124',
          error: '#EA4335',
          info: '#1A73E8',
          success: '#34A853',
          warning: '#FBBC04',
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
    },
    VBtn: {
      variant: 'text',
    },
  },
});
