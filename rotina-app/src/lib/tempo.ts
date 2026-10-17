import type { DiaSemana } from '../data/tipos';

export const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
export const NOMES_DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
/** Ordem de exibição: segunda primeiro. */
export const DIAS_EXIBICAO: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];

export const MS_DIA = 24 * 60 * 60 * 1000;

export function paraMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatarHora(minutos: number): string {
  const m = ((minutos % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function minutosDoDia(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function diaDaSemana(d: Date): DiaSemana {
  return d.getDay() as DiaSemana;
}

/** "YYYY-MM-DD" no fuso local. */
export function chaveData(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function deChaveData(chave: string): Date {
  const [a, m, d] = chave.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function inicioDoDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function somarDias(d: Date, dias: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + dias);
}

/** Dias inteiros de calendário entre duas datas (ignora horário e horário de verão). */
export function diasEntre(de: Date, ate: Date): number {
  return Math.round((inicioDoDia(ate).getTime() - inicioDoDia(de).getTime()) / MS_DIA);
}

export function formatarDataCurta(chave: string): string {
  const d = deChaveData(chave);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatarDataLonga(chave: string): string {
  const d = deChaveData(chave);
  return `${NOMES_DIAS_CURTOS[d.getDay()]}, ${formatarDataCurta(chave)}/${d.getFullYear()}`;
}

export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatarCronometro(segundos: number): string {
  const s = Math.max(0, Math.ceil(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
