/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-standard-with-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  rules: {
    'space-before-function-paren': ['error', 'never']
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  env: {
    node: true
  }
}
