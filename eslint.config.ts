import js from '@eslint/js';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import tseslint from 'typescript-eslint';

export default [
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  plugins.stylistic,
  plugins.importX,
  plugins.react,
  plugins.reactHooks,
  plugins.reactA11y,
  plugins.typescriptEslint,
  ...configs.base.recommended,
  ...configs.react.recommended,
  ...configs.base.typescript,
  ...configs.react.typescript,
  ...tseslint.configs.recommended,
  {
    name: 'typescript/project-service',
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    name: 'custom/rules',
    rules: {
      '@stylistic/linebreak-style': ['error', 'unix'],
      // airbnb-extended dropped the exceptions airbnb's max-len had
      '@stylistic/max-len': ['error', {
        code: 100,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      'react/function-component-definition': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
