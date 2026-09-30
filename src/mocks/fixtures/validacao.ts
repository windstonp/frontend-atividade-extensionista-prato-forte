export const statusUsabilidadeApi = (parcial: { responded?: boolean; invite?: boolean } = {}) => ({
  round: '2026-1',
  responded: parcial.responded ?? false,
  invite: parcial.invite ?? false,
});
