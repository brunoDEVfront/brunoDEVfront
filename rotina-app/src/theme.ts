import type { TipoAtividade } from './data/tipos';

export const CORES = {
  fundo: '#F4F5F7',
  cartao: '#FFFFFF',
  texto: '#111827',
  textoSuave: '#6B7280',
  borda: '#E5E7EB',
  primaria: '#2563EB',
  sucesso: '#16A34A',
  alerta: '#D97706',
  perigo: '#DC2626',
};

/** treino azul · sono roxo · corrida/caminhada laranja · refeição verde · resto neutro */
export const CORES_TIPO: Record<TipoAtividade, { forte: string; fundo: string }> = {
  treino: { forte: '#2563EB', fundo: '#DBEAFE' },
  sono: { forte: '#7C3AED', fundo: '#EDE9FE' },
  corrida: { forte: '#EA580C', fundo: '#FFEDD5' },
  refeicao: { forte: '#16A34A', fundo: '#DCFCE7' },
  estudo: { forte: '#4B5563', fundo: '#F3F4F6' },
  outro: { forte: '#4B5563', fundo: '#F3F4F6' },
};

export const RAIO = 14;
