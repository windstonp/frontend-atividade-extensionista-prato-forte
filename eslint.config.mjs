import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import storybook from 'eslint-plugin-storybook';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs['flat/recommended'],
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'storybook-static/**',
    'playwright-report/**',
    'test-results/**',
  ]),
  // D12 — dado mockado só em stories, testes e MSW.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/mocks/**', '**/*.stories.tsx', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/mocks/*', '**/mocks/**', '**/mock-data'],
              message: 'Dado mockado só em stories, testes e MSW. Use src/lib/api.',
            },
          ],
        },
      ],
    },
  },
  // LEGADO — telas do protótipo ainda ligadas ao mock. Cada plano de feature REMOVE daqui os
  // arquivos que migrar; o Plano 08 apaga os dois blocos. Nada novo entra nesta lista.
  {
    files: ['src/lib/mock-api.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: [
      'src/components/ui/Sheet.tsx',
      'src/components/ui/Toast.tsx',
      'src/lib/motion.ts',
      'src/lib/plan-store.tsx',
    ],
    rules: { 'react-hooks/set-state-in-effect': 'warn', 'react-hooks/purity': 'warn' },
  },
]);
