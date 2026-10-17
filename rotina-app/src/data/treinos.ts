import type { DiaSemana, Treino } from './tipos';

// ⚠️ PROVISÓRIO: a mensagem com a rotina foi cortada antes da lista de treinos.
// Troque os exercícios abaixo pelos seus (nome, séries e faixa de repetições).
// O histórico é salvo pelo `id`, então evite mudar o id depois que começar a registrar.

export const TREINOS: Record<string, Treino> = {
  A: {
    id: 'A',
    nome: 'Peito e costas',
    exercicios: [
      { id: 'supino-maquina', nome: 'Supino máquina', series: 3, repMin: 8, repMax: 12, maquina: true },
      { id: 'puxada-alta', nome: 'Puxada alta', series: 3, repMin: 8, repMax: 12, maquina: true },
      { id: 'remada-baixa', nome: 'Remada baixa', series: 3, repMin: 8, repMax: 12, maquina: true },
      { id: 'crucifixo-maquina', nome: 'Crucifixo máquina', series: 3, repMin: 10, repMax: 15, maquina: true },
      { id: 'face-pull', nome: 'Face pull', series: 3, repMin: 12, repMax: 15 },
    ],
  },
  B: {
    id: 'B',
    nome: 'Pernas',
    exercicios: [
      { id: 'leg-press', nome: 'Leg press', series: 3, repMin: 8, repMax: 12, maquina: true },
      { id: 'cadeira-extensora', nome: 'Cadeira extensora', series: 3, repMin: 10, repMax: 15, maquina: true },
      { id: 'mesa-flexora', nome: 'Mesa flexora', series: 3, repMin: 10, repMax: 15, maquina: true },
      { id: 'panturrilha', nome: 'Panturrilha em pé', series: 3, repMin: 12, repMax: 15, maquina: true },
      { id: 'abdominal', nome: 'Abdominal na polia', series: 3, repMin: 10, repMax: 15 },
    ],
  },
  C: {
    id: 'C',
    nome: 'Ombros e braços',
    exercicios: [
      { id: 'desenvolvimento-maquina', nome: 'Desenvolvimento máquina', series: 3, repMin: 8, repMax: 12, maquina: true },
      { id: 'elevacao-lateral', nome: 'Elevação lateral', series: 3, repMin: 12, repMax: 15 },
      { id: 'rosca-direta', nome: 'Rosca direta', series: 3, repMin: 8, repMax: 12 },
      { id: 'triceps-corda', nome: 'Tríceps corda', series: 3, repMin: 10, repMax: 15 },
      { id: 'rosca-martelo', nome: 'Rosca martelo', series: 3, repMin: 10, repMax: 12 },
    ],
  },
};

/** Qual treino cai em cada dia. Dias sem treino ficam de fora. */
export const TREINO_DO_DIA: Partial<Record<DiaSemana, string>> = {
  1: 'A',
  3: 'B',
  5: 'C',
};

export const DICA_FALHA = 'Pare 1–2 repetições antes da falha. Falha só na última série de exercícios de máquina.';

/** Descanso: 2 min 30 nos 3 primeiros exercícios do dia, 1 min 30 no resto. */
export function descansoSegundos(indiceNoTreino: number): number {
  return indiceNoTreino < 3 ? 150 : 90;
}
