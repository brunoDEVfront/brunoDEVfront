/** Dia da semana no padrão do JavaScript: 0 = domingo ... 6 = sábado. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Define a cor do item na linha do tempo. */
export type TipoAtividade = 'treino' | 'sono' | 'corrida' | 'refeicao' | 'estudo' | 'outro';

/** Define qual chave liga/desliga a notificação do item em Ajustes. */
export type CategoriaNotificacao = 'rotina' | 'refeicao' | 'treino' | 'corrida' | 'estudo' | 'sono';

export interface ItemAgenda {
  /** "HH:MM" */
  hora: string;
  titulo: string;
  detalhe: string;
  tipo: TipoAtividade;
  categoria: CategoriaNotificacao;
  emoji: string;
  /**
   * Itens ligados ao horário de dormir ("Telas desligadas", "Diário", "Dormir").
   * No modo adaptação do sono eles andam juntos, mantendo a mesma distância do "Dormir".
   */
  ligadoAoSono?: boolean;
  /** Marca o item "Dormir" do dia (âncora do modo adaptação). */
  dormir?: boolean;
  /** Para itens de treino: id do treino em `treinos.ts` (título e detalhe saem de lá). */
  treinoId?: string;
}

export interface Exercicio {
  /** Id único: o histórico é guardado por id, então o mesmo exercício em treinos diferentes compartilha histórico. */
  id: string;
  nome: string;
  series: number;
  repMin: number;
  repMax: number;
  maquina?: boolean;
}

export interface Treino {
  id: string;
  nome: string;
  exercicios: Exercicio[];
}
