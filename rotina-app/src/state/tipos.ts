import type { CategoriaNotificacao } from '../data/tipos';

export type SomId = 'alarme_classico' | 'alarme_digital' | 'alarme_sirene' | 'padrao';
export type Antecedencia = 0 | 5 | 10;

export interface Ajustes {
  categorias: Record<CategoriaNotificacao, boolean>;
  antecedencia: Antecedencia;
  som: SomId;
  adaptacaoSono: boolean;
  /** Data ("YYYY-MM-DD") em que o modo adaptação foi ligado: semana 1 = 23:30. */
  adaptacaoInicio: string | null;
  /** Usa o agendamento "despertador" do Android (não é atrasado pela economia de bateria). */
  modoDespertador: boolean;
}

export interface Serie {
  kg: number | null;
  reps: number | null;
}

export interface RegistroExercicio {
  /** "YYYY-MM-DD" */
  data: string;
  series: Serie[];
}

export interface RegistroSemana {
  id: string;
  /** "YYYY-MM-DD" */
  data: string;
  peso: number | null;
  sono: number | null;
  humor: number | null;
  energia: number | null;
  obs: string;
}

export interface DadosApp {
  /** Primeiro dia de uso ("YYYY-MM-DD"): base do contador "Semana X de 8". */
  inicio: string;
  ajustes: Ajustes;
  /** Histórico por id de exercício, do mais antigo para o mais novo. */
  registros: Record<string, RegistroExercicio[]>;
  /** Exercícios marcados como feitos, por data. */
  feitos: Record<string, string[]>;
  semanas: RegistroSemana[];
}

export const AJUSTES_PADRAO: Ajustes = {
  categorias: { rotina: true, refeicao: true, treino: true, corrida: true, estudo: true, sono: true },
  antecedencia: 0,
  som: 'alarme_classico',
  adaptacaoSono: false,
  adaptacaoInicio: null,
  modoDespertador: true,
};
