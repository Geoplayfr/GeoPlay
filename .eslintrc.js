module.exports = {
  root: true,

  env: {
    node: true
  },

  parserOptions: {
    ecmaVersion: 2020
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },

  extends: [
    '@vue/standard',
    'plugin:vue/recommended' // Use recommended instead of essential to also parse vue.js templates
    //'plugin:vue/essential'
  ]
}
