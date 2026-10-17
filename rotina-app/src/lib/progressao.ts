import type { Exercicio } from '../data/tipos';
import type { RegistroExercicio } from '../state/tipos';

/** Último registro de antes de `hoje` (o de hoje não conta como "última vez"). */
export function ultimoRegistro(historico: RegistroExercicio[] | undefined, hoje: string): RegistroExercicio | undefined {
  if (!historico) return undefined;
  for (let i = historico.length - 1; i >= 0; i--) {
    if (historico[i].data < hoje) return historico[i];
  }
  return undefined;
}

function fmtKg(kg: number) {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1).replace('.', ',');
}

/** "40 kg · 10/9/8" (ou "40/40/35 kg · 10/9/8" quando a carga mudou entre séries). */
export function resumoSeries(r: RegistroExercicio): string {
  const validas = r.series.filter((s) => s.kg !== null || s.reps !== null);
  if (validas.length === 0) return '—';
  const kgs = validas.map((s) => s.kg);
  const iguais = kgs.every((k) => k === kgs[0]);
  const parteKg = kgs[0] === null && iguais ? '' : iguais ? `${fmtKg(kgs[0] as number)} kg` : `${kgs.map((k) => (k === null ? '–' : fmtKg(k))).join('/')} kg`;
  const parteReps = validas.map((s) => (s.reps === null ? '–' : s.reps)).join('/');
  return parteKg ? `${parteKg} · ${parteReps}` : parteReps;
}

export type Sugestao = { tipo: 'subir' | 'repeticao' | 'primeira'; texto: string };

/**
 * Progressão dupla: se na última vez bateu o topo da faixa em TODAS as séries,
 * sobe o peso; senão, tenta +1 repetição.
 */
export function sugestao(ex: Exercicio, ultimo: RegistroExercicio | undefined): Sugestao {
  if (!ultimo) return { tipo: 'primeira', texto: `Primeira vez: escolha uma carga para ${ex.repMin}–${ex.repMax} reps` };
  const series = ultimo.series.slice(0, ex.series);
  const bateuTopo = series.length >= ex.series && series.every((s) => (s.reps ?? 0) >= ex.repMax);
  return bateuTopo ? { tipo: 'subir', texto: 'Sobe o peso hoje' } : { tipo: 'repeticao', texto: 'Tenta +1 repetição' };
}
