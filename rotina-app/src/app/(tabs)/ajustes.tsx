import * as Notifications from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { usePermissoes } from '../../components/AvisoPermissoes';
import { Botao, Cartao, Chip, TituloSecao, estilos as ui } from '../../components/ui';
import type { CategoriaNotificacao, DiaSemana } from '../../data/tipos';
import { adaptacaoEmAndamento, DORMIR_INICIAL, dormirFinal, deslocamentoSono } from '../../lib/agenda';
import {
  abrirConfiguracoesDoApp,
  abrirOtimizacaoBateria,
  pedirAlarmesExatos,
  pedirPermissaoNotificacoes,
  reagendarTudo,
  rodandoNoExpoGo,
  SONS,
  testarNotificacao,
} from '../../lib/notificacoes';
import { chaveData, formatarHora, NOMES_DIAS_CURTOS } from '../../lib/tempo';
import { useApp } from '../../state/AppContext';
import type { Ajustes, Antecedencia } from '../../state/tipos';
import { CORES } from '../../theme';

const CATEGORIAS: { id: CategoriaNotificacao; nome: string; emoji: string }[] = [
  { id: 'rotina', nome: 'Acordar e rotina', emoji: '⏰' },
  { id: 'refeicao', nome: 'Refeições', emoji: '🍽️' },
  { id: 'treino', nome: 'Treino', emoji: '🏋️' },
  { id: 'corrida', nome: 'Corrida / caminhada', emoji: '🏃' },
  { id: 'estudo', nome: 'Estudo', emoji: '📚' },
  { id: 'sono', nome: 'Sono (telas, diário, dormir)', emoji: '😴' },
];

export default function AjustesScreen() {
  const { dados, atualizarAjustes } = useApp();
  const ajustes = dados.ajustes;
  const { status, atualizar: atualizarPermissoes } = usePermissoes();
  const [agendadas, setAgendadas] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const atraso = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contar = useCallback(() => {
    Notifications.getAllScheduledNotificationsAsync()
      .then((l) => setAgendadas(l.filter((n) => n.identifier.startsWith('rotina-')).length))
      .catch(() => undefined);
  }, []);
  useFocusEffect(contar);
  useEffect(() => () => void (atraso.current && clearTimeout(atraso.current)), []);

  /** Salva e reagenda (com um pequeno atraso para juntar vários toques seguidos). */
  const mudar = (parcial: Partial<Ajustes>) => {
    const novos = atualizarAjustes(parcial);
    if (atraso.current) clearTimeout(atraso.current);
    atraso.current = setTimeout(() => {
      reagendarTudo(novos).then(contar).catch(() => undefined);
    }, 700);
  };

  const reagendarAgora = async () => {
    setOcupado(true);
    try {
      const r = await reagendarTudo(ajustes);
      Alert.alert(r.ok ? 'Pronto!' : 'Não foi possível', r.ok ? `${r.agendadas} notificações agendadas.` : r.motivo);
    } finally {
      setOcupado(false);
      contar();
    }
  };

  const testar = async (segundos: number) => {
    if (!status?.notificacoes && !(await pedirPermissaoNotificacoes())) {
      Alert.alert('Notificações bloqueadas', 'Libere as notificações nas configurações do app.');
      return;
    }
    await testarNotificacao(ajustes, segundos);
    if (segundos > 0) Alert.alert('Teste agendado', `Bloqueie a tela agora. O alarme toca em ${segundos} segundos.`);
  };

  const hoje = new Date();
  const emAdaptacao = adaptacaoEmAndamento(ajustes, hoje);

  return (
    <ScrollView style={ui.tela} contentContainerStyle={ui.conteudo}>
      {rodandoNoExpoGo && (
        <View style={estilos.expoGo}>
          <Text style={estilos.expoGoTexto}>
            Você está no Expo Go: os sons de alarme personalizados e o modo despertador só funcionam no APK instalado.
          </Text>
        </View>
      )}

      <TituloSecao>Permissões e bateria</TituloSecao>
      <Cartao>
        <LinhaStatus
          ok={status?.notificacoes}
          titulo="Notificações"
          acao="Permitir"
          onPress={async () => {
            if (!(await pedirPermissaoNotificacoes())) await abrirConfiguracoesDoApp();
            atualizarPermissoes();
            reagendarTudo(ajustes).then(contar);
          }}
        />
        <LinhaStatus
          ok={status?.alarmesExatos}
          titulo="Alarmes e lembretes (exatos)"
          acao="Liberar"
          onPress={async () => {
            await pedirAlarmesExatos();
            atualizarPermissoes();
            reagendarTudo(ajustes).then(contar);
          }}
        />
        <Botao titulo="🔋 Desativar otimização de bateria" variante="secundario" onPress={abrirOtimizacaoBateria} style={{ marginTop: 10 }} />
        <Botao titulo="Abrir configurações do app" variante="secundario" onPress={abrirConfiguracoesDoApp} style={{ marginTop: 8 }} />
        <Text style={[ui.textoSuave, { marginTop: 10 }]}>
          Samsung: Configurações › Aplicativos › Rotina › Bateria › “Sem restrições”. Veja o passo a passo completo no README.
        </Text>
      </Cartao>

      <TituloSecao>Notificações por tipo</TituloSecao>
      <Cartao style={{ paddingVertical: 4 }}>
        {CATEGORIAS.map((c, i) => (
          <View key={c.id} style={[estilos.linha, i > 0 && estilos.borda]}>
            <Text style={estilos.linhaTexto}>
              {c.emoji} {c.nome}
            </Text>
            <Switch
              value={ajustes.categorias[c.id]}
              onValueChange={(v) => mudar({ categorias: { ...ajustes.categorias, [c.id]: v } })}
              trackColor={{ true: '#93C5FD' }}
              thumbColor={ajustes.categorias[c.id] ? CORES.primaria : '#f4f3f4'}
            />
          </View>
        ))}
      </Cartao>

      <TituloSecao>Avisar antes</TituloSecao>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {([0, 5, 10] as Antecedencia[]).map((m) => (
          <Chip key={m} rotulo={m === 0 ? 'Na hora' : `${m} min antes`} ativo={ajustes.antecedencia === m} onPress={() => mudar({ antecedencia: m })} />
        ))}
      </View>

      <TituloSecao>Som da notificação</TituloSecao>
      <Cartao style={{ paddingVertical: 4 }}>
        {SONS.map((s, i) => (
          <Pressable key={s.id} onPress={() => mudar({ som: s.id })} style={[estilos.linha, i > 0 && estilos.borda]}>
            <Text style={estilos.linhaTexto}>{s.nome}</Text>
            <View style={[estilos.radio, ajustes.som === s.id && estilos.radioAtivo]} />
          </Pressable>
        ))}
      </Cartao>
      <Text style={[ui.textoSuave, { marginTop: 6 }]}>
        Os sons tocam pelo volume de ALARME do celular. Use “Testar notificação” para ouvir.
      </Text>

      <TituloSecao>Precisão</TituloSecao>
      <Cartao>
        <View style={estilos.linha}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={estilos.linhaTexto}>Modo despertador</Text>
            <Text style={ui.textoSuave}>
              Agenda como despertador do Android: toca no minuto exato mesmo com economia de bateria. Mostra um ícone de alarme na barra de status.
            </Text>
          </View>
          <Switch value={ajustes.modoDespertador} onValueChange={(v) => mudar({ modoDespertador: v })} trackColor={{ true: '#93C5FD' }} thumbColor={ajustes.modoDespertador ? CORES.primaria : '#f4f3f4'} />
        </View>
      </Cartao>

      <TituloSecao>Modo adaptação do sono</TituloSecao>
      <Cartao>
        <View style={estilos.linha}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={estilos.linhaTexto}>Adaptar horário de dormir</Text>
            <Text style={ui.textoSuave}>
              Começa em {formatarHora(DORMIR_INICIAL)} e recua 30 min por semana até o horário final. Telas desligadas, Diário e Dormir andam juntos.
            </Text>
          </View>
          <Switch
            value={ajustes.adaptacaoSono}
            onValueChange={(v) => mudar({ adaptacaoSono: v, adaptacaoInicio: v ? chaveData(new Date()) : null })}
            trackColor={{ true: '#C4B5FD' }}
            thumbColor={ajustes.adaptacaoSono ? '#7C3AED' : '#f4f3f4'}
          />
        </View>
        {ajustes.adaptacaoSono && (
          <View style={estilos.tabelaSono}>
            <Text style={[ui.textoSuave, { marginBottom: 6 }]}>
              {emAdaptacao ? 'Dormir nesta semana (final):' : 'Adaptação concluída — horários finais:'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {([1, 2, 3, 4, 5, 6, 0] as DiaSemana[]).map((d) => {
                const final = dormirFinal(d);
                if (final === null) return null;
                return (
                  <View key={d} style={estilos.diaSono}>
                    <Text style={estilos.diaSonoNome}>{NOMES_DIAS_CURTOS[d]}</Text>
                    <Text style={estilos.diaSonoHora}>{formatarHora(final + deslocamentoSono(d, hoje, ajustes))}</Text>
                    <Text style={estilos.diaSonoFinal}>({formatarHora(final)})</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </Cartao>

      <TituloSecao>Ferramentas</TituloSecao>
      <Botao titulo={ocupado ? 'Reagendando…' : '🔁 Reagendar todas as notificações'} onPress={reagendarAgora} desabilitado={ocupado} />
      <Botao titulo="🔔 Testar notificação agora" variante="secundario" onPress={() => testar(0)} style={{ marginTop: 8 }} />
      <Botao titulo="🔒 Testar com a tela bloqueada (10 s)" variante="secundario" onPress={() => testar(10)} style={{ marginTop: 8 }} />
      <Text style={[ui.textoSuave, { marginTop: 10, textAlign: 'center' }]}>
        {agendadas === null ? '' : `${agendadas} notificações da rotina agendadas`}
      </Text>
    </ScrollView>
  );
}

function LinhaStatus({ ok, titulo, acao, onPress }: { ok?: boolean; titulo: string; acao: string; onPress: () => void }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.linhaTexto}>
        {ok === undefined ? '…' : ok ? '✅' : '❌'} {titulo}
      </Text>
      {ok === false && (
        <Pressable onPress={onPress} style={estilos.acao}>
          <Text style={estilos.acaoTexto}>{acao}</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  expoGo: { backgroundColor: '#E0F2FE', borderRadius: 12, padding: 12 },
  expoGoTexto: { color: '#075985', fontSize: 14 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  borda: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: CORES.borda },
  linhaTexto: { fontSize: 16, color: CORES.texto, fontWeight: '600', flexShrink: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: CORES.borda },
  radioAtivo: { borderColor: CORES.primaria, borderWidth: 7 },
  acao: { backgroundColor: CORES.primaria, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  acaoTexto: { color: '#fff', fontWeight: '700' },
  tabelaSono: { marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: CORES.borda, paddingTop: 10 },
  diaSono: { backgroundColor: '#EDE9FE', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, alignItems: 'center', minWidth: 64 },
  diaSonoNome: { fontSize: 12, fontWeight: '700', color: '#5B21B6' },
  diaSonoHora: { fontSize: 16, fontWeight: '800', color: '#4C1D95' },
  diaSonoFinal: { fontSize: 11, color: '#6D28D9' },
});
