import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

import {
  abrirConfiguracoesDoApp,
  pedirAlarmesExatos,
  pedirPermissaoNotificacoes,
  reagendarTudo,
  statusPermissoes,
  type StatusPermissoes,
} from '../lib/notificacoes';
import { useApp } from '../state/AppContext';
import { Botao } from './ui';

/** Status das permissões, atualizado ao focar a tela e ao voltar das configurações do celular. */
export function usePermissoes() {
  const [status, setStatus] = useState<StatusPermissoes | null>(null);
  const atualizar = useCallback(() => {
    statusPermissoes().then(setStatus).catch(() => undefined);
  }, []);
  useFocusEffect(atualizar);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && atualizar());
    return () => sub.remove();
  }, [atualizar]);
  return { status, atualizar };
}

/** Cartão de alerta que só aparece quando falta alguma permissão importante. */
export function AvisoPermissoes() {
  const { dados } = useApp();
  const { status, atualizar } = usePermissoes();
  if (!status || (status.notificacoes && status.alarmesExatos)) return null;

  const liberarNotificacoes = async () => {
    const ok = status.podePedirNotificacoes ? await pedirPermissaoNotificacoes() : false;
    if (!ok) await abrirConfiguracoesDoApp();
    else await reagendarTudo(dados.ajustes);
    atualizar();
  };
  const liberarExatos = async () => {
    await pedirAlarmesExatos();
    await reagendarTudo(dados.ajustes);
    atualizar();
  };

  return (
    <View style={estilos.caixa}>
      <Text style={estilos.titulo}>⚠️ Os avisos podem não tocar</Text>
      {!status.notificacoes && (
        <>
          <Text style={estilos.texto}>As notificações estão bloqueadas para este app.</Text>
          <Botao titulo="Permitir notificações" onPress={liberarNotificacoes} style={estilos.botao} />
        </>
      )}
      {status.notificacoes && !status.alarmesExatos && (
        <>
          <Text style={estilos.texto}>
            Falta liberar “Alarmes e lembretes”. Sem isso o Android pode atrasar os avisos em vários minutos.
          </Text>
          <Botao titulo="Liberar alarmes exatos" onPress={liberarExatos} style={estilos.botao} />
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { backgroundColor: '#FEF3C7', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FCD34D' },
  titulo: { fontSize: 16, fontWeight: '800', color: '#92400E', marginBottom: 4 },
  texto: { fontSize: 14, color: '#78350F', marginBottom: 10 },
  botao: { marginTop: 2 },
});
