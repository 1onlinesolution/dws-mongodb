module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true,
  },
  plugins: [
    'security'
  ],
  extends: [
    'plugin:security/recommended',
  ],
  // parser: 'babel-eslint',
  parserOptions: {
    // sourceType: 'module',
    ecmaVersion: 12,
    ecmaFeatures: {
      arrowFunctions: true,
    },
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'arrow-body-style': 'off',
    'arrow-parens': 'off',
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};
