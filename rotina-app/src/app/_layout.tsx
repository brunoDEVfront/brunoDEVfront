import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { conferirAgendamento, configurarExibicao, garantirCanais, pedirPermissaoNotificacoes } from '../lib/notificacoes';
import { AppProvider, useApp } from '../state/AppContext';
import { TimerProvider } from '../state/TimerContext';
import { CORES } from '../theme';

// Mostra banner + som mesmo com o app aberto.
configurarExibicao();

const CHAVE_PRIMEIRA_ABERTURA = '@rotina/permissao-pedida';

/** Ao tocar numa notificação, abre a aba indicada em `data.rota` (treino → aba Treino). */
function useAbrirPelaNotificacao() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    function abrir(resposta: Notifications.NotificationResponse | null) {
      const rota = resposta?.notification.request.content.data?.rota;
      if (typeof rota === 'string') {
        router.navigate(rota as '/');
        Notifications.clearLastNotificationResponse();
      }
    }
    abrir(Notifications.getLastNotificationResponse()); // app estava fechado
    const sub = Notifications.addNotificationResponseReceivedListener(abrir); // app aberto ou em segundo plano
    return () => sub.remove();
  }, []);
}

/** Pede permissão na primeira abertura e mantém o agendamento em dia. */
function Inicializador() {
  const { carregado, dados } = useApp();
  // Mudanças em Ajustes já reagendam pela própria tela; aqui só lemos o valor mais recente.
  const ajustes = useRef(dados.ajustes);
  ajustes.current = dados.ajustes;

  useEffect(() => {
    if (!carregado) return;
    (async () => {
      await garantirCanais();
      if (!(await AsyncStorage.getItem(CHAVE_PRIMEIRA_ABERTURA))) {
        await AsyncStorage.setItem(CHAVE_PRIMEIRA_ABERTURA, '1');
        await pedirPermissaoNotificacoes();
      }
      await conferirAgendamento(ajustes.current);
    })().catch(() => undefined);

    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') conferirAgendamento(ajustes.current).catch(() => undefined);
    });
    return () => sub.remove();
  }, [carregado]);

  return null;
}

export default function RootLayout() {
  useAbrirPelaNotificacao();
  return (
    <SafeAreaProvider>
      <AppProvider>
        <TimerProvider>
          <Inicializador />
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: CORES.cartao },
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: CORES.fundo },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="exercicio/[id]" options={{ title: 'Exercício' }} />
          </Stack>
        </TimerProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
