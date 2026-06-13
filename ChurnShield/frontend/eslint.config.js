import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Catch accidental console.log left in production code
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Enforce consistent arrow function style
      'arrow-body-style': ['warn', 'as-needed'],

      // Disallow unused variables (but allow underscore-prefixed ones)
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],

      // Prevent accidental == instead of ===
      'eqeqeq': ['error', 'always'],

      // Hooks already covered by plugin — keep explicit for clarity
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])