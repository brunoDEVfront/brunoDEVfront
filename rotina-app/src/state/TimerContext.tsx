import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, Vibration } from 'react-native';

import { agendarFimDescanso, cancelarFimDescanso } from '../lib/notificacoes';

interface TimerValue {
  /** Segundos restantes; null quando parado. */
  restante: number | null;
  duracao: number;
  rotulo: string;
  /** true por alguns segundos logo depois de terminar. */
  acabou: boolean;
  iniciar: (segundos: number, rotulo: string) => void;
  parar: () => void;
}

const Ctx = createContext<TimerValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [fim, setFim] = useState<number | null>(null);
  const [duracao, setDuracao] = useState(0);
  const [rotulo, setRotulo] = useState('');
  const [agora, setAgora] = useState(Date.now());
  const [acabou, setAcabou] = useState(false);

  useEffect(() => {
    if (fim === null) return;
    const id = setInterval(() => setAgora(Date.now()), 250);
    return () => clearInterval(id);
  }, [fim]);

  useEffect(() => {
    if (fim === null || agora < fim) return;
    setFim(null);
    setAcabou(true);
    // O som vem da notificação agendada (toca mesmo com a tela bloqueada); aqui só reforça a vibração.
    if (AppState.currentState === 'active') Vibration.vibrate([0, 600, 250, 600, 250, 600]);
    const t = setTimeout(() => setAcabou(false), 6000);
    return () => clearTimeout(t);
  }, [agora, fim]);

  const iniciar = useCallback((segundos: number, nome: string) => {
    const agoraMs = Date.now();
    setDuracao(segundos);
    setRotulo(nome);
    setAcabou(false);
    setAgora(agoraMs);
    setFim(agoraMs + segundos * 1000);
    agendarFimDescanso(segundos).catch(() => undefined);
  }, []);

  const parar = useCallback(() => {
    setFim(null);
    setAcabou(false);
    cancelarFimDescanso();
  }, []);

  const valor = useMemo<TimerValue>(
    () => ({
      restante: fim === null ? null : Math.max(0, (fim - agora) / 1000),
      duracao,
      rotulo,
      acabou,
      iniciar,
      parar,
    }),
    [fim, agora, duracao, rotulo, acabou, iniciar, parar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useTimer() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTimer fora do TimerProvider');
  return v;
}
