import js from '@eslint/js';

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  DOMParser: 'readonly',
  Intl: 'readonly',
};

const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
};

const sharedRules = {
  eqeqeq: ['error', 'always'],
  'no-var': 'error',
  'prefer-const': 'error',
  'no-unused-vars': ['error', { caughtErrors: 'none' }],
};

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['script.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: browserGlobals,
    },
    rules: sharedRules,
  },
  {
    files: ['build.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: nodeGlobals,
    },
    rules: sharedRules,
  },
];
