import { ROTINA } from '../data/rotina';
import type { DiaSemana, ItemAgenda } from '../data/tipos';
import type { Ajustes } from '../state/tipos';
import { deChaveData, diasEntre, paraMinutos } from './tempo';

export interface ItemDoDia extends ItemAgenda {
  /** Estável por dia + posição: usado como id da notificação. */
  id: string;
  dia: DiaSemana;
  /** Minutos desde 00:00 já com o modo adaptação aplicado. */
  minutos: number;
}

/** Modo adaptação: começa às 23:30 e recua 30 min por semana até o horário final. */
export const DORMIR_INICIAL = 23 * 60 + 30;
export const PASSO_ADAPTACAO = 30;

/** Semana da adaptação (0 = primeira) na data informada, ou null se o modo estiver desligado. */
export function semanaAdaptacao(ajustes: Ajustes, data: Date): number | null {
  if (!ajustes.adaptacaoSono || !ajustes.adaptacaoInicio) return null;
  return Math.max(0, Math.floor(diasEntre(deChaveData(ajustes.adaptacaoInicio), data) / 7));
}

export function dormirFinal(dia: DiaSemana): number | null {
  const item = ROTINA[dia].find((i) => i.dormir);
  return item ? paraMinutos(item.hora) : null;
}

/** Quantos minutos o bloco de sono do dia está deslocado (0 quando a adaptação acabou ou está desligada). */
export function deslocamentoSono(dia: DiaSemana, data: Date, ajustes: Ajustes): number {
  const semana = semanaAdaptacao(ajustes, data);
  const final = dormirFinal(dia);
  if (semana === null || final === null) return 0;
  const alvo = Math.max(final, DORMIR_INICIAL - PASSO_ADAPTACAO * semana);
  return alvo - final;
}

/** true enquanto algum dia da semana ainda não chegou no horário final de dormir. */
export function adaptacaoEmAndamento(ajustes: Ajustes, data: Date): boolean {
  return ([0, 1, 2, 3, 4, 5, 6] as DiaSemana[]).some((d) => deslocamentoSono(d, data, ajustes) > 0);
}

/** Agenda de um dia da semana, considerando a data (para o modo adaptação). */
export function agendaDoDia(dia: DiaSemana, data: Date, ajustes: Ajustes): ItemDoDia[] {
  const desloc = deslocamentoSono(dia, data, ajustes);
  return ROTINA[dia]
    .map((item, idx) => ({
      ...item,
      id: `${dia}-${idx}`,
      dia,
      minutos: paraMinutos(item.hora) + (item.ligadoAoSono ? desloc : 0),
    }))
    .sort((a, b) => a.minutos - b.minutos);
}

/** Data da ocorrência do dia `dia` na mesma semana (seg–dom) de `referencia`. */
export function dataDoDiaNaSemana(dia: DiaSemana, referencia: Date): Date {
  const ordem = (d: number) => (d + 6) % 7; // segunda = 0
  const diff = ordem(dia) - ordem(referencia.getDay());
  return new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate() + diff);
}
