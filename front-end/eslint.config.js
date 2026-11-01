import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
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
      /**  
       * Code conventions (in order):
       * 1. Always use semicolons.
       * 2. Never use var over const and let.
       * 3. Make sure variables that are declared will be used (unless marked otherwise).
       * 4. Require const for variables that aren't reassigned.
       * 5. Use braces for if/for/while, even if single line.
       * 6. Require ===/!== instead of == != to avoid type-coercion.
       * 7. No consecutive spaces (except indents & comments).
       * 8. Never have standalone {} blocks that do nothing.
       * 9. Never compare values to themselves.
       * 10. Never have expressions that do nothing.
       * 11. Never use .call() or .apply() if a normal function call works.
       * 12. Never use variables/functions/classes that haven't already been declared.
       * 13. Require camelCase for variales and functions. Object properties are allowed.
       * 14. Never add a space between function names and its parenthesis.
       * 15. Never use an if-statement in an else block (use else-if).
       * 16. Never use spaces inside array brackets.
       * 17. Allow console.log.
       * */ 
      'semi': ['error', 'always'],
      'no-var': ['error'],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'prefer-const': ['error', { 'destructuring': 'any', 'ignoreReadBeforeAssign': false }],
      'curly': ['error'],
      'eqeqeq': ['error'],
      'no-multi-spaces': ['error'],
      'no-lone-blocks': ['error'],
      'no-self-compare': ['error'],
      'no-unused-expressions': ['error'],
      'no-useless-call': ['error'],
      'no-use-before-define': ['error'],
      'camelcase': ['error', { properties: 'never' }],
      'func-call-spacing': ['error'],
      'no-lonely-if': ['error'],
      'array-bracket-spacing': ['error'],
      'no-console': ['off'],
    }
  },
]);
