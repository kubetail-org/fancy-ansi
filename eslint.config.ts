import js from '@eslint/js';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['**/*.test.ts', '**/*.test.tsx'] },
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
      '@stylistic/indent': 'off',
      '@stylistic/linebreak-style': ['error', 'unix'],
      // airbnb-extended dropped the exceptions airbnb's max-len had
      '@stylistic/max-len': ['error', {
        code: 100,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      'class-methods-use-this': 'off', // TODO: remove this when not necessary
      'no-bitwise': 'off',
      'no-console': 'off',
      'no-control-regex': 'off',
      'no-prototype-builtins': 'off', // in order to support .hasOwnProperty() loop optimization
      'no-restricted-syntax': 'off', // in order to support `for (const key in <array>)` loop optimization
      'no-underscore-dangle': 'off',
      'import-x/extensions': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-rename-default': 'off',
      'import-x/prefer-default-export': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'prefer-destructuring': 'off',
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/no-danger': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      yoda: 'off',
    },
  },
];
