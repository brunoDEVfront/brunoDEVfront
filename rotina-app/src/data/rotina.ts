import { TREINOS } from './treinos';
import type { DiaSemana, ItemAgenda } from './tipos';

// ─────────────────────────────────────────────────────────────────────────────
// ROTINA DA SEMANA
//
// ⚠️ A mensagem com a rotina chegou cortada em "05:45 Café da manhã — Ovos,".
// Só os dois primeiros itens de seg/qua/sex são os seus. Todo o resto marcado
// como PROVISÓRIO é um esqueleto para o app funcionar e deve ser substituído
// pela sua rotina real (é só editar este arquivo).
//
// Regras que o app já respeita:
// - Horário de dormir final: 21:30 seg/qua/sex, 21:45 ter/qui, 22:00 dom.
// - Itens com `ligadoAoSono` (Telas desligadas, Diário, Dormir) se movem juntos
//   no "Modo adaptação do sono", mantendo a distância até o "Dormir".
// - Itens de treino pegam título e exercícios de `treinos.ts` pelo `treinoId`.
// ─────────────────────────────────────────────────────────────────────────────

function treino(hora: string, treinoId: string): ItemAgenda {
  const t = TREINOS[treinoId];
  return {
    hora,
    titulo: `Treino: ${t.nome}`,
    detalhe: t.exercicios.map((e) => e.nome).join(', '),
    tipo: 'treino',
    categoria: 'treino',
    emoji: '🏋️',
    treinoId,
  };
}

/** Telas desligadas, Diário e Dormir, todos relativos ao horário final de dormir. */
function blocoSono(dormir: string): ItemAgenda[] {
  const [h, m] = dormir.split(':').map(Number);
  const base = h * 60 + m;
  const hhmm = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  return [
    // PROVISÓRIO: distâncias (60 e 30 min antes de dormir)
    { hora: hhmm(base - 60), titulo: 'Telas desligadas', detalhe: 'Celular longe, luz baixa', tipo: 'sono', categoria: 'sono', emoji: '📵', ligadoAoSono: true },
    { hora: hhmm(base - 30), titulo: 'Diário', detalhe: '3 linhas sobre o dia + plano de amanhã', tipo: 'sono', categoria: 'sono', emoji: '📓', ligadoAoSono: true },
    { hora: dormir, titulo: 'Dormir', detalhe: 'Luz apagada', tipo: 'sono', categoria: 'sono', emoji: '😴', ligadoAoSono: true, dormir: true },
  ];
}

// Segunda, quarta e sexta (treino à tarde)
function diaTreinoTarde(treinoId: string): ItemAgenda[] {
  return [
    { hora: '05:30', titulo: 'Acordar', detalhe: 'Água + abrir a janela', tipo: 'outro', categoria: 'rotina', emoji: '⏰' },
    // O detalhe abaixo foi cortado na mensagem depois de "Ovos,"
    { hora: '05:45', titulo: 'Café da manhã', detalhe: 'Ovos, …', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍳' },
    // PROVISÓRIO daqui para baixo
    { hora: '07:00', titulo: 'Estudo', detalhe: 'Bloco de foco', tipo: 'estudo', categoria: 'estudo', emoji: '📚' },
    { hora: '12:00', titulo: 'Almoço', detalhe: 'Prato completo', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍽️' },
    { hora: '16:00', titulo: 'Lanche pré-treino', detalhe: 'Fruta + proteína', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍌' },
    treino('17:00', treinoId),
    { hora: '19:00', titulo: 'Jantar', detalhe: 'Refeição leve', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍽️' },
    ...blocoSono('21:30'),
  ];
}

// PROVISÓRIO: terça e quinta
function diaCorrida(): ItemAgenda[] {
  return [
    { hora: '05:30', titulo: 'Acordar', detalhe: 'Água + abrir a janela', tipo: 'outro', categoria: 'rotina', emoji: '⏰' },
    { hora: '05:45', titulo: 'Corrida / caminhada', detalhe: '30 min leve', tipo: 'corrida', categoria: 'corrida', emoji: '🏃' },
    { hora: '06:30', titulo: 'Café da manhã', detalhe: 'Ovos, …', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍳' },
    { hora: '07:00', titulo: 'Estudo', detalhe: 'Bloco de foco', tipo: 'estudo', categoria: 'estudo', emoji: '📚' },
    { hora: '12:00', titulo: 'Almoço', detalhe: 'Prato completo', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍽️' },
    { hora: '16:00', titulo: 'Lanche', detalhe: 'Fruta + proteína', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍌' },
    { hora: '19:00', titulo: 'Jantar', detalhe: 'Refeição leve', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍽️' },
    ...blocoSono('21:45'),
  ];
}

// PROVISÓRIO: sábado (não veio na mensagem) e domingo
function diaLivre(dormir: string): ItemAgenda[] {
  return [
    { hora: '07:00', titulo: 'Acordar', detalhe: 'Água + abrir a janela', tipo: 'outro', categoria: 'rotina', emoji: '⏰' },
    { hora: '07:30', titulo: 'Café da manhã', detalhe: 'Ovos, …', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍳' },
    { hora: '08:30', titulo: 'Caminhada', detalhe: '40 min ao ar livre', tipo: 'corrida', categoria: 'corrida', emoji: '🚶' },
    { hora: '12:30', titulo: 'Almoço', detalhe: 'Prato completo', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍽️' },
    { hora: '19:00', titulo: 'Jantar', detalhe: 'Refeição leve', tipo: 'refeicao', categoria: 'refeicao', emoji: '🍽️' },
    ...blocoSono(dormir),
  ];
}

export const ROTINA: Record<DiaSemana, ItemAgenda[]> = {
  0: diaLivre('22:00'),
  1: diaTreinoTarde('A'),
  2: diaCorrida(),
  3: diaTreinoTarde('B'),
  4: diaCorrida(),
  5: diaTreinoTarde('C'),
  6: diaLivre('22:00'),
};

/**
 * Mude este número sempre que editar a rotina: o app percebe e reagenda
 * todas as notificações sozinho na próxima vez que abrir.
 */
export const VERSAO_ROTINA = 1;
