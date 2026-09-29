import { peso } from '@/lib/format';
import { DIAS_CURTOS } from '@/lib/labels';
import type { Catalogo, EtapaEditavel, Respostas } from './tipos';

export interface LinhaDoResumo {
  etapa: EtapaEditavel;
  rotulo: string;
  valor: string;
  alerta?: boolean;
}

const metros = (cm: number) => `${(cm / 100).toFixed(2).replace('.', ',')} m`;
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** Linhas do resumo (S08), com rótulos do catálogo. A linha de restrições fica em `alerta` se há alergia. */
export function linhasDoResumo(r: Respostas, c: Catalogo): LinhaDoResumo[] {
  const objetivo = c.goals.find((g) => g.value === r.goal)?.label ?? '—';
  const meta = r.goalWeightKg !== null && r.goalWeightSource === 'user' ? `, meta ${peso(r.goalWeightKg)}` : '';
  const pessoa = [
    r.preferredName || 'Você',
    r.age ? `${r.age} anos` : null,
    r.heightCm ? metros(r.heightCm) : null,
    r.weightKg ? peso(r.weightKg) : null,
  ].filter(Boolean);
  const nivel = c.activityLevels.find((a) => a.value === r.activityLevel)?.label ?? '—';
  const restricoes = c.restrictions.filter((x) => r.restrictions.includes(x.slug));
  const naoPode = [...restricoes.map((x) => x.label), ...r.otherRestrictions];
  const dias = r.trainingDays.map((d) => DIAS_CURTOS[d]).join(', ');
  const almoco = c.lunchPlaces.find((l) => l.value === r.lunchPlace)?.label;

  return [
    { etapa: 'objetivo', rotulo: 'Objetivo', valor: `${objetivo}${meta}` },
    { etapa: 'dados', rotulo: 'Você', valor: pessoa.join(', ') },
    { etapa: 'atividade', rotulo: 'Treino', valor: `${nivel}${r.trainingTime ? `, às ${r.trainingTime}` : ''}` },
    {
      etapa: 'preferencias',
      rotulo: 'Sua cozinha',
      valor: r.pantryItems.length === 0 ? 'Nada marcado ainda' : plural(r.pantryItems.length, 'alimento marcado', 'alimentos marcados'),
    },
    {
      etapa: 'restricoes',
      rotulo: 'Restrições',
      valor: naoPode.length > 0 ? naoPode.join(', ') : 'Nenhuma',
      ...(restricoes.some((x) => x.isAllergy) ? { alerta: true } : {}),
    },
    {
      etapa: 'rotina',
      rotulo: 'Rotina',
      valor: `Acorda ${r.wakeTime ?? '—'}, dorme ${r.sleepTime ?? '—'}. Treina ${dias || 'em nenhum dia marcado'}.${almoco ? ` Almoço: ${almoco.toLowerCase()}.` : ''}`,
    },
  ];
}
