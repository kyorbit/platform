import { tanstackConfig } from '@tanstack/eslint-config';
import tseslint from 'typescript-eslint';

export default [
  ...tanstackConfig,
  {
    ignores: [
      '.output/**',
      'node_modules/**',
      'dist/**',
      'eslint.config.js',
      '.agents/**',
      '**/server.js',
      'realtime/index.js',
      '**/.vercel/**',
    ],
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/naming-convention': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
