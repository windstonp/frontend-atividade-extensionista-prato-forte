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
]);
