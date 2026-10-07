import { act, render, screen } from '@testing-library/react';
import { Activity } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useContagem } from './motion';

// Quadros de animação controlados à mão: cada `quadro(ms)` roda os callbacks pendentes com esse carimbo.
let pendentes: Map<number, FrameRequestCallback>;
let proximoId: number;
let agora: number;
const quadro = (carimbo: number) =>
  act(() => {
    const lote = [...pendentes.values()];
    pendentes.clear();
    lote.forEach((cb) => cb(carimbo));
  });

beforeEach(() => {
  pendentes = new Map();
  proximoId = 1;
  agora = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => agora);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    pendentes.set(proximoId, cb);
    return proximoId++;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => pendentes.delete(id));
  vi.spyOn(window, 'matchMedia').mockImplementation((consulta: string) => ({ matches: false, media: consulta }) as MediaQueryList);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Contador({ valor }: { valor: number }) {
  return <span data-testid="n">{useContagem(valor, 900)}</span>;
}

describe('useContagem', () => {
  it('não mostra número negativo quando o quadro chega com carimbo anterior ao início', () => {
    render(<Contador valor={542} />);
    // O carimbo do rAF é o início do quadro, que pode ser antes do performance.now() do efeito.
    quadro(990);
    expect(Number(screen.getByTestId('n').textContent)).toBeGreaterThanOrEqual(0);
    quadro(1000 + 900);
    expect(screen.getByTestId('n')).toHaveTextContent('542');
  });

  it('termina no valor quando os efeitos são desmontados e remontados no meio da contagem (navegação do Next)', () => {
    const { rerender } = render(
      <Activity mode="visible">
        <Contador valor={542} />
      </Activity>,
    );
    quadro(1100); // meio da contagem
    expect(screen.getByTestId('n')).not.toHaveTextContent('542');

    rerender(
      <Activity mode="hidden">
        <Contador valor={542} />
      </Activity>,
    );
    agora = 1200;
    rerender(
      <Activity mode="visible">
        <Contador valor={542} />
      </Activity>,
    );
    quadro(1200 + 900);
    expect(screen.getByTestId('n')).toHaveTextContent('542');
  });
});
