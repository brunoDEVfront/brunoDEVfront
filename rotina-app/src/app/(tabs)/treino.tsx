import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BarraTimer } from '../../components/BarraTimer';
import { SeletorDia } from '../../components/SeletorDia';
import { Cartao, Selo } from '../../components/ui';
import { DICA_FALHA, descansoSegundos, TREINO_DO_DIA, TREINOS } from '../../data/treinos';
import type { DiaSemana, Exercicio } from '../../data/tipos';
import { resumoSeries, sugestao, ultimoRegistro } from '../../lib/progressao';
import { chaveData, diaDaSemana, formatarCronometro, NOMES_DIAS } from '../../lib/tempo';
import { useApp } from '../../state/AppContext';
import { useTimer } from '../../state/TimerContext';
import { CORES, CORES_TIPO } from '../../theme';

export default function TreinoScreen() {
  const params = useLocalSearchParams<{ dia?: string }>();
  const hoje = diaDaSemana(new Date());
  const [dia, setDia] = useState<DiaSemana>(hoje);

  // Vindo da aba Hoje com um dia específico.
  useEffect(() => {
    if (params.dia !== undefined) setDia(Number(params.dia) as DiaSemana);
  }, [params.dia]);

  const treinoId = TREINO_DO_DIA[dia];
  const treino = treinoId ? TREINOS[treinoId] : undefined;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
        <SeletorDia valor={dia} hoje={hoje} onChange={setDia} />

        {treino ? (
          <ListaTreino nomeDia={NOMES_DIAS[dia]} exercicios={treino.exercicios} titulo={treino.nome} />
        ) : (
          <Cartao style={{ marginTop: 12 }}>
            <Text style={estilos.semTreinoTitulo}>{NOMES_DIAS[dia]}: sem treino de musculação 🙂</Text>
            <Text style={estilos.suave}>Escolha outro dia acima para ver o treino.</Text>
          </Cartao>
        )}
      </ScrollView>
      <BarraTimer />
    </View>
  );
}

function ListaTreino({ nomeDia, titulo, exercicios }: { nomeDia: string; titulo: string; exercicios: Exercicio[] }) {
  const { dados, alternarFeito } = useApp();
  const timer = useTimer();
  const dataHoje = chaveData(new Date());
  const feitos = dados.feitos[dataHoje] ?? [];
  const qtdFeitos = exercicios.filter((e) => feitos.includes(e.id)).length;

  return (
    <>
      <View style={estilos.cabecalho}>
        <Text style={estilos.titulo}>🏋️ {titulo}</Text>
        <Text style={estilos.suave}>
          {nomeDia} · {qtdFeitos}/{exercicios.length} feitos
        </Text>
      </View>

      <View style={estilos.dica}>
        <Text style={estilos.dicaTexto}>💡 {DICA_FALHA}</Text>
      </View>

      {exercicios.map((ex, i) => {
        const feito = feitos.includes(ex.id);
        const ultimo = ultimoRegistro(dados.registros[ex.id], dataHoje);
        const deHoje = dados.registros[ex.id]?.find((r) => r.data === dataHoje);
        const sug = sugestao(ex, ultimo);
        const descanso = descansoSegundos(i);
        return (
          <Pressable
            key={ex.id}
            onPress={() => router.push({ pathname: '/exercicio/[id]', params: { id: ex.id, descanso: String(descanso) } })}
            style={[estilos.exercicio, feito && estilos.exercicioFeito]}
          >
            <Pressable onPress={() => alternarFeito(dataHoje, ex.id)} hitSlop={12} style={[estilos.check, feito && estilos.checkMarcado]}>
              {feito && <Text style={estilos.checkTexto}>✓</Text>}
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={[estilos.nome, feito && estilos.nomeFeito]}>{ex.nome}</Text>
              <Text style={estilos.suave}>
                {ex.series} × {ex.repMin}–{ex.repMax} reps{ex.maquina ? ' · máquina' : ''}
              </Text>
              <Text style={estilos.ultima}>{ultimo ? `Última vez: ${resumoSeries(ultimo)}` : 'Sem registro ainda'}</Text>
              {deHoje && <Text style={estilos.hoje}>Hoje: {resumoSeries(deHoje)}</Text>}
              <View style={{ marginTop: 6 }}>
                <Selo
                  texto={sug.tipo === 'subir' ? '⬆️ Sobe o peso hoje' : sug.tipo === 'repeticao' ? '➕ Tenta +1 repetição' : '🆕 Primeira vez'}
                  cor={sug.tipo === 'subir' ? '#166534' : sug.tipo === 'repeticao' ? '#1E40AF' : '#374151'}
                  fundo={sug.tipo === 'subir' ? '#DCFCE7' : sug.tipo === 'repeticao' ? '#DBEAFE' : '#F3F4F6'}
                />
              </View>
            </View>

            <Pressable onPress={() => timer.iniciar(descanso, ex.nome)} style={estilos.timer} hitSlop={6}>
              <Text style={estilos.timerIcone}>⏱️</Text>
              <Text style={estilos.timerTexto}>{formatarCronometro(descanso)}</Text>
            </Pressable>
          </Pressable>
        );
      })}
      <Text style={[estilos.suave, { marginTop: 8, textAlign: 'center' }]}>
        Toque no exercício para registrar carga e repetições.
      </Text>
      <View style={{ height: 90 }} />
    </>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.fundo },
  conteudo: { padding: 16 },
  cabecalho: { marginTop: 14, marginBottom: 10 },
  titulo: { fontSize: 24, fontWeight: '800', color: CORES.texto },
  suave: { color: CORES.textoSuave, fontSize: 14 },
  semTreinoTitulo: { fontSize: 18, fontWeight: '700', color: CORES.texto, marginBottom: 4 },
  dica: { backgroundColor: CORES_TIPO.treino.fundo, borderRadius: 12, padding: 12, marginBottom: 12 },
  dicaTexto: { color: '#1E3A8A', fontSize: 14, fontWeight: '600' },
  exercicio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: CORES.cartao,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  exercicioFeito: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  check: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: CORES_TIPO.treino.forte,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkMarcado: { backgroundColor: CORES.sucesso, borderColor: CORES.sucesso },
  checkTexto: { color: '#fff', fontWeight: '900', fontSize: 18 },
  nome: { fontSize: 17, fontWeight: '700', color: CORES.texto },
  nomeFeito: { textDecorationLine: 'line-through', color: CORES.textoSuave },
  ultima: { fontSize: 14, color: CORES.texto, marginTop: 4 },
  hoje: { fontSize: 14, color: CORES.sucesso, fontWeight: '700', marginTop: 2 },
  timer: { alignItems: 'center', backgroundColor: '#EEF2FF', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  timerIcone: { fontSize: 20 },
  timerTexto: { fontSize: 13, fontWeight: '700', color: CORES.primaria },
});
