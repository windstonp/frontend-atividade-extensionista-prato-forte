import { describe, expect, it } from 'vitest';
import { resumoDosAvisos } from './regras';

describe('resumoDosAvisos (Perfil, S17)', () => {
  it.each([
    [{ mealReminders: false, weeklySummary: false, tips: false }, 'Avisos desligados'],
    [{ mealReminders: true, weeklySummary: false, tips: false }, 'Lembretes de refeição ligados'],
    [{ mealReminders: false, weeklySummary: true, tips: false }, '1 aviso ligado'],
    [{ mealReminders: true, weeklySummary: true, tips: false }, '2 avisos ligados'],
    [{ mealReminders: true, weeklySummary: true, tips: true }, '3 avisos ligados'],
  ])('%o → %s', (avisos, texto) => expect(resumoDosAvisos(avisos)).toBe(texto));
});
