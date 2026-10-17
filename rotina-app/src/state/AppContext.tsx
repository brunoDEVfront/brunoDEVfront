import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { chaveData } from '../lib/tempo';
import { AJUSTES_PADRAO, type Ajustes, type DadosApp, type RegistroExercicio, type RegistroSemana } from './tipos';

const CHAVE = '@rotina/dados-v1';

interface AppContextValue {
  carregado: boolean;
  dados: DadosApp;
  atualizarAjustes: (parcial: Partial<Ajustes>) => Ajustes;
  salvarRegistro: (exercicioId: string, registro: RegistroExercicio) => void;
  apagarRegistro: (exercicioId: string, data: string) => void;
  alternarFeito: (data: string, exercicioId: string, feito?: boolean) => void;
  salvarSemana: (registro: RegistroSemana) => void;
  apagarSemana: (id: string) => void;
}

const Ctx = createContext<AppContextValue | null>(null);

function dadosIniciais(): DadosApp {
  return { inicio: chaveData(new Date()), ajustes: AJUSTES_PADRAO, registros: {}, feitos: {}, semanas: [] };
}

/** Garante que dados salvos por versões antigas tenham todos os campos novos. */
function normalizar(salvo: Partial<DadosApp>): DadosApp {
  const base = dadosIniciais();
  return {
    ...base,
    ...salvo,
    ajustes: {
      ...AJUSTES_PADRAO,
      ...salvo.ajustes,
      categorias: { ...AJUSTES_PADRAO.categorias, ...salvo.ajustes?.categorias },
    },
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<DadosApp>(dadosIniciais);
  const [carregado, setCarregado] = useState(false);
  // Cópia síncrona do estado mais recente, para ações em sequência não se atropelarem.
  const atual = useRef(dados);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((txt) => {
        const d = txt ? normalizar(JSON.parse(txt)) : dadosIniciais();
        atual.current = d;
        setDados(d);
        if (!txt) AsyncStorage.setItem(CHAVE, JSON.stringify(d));
      })
      .catch(() => undefined)
      .finally(() => setCarregado(true));
  }, []);

  const mudar = useCallback((fn: (d: DadosApp) => DadosApp) => {
    const novo = fn(atual.current);
    atual.current = novo;
    setDados(novo);
    AsyncStorage.setItem(CHAVE, JSON.stringify(novo)).catch(() => undefined);
    return novo;
  }, []);

  const valor = useMemo<AppContextValue>(
    () => ({
      carregado,
      dados,
      atualizarAjustes: (parcial) => mudar((d) => ({ ...d, ajustes: { ...d.ajustes, ...parcial } })).ajustes,
      salvarRegistro: (id, registro) =>
        mudar((d) => {
          const lista = (d.registros[id] ?? []).filter((r) => r.data !== registro.data);
          lista.push(registro);
          lista.sort((a, b) => a.data.localeCompare(b.data));
          return { ...d, registros: { ...d.registros, [id]: lista } };
        }),
      apagarRegistro: (id, data) =>
        mudar((d) => ({ ...d, registros: { ...d.registros, [id]: (d.registros[id] ?? []).filter((r) => r.data !== data) } })),
      alternarFeito: (data, id, feito) =>
        mudar((d) => {
          const lista = d.feitos[data] ?? [];
          const marcar = feito ?? !lista.includes(id);
          const nova = marcar ? [...new Set([...lista, id])] : lista.filter((x) => x !== id);
          return { ...d, feitos: { ...d.feitos, [data]: nova } };
        }),
      salvarSemana: (registro) =>
        mudar((d) => {
          const lista = d.semanas.filter((s) => s.id !== registro.id);
          lista.push(registro);
          lista.sort((a, b) => a.data.localeCompare(b.data));
          return { ...d, semanas: lista };
        }),
      apagarSemana: (id) => mudar((d) => ({ ...d, semanas: d.semanas.filter((s) => s.id !== id) })),
    }),
    [carregado, dados, mudar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp fora do AppProvider');
  return v;
}
