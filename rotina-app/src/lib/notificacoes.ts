import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { VERSAO_ROTINA } from '../data/rotina';
import type { DiaSemana } from '../data/tipos';
import type { Ajustes, SomId } from '../state/tipos';
import { CORES_TIPO } from '../theme';
import { adaptacaoEmAndamento, agendaDoDia, deslocamentoSono, semanaAdaptacao } from './agenda';
import { chaveData, inicioDoDia, paraMinutos, somarDias } from './tempo';

export const SONS: { id: SomId; nome: string; arquivo: string | null }[] = [
  { id: 'alarme_classico', nome: 'Despertador clássico', arquivo: 'alarme_classico.wav' },
  { id: 'alarme_digital', nome: 'Alarme digital', arquivo: 'alarme_digital.wav' },
  { id: 'alarme_sirene', nome: 'Sirene', arquivo: 'alarme_sirene.wav' },
  { id: 'padrao', nome: 'Som padrão do celular', arquivo: null },
];

// No Android o som e a vibração pertencem ao canal e não mudam depois de criado.
// Por isso cada som tem seu próprio canal; para mudar a configuração de um canal
// é preciso trocar a versão (novo id).
const VERSAO_CANAL = 'v1';
export const canalRotina = (som: SomId) => `rotina_${som}_${VERSAO_CANAL}`;
export const CANAL_DESCANSO = `descanso_${VERSAO_CANAL}`;

const PREFIXO_ROTINA = 'rotina-';
export const ID_TIMER = 'timer-descanso';
const CHAVE_ASSINATURA = '@rotina/assinatura-notificacoes';
const VIBRACAO = [0, 700, 300, 700, 300, 700];
/** No modo adaptação os itens de sono viram notificações com data marcada; este é o alcance. */
const HORIZONTE_ADAPTACAO_DIAS = 70;

export const rodandoNoExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function configurarExibicao() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
}

export async function garantirCanais() {
  if (Platform.OS !== 'android') return;
  const comum = {
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: VIBRACAO,
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    audioAttributes: {
      // Toca pelo volume de ALARME: mais alto e não some no modo silencioso de toque.
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
  };
  for (const som of SONS) {
    await Notifications.setNotificationChannelAsync(canalRotina(som.id), {
      ...comum,
      name: `Rotina — ${som.nome}`,
      description: 'Avisos de cada atividade da rotina',
      sound: som.arquivo ?? 'default',
    });
  }
  await Notifications.setNotificationChannelAsync(CANAL_DESCANSO, {
    ...comum,
    name: 'Timer de descanso',
    description: 'Fim do descanso entre séries',
    sound: 'descanso_fim.wav',
  });
}

// ─── Permissões ──────────────────────────────────────────────────────────────

export interface StatusPermissoes {
  notificacoes: boolean;
  podePedirNotificacoes: boolean;
  alarmesExatos: boolean;
}

export async function statusPermissoes(): Promise<StatusPermissoes> {
  const n = await Notifications.getPermissionsAsync();
  let exatos = true;
  if (Platform.OS === 'android') {
    try {
      exatos = (await Notifications.getExactAlarmPermissionsAsync()).granted;
    } catch {
      exatos = true;
    }
  }
  return { notificacoes: n.granted, podePedirNotificacoes: n.canAskAgain, alarmesExatos: exatos };
}

export async function pedirPermissaoNotificacoes(): Promise<boolean> {
  // No Android 13+ o pedido só aparece depois que existe pelo menos um canal.
  await garantirCanais();
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  const r = await Notifications.requestPermissionsAsync();
  return r.granted;
}

export async function pedirAlarmesExatos(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    return (await Notifications.requestExactAlarmPermissionsAsync()).granted;
  } catch {
    await abrirConfiguracoesDoApp();
    return false;
  }
}

/** Abre o pedido "Permitir que o app ignore a otimização de bateria". */
export async function abrirOtimizacaoBateria() {
  if (Platform.OS !== 'android') return;
  try {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, {
      data: `package:${Application.applicationId}`,
    });
  } catch {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
  }
}

export async function abrirConfiguracoesDoApp() {
  await Linking.openSettings();
}

// ─── Agendamento da rotina ───────────────────────────────────────────────────

interface Agendamento {
  identifier: string;
  content: Notifications.NotificationContentInput;
  trigger: Notifications.NotificationTriggerInput;
}

function conteudo(ajustes: Ajustes, emoji: string, titulo: string, detalhe: string, tipo: keyof typeof CORES_TIPO, rota: string) {
  const som = SONS.find((s) => s.id === ajustes.som);
  return {
    title: `${emoji} ${titulo}`,
    body: ajustes.antecedencia > 0 ? `${detalhe} · em ${ajustes.antecedencia} min` : detalhe,
    data: { rota },
    sound: som?.arquivo ?? 'default',
    vibrate: VIBRACAO,
    priority: Notifications.AndroidNotificationPriority.MAX,
    color: CORES_TIPO[tipo].forte,
  } satisfies Notifications.NotificationContentInput;
}

/** Monta a lista completa de notificações para os ajustes atuais. Ids fixos = nada duplica. */
export function montarPlano(ajustes: Ajustes, agora: Date): Agendamento[] {
  const plano: Agendamento[] = [];
  const channelId = canalRotina(ajustes.som);
  const delivery = ajustes.modoDespertador ? 'alarmClock' : 'bestEffort';
  const emAdaptacao = adaptacaoEmAndamento(ajustes, agora);
  const hoje = inicioDoDia(agora);

  for (const dia of [0, 1, 2, 3, 4, 5, 6] as DiaSemana[]) {
    // Horários finais (sem adaptação); a adaptação é aplicada abaixo por data.
    const itens = agendaDoDia(dia, agora, { ...ajustes, adaptacaoSono: false });
    for (const item of itens) {
      if (!ajustes.categorias[item.categoria]) continue;
      const content = conteudo(ajustes, item.emoji, item.titulo, item.detalhe, item.tipo, item.treinoId ? '/treino' : '/');
      const base = paraMinutos(item.hora) - ajustes.antecedencia;

      if (emAdaptacao && item.ligadoAoSono) {
        // O horário muda toda semana: agenda cada ocorrência com data marcada.
        for (let k = 0; k < HORIZONTE_ADAPTACAO_DIAS; k++) {
          const d = somarDias(hoje, k);
          if (d.getDay() !== dia) continue;
          const disparo = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, base + deslocamentoSono(dia, d, ajustes));
          if (disparo.getTime() <= agora.getTime()) continue;
          plano.push({
            identifier: `${PREFIXO_ROTINA}${item.id}-${chaveData(d)}`,
            content,
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: disparo, channelId, delivery },
          });
        }
        continue;
      }

      // Repetição semanal. Se o aviso antecipado cair antes da meia-noite, vai para o dia anterior.
      let minutos = base;
      let diaDisparo: number = dia;
      if (minutos < 0) {
        minutos += 1440;
        diaDisparo = (dia + 6) % 7;
      }
      plano.push({
        identifier: `${PREFIXO_ROTINA}${item.id}`,
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: diaDisparo + 1, // expo: 1 = domingo
          hour: Math.floor(minutos / 60),
          minute: minutos % 60,
          channelId,
          delivery,
        },
      });
    }
  }
  return plano;
}

function assinatura(ajustes: Ajustes, agora: Date): string {
  const semana = adaptacaoEmAndamento(ajustes, agora) ? semanaAdaptacao(ajustes, agora) : null;
  return JSON.stringify({ ajustes, semana, VERSAO_ROTINA, VERSAO_CANAL });
}

export interface ResultadoAgendamento {
  ok: boolean;
  agendadas: number;
  motivo?: string;
}

let fila: Promise<unknown> = Promise.resolve();

/** Cancela tudo da rotina (o timer de descanso fica) e agenda de novo. Chamadas simultâneas rodam em fila. */
export function reagendarTudo(ajustes: Ajustes): Promise<ResultadoAgendamento> {
  const tarefa = fila.then(() => reagendar(ajustes));
  fila = tarefa.catch(() => undefined);
  return tarefa;
}

async function reagendar(ajustes: Ajustes): Promise<ResultadoAgendamento> {
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return { ok: false, agendadas: 0, motivo: 'Notificações não permitidas' };
  await garantirCanais();

  const existentes = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existentes) {
    if (n.identifier !== ID_TIMER) await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }

  const agora = new Date();
  const plano = montarPlano(ajustes, agora);
  let agendadas = 0;
  for (const a of plano) {
    await Notifications.scheduleNotificationAsync(a);
    agendadas++;
  }
  await AsyncStorage.setItem(CHAVE_ASSINATURA, assinatura(ajustes, agora));
  return { ok: true, agendadas };
}

/**
 * Chamado ao abrir o app e ao voltar para ele: reagenda só se algo mudou
 * (ajustes, rotina, semana do modo adaptação) ou se o sistema apagou os alarmes.
 */
export async function conferirAgendamento(ajustes: Ajustes): Promise<void> {
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  const agora = new Date();
  const salva = await AsyncStorage.getItem(CHAVE_ASSINATURA);
  const existentes = await Notifications.getAllScheduledNotificationsAsync();
  const daRotina = existentes.filter((n) => n.identifier.startsWith(PREFIXO_ROTINA)).length;
  const esperadas = montarPlano(ajustes, agora).length;
  if (salva !== assinatura(ajustes, agora) || (esperadas > 0 && daRotina === 0)) {
    await reagendarTudo(ajustes);
  }
}

export async function testarNotificacao(ajustes: Ajustes, emSegundos: number) {
  await garantirCanais();
  const channelId = canalRotina(ajustes.som);
  const content = conteudo(ajustes, '🔔', 'Teste de notificação', 'Se você ouviu o alarme, está tudo certo!', 'outro', '/');
  await Notifications.scheduleNotificationAsync({
    content: { ...content, body: 'Se você ouviu o alarme, está tudo certo!' },
    trigger:
      emSegundos > 0
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: emSegundos, channelId }
        : { channelId },
  });
}

// ─── Timer de descanso ───────────────────────────────────────────────────────

export async function agendarFimDescanso(segundos: number) {
  await Notifications.cancelScheduledNotificationAsync(ID_TIMER).catch(() => undefined);
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  await Notifications.scheduleNotificationAsync({
    identifier: ID_TIMER,
    content: {
      title: '⏱️ Descanso acabou',
      body: 'Bora para a próxima série!',
      data: { rota: '/treino' },
      sound: 'descanso_fim.wav',
      vibrate: VIBRACAO,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, segundos), channelId: CANAL_DESCANSO },
  });
}

export async function cancelarFimDescanso() {
  await Notifications.cancelScheduledNotificationAsync(ID_TIMER).catch(() => undefined);
}
