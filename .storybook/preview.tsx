import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    // axe roda em toda story; violação reprova o teste.
    a11y: { test: 'error' },
  },
  globalTypes: {
    movimento: {
      description: 'Simula prefers-reduced-motion',
      toolbar: {
        title: 'Movimento',
        items: [
          { value: 'normal', title: 'Movimento normal' },
          { value: 'reduzido', title: 'Movimento reduzido' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { movimento: 'normal' },
  decorators: [
    (Story, { globals }) => {
      document.documentElement.dataset.movimento = globals.movimento === 'reduzido' ? 'reduzido' : '';
      return (
        <div className="min-h-dvh bg-papel p-5 text-tinta">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
