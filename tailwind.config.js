/** @type {import('tailwindcss').Config} */

const { addDynamicIconSelectors } = require('@iconify/tailwind')

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  plugins: [
    require('daisyui'),
    addDynamicIconSelectors(),
    addDynamicIconSelectors({
      prefix: 'icon-hover',
      overrideOnly: true
    })
  ],
  theme: {
    extend: {
      fontFamily: {
        spacemono: ['"Space Mono"'],
        noto: ['"Noto"']
      }
    }
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]']
        }
      }
    ]
  }
}
