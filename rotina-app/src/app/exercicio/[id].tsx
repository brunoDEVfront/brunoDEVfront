import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BarraTimer } from '../../components/BarraTimer';
import { Botao, Cartao, Selo, TituloSecao, estilos as ui } from '../../components/ui';
import { DICA_FALHA, TREINOS } from '../../data/treinos';
import type { Exercicio } from '../../data/tipos';
import { resumoSeries, sugestao, ultimoRegistro } from '../../lib/progressao';
import { chaveData, formatarCronometro, formatarDataLonga } from '../../lib/tempo';
import { useApp } from '../../state/AppContext';
import { useTimer } from '../../state/TimerContext';
import type { Serie } from '../../state/tipos';
import { CORES } from '../../theme';

function acharExercicio(id: string): Exercicio | undefined {
  for (const t of Object.values(TREINOS)) {
    const e = t.exercicios.find((x) => x.id === id);
    if (e) return e;
  }
  return undefined;
}

const paraNumero = (txt: string): number | null => {
  const n = Number(txt.replace(',', '.'));
  return txt.trim() === '' || Number.isNaN(n) ? null : n;
};
const paraTexto = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n).replace('.', ','));

export default function ExercicioScreen() {
  const { id, descanso } = useLocalSearchParams<{ id: string; descanso?: string }>();
  const { carregado } = useApp();
  const ex = acharExercicio(id);
  // Espera os dados carregarem para preencher a carga da última vez.
  if (!carregado) return null;
  if (!ex) return <Text style={{ padding: 20 }}>Exercício não encontrado.</Text>;
  return <Registro ex={ex} descanso={Number(descanso) || 90} />;
}

function Registro({ ex, descanso }: { ex: Exercicio; descanso: number }) {
  const { dados, salvarRegistro, apagarRegistro, alternarFeito } = useApp();
  const timer = useTimer();
  const hoje = chaveData(new Date());
  const historico = dados.registros[ex.id] ?? [];
  const ultimo = ultimoRegistro(historico, hoje);
  const deHoje = historico.find((r) => r.data === hoje);
  const sug = sugestao(ex, ultimo);

  // Preenche com o registro de hoje; se não houver, repete a carga da última vez.
  const [campos, setCampos] = useState(() =>
    Array.from({ length: ex.series }, (_, i) => {
      const s = deHoje?.series[i];
      return { kg: paraTexto(s?.kg ?? ultimo?.series[i]?.kg), reps: paraTexto(s?.reps) };
    }),
  );
  const [salvo, setSalvo] = useState(false);

  const historicoDesc = useMemo(() => [...historico].reverse(), [historico]);

  const mudar = (i: number, campo: 'kg' | 'reps', valor: string) => {
    setSalvo(false);
    setCampos((c) => c.map((s, j) => (j === i ? { ...s, [campo]: valor } : s)));
  };

  const salvar = () => {
    const series: Serie[] = campos.map((c) => ({ kg: paraNumero(c.kg), reps: paraNumero(c.reps) }));
    if (series.every((s) => s.kg === null && s.reps === null)) {
      Alert.alert('Nada para salvar', 'Preencha a carga e as repetições de pelo menos uma série.');
      return;
    }
    salvarRegistro(ex.id, { data: hoje, series });
    alternarFeito(hoje, ex.id, true);
    setSalvo(true);
  };

  const confirmarApagar = (data: string) =>
    Alert.alert('Apagar registro?', formatarDataLonga(data), [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarRegistro(ex.id, data) },
    ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Stack.Screen options={{ title: ex.nome }} />
      <ScrollView style={ui.tela} contentContainerStyle={ui.conteudo} keyboardShouldPersistTaps="handled">
        <Cartao>
          <Text style={estilos.faixa}>
            {ex.series} séries · {ex.repMin}–{ex.repMax} reps{ex.maquina ? ' · máquina' : ''}
          </Text>
          <Text style={estilos.ultima}>{ultimo ? `Última vez: ${resumoSeries(ultimo)}` : 'Sem registro anterior'}</Text>
          {ultimo && <Text style={ui.textoSuave}>{formatarDataLonga(ultimo.data)}</Text>}
          <View style={{ marginTop: 10 }}>
            <Selo
              texto={sug.tipo === 'subir' ? '⬆️ Sobe o peso hoje' : sug.tipo === 'repeticao' ? '➕ Tenta +1 repetição' : `🆕 ${sug.texto}`}
              cor={sug.tipo === 'subir' ? '#166534' : sug.tipo === 'repeticao' ? '#1E40AF' : '#374151'}
              fundo={sug.tipo === 'subir' ? '#DCFCE7' : sug.tipo === 'repeticao' ? '#DBEAFE' : '#F3F4F6'}
            />
          </View>
          <Text style={estilos.dica}>💡 {DICA_FALHA}</Text>
        </Cartao>

        <TituloSecao>Registro de hoje</TituloSecao>
        <Cartao>
          <View style={estilos.linhaCabecalho}>
            <Text style={[estilos.colSerie, ui.textoSuave]}>Série</Text>
            <Text style={[estilos.col, ui.textoSuave]}>Carga (kg)</Text>
            <Text style={[estilos.col, ui.textoSuave]}>Reps</Text>
          </View>
          {campos.map((c, i) => (
            <View key={i} style={estilos.linhaSerie}>
              <Text style={estilos.colSerie}>{i + 1}</Text>
              <TextInput
                style={[ui.input, estilos.col]}
                value={c.kg}
                onChangeText={(v) => mudar(i, 'kg', v)}
                keyboardType="decimal-pad"
                placeholder="kg"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={[ui.input, estilos.col]}
                value={c.reps}
                onChangeText={(v) => mudar(i, 'reps', v)}
                keyboardType="number-pad"
                placeholder={ultimo?.series[i]?.reps != null ? `últ. ${ultimo.series[i].reps}` : `${ex.repMin}–${ex.repMax}`}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ))}
          <Botao titulo={salvo ? 'Salvo ✓' : deHoje ? 'Atualizar registro' : 'Salvar registro'} onPress={salvar} style={{ marginTop: 6 }} />
          <Botao
            titulo={`⏱️ Descanso ${formatarCronometro(descanso)}`}
            variante="secundario"
            onPress={() => timer.iniciar(descanso, ex.nome)}
            style={{ marginTop: 10 }}
          />
        </Cartao>

        <TituloSecao>Histórico</TituloSecao>
        {historicoDesc.length === 0 ? (
          <Text style={ui.textoSuave}>Nenhum registro ainda.</Text>
        ) : (
          <Cartao style={{ paddingVertical: 4 }}>
            {historicoDesc.map((r, i) => (
              <Pressable key={r.data} onLongPress={() => confirmarApagar(r.data)} style={[estilos.histLinha, i > 0 && estilos.histBorda]}>
                <Text style={estilos.histData}>{formatarDataLonga(r.data)}</Text>
                <Text style={estilos.histValor}>{resumoSeries(r)}</Text>
              </Pressable>
            ))}
          </Cartao>
        )}
        {historicoDesc.length > 0 && <Text style={[ui.textoSuave, { marginTop: 6 }]}>Segure um registro para apagar.</Text>}
        <View style={{ height: 100 }} />
      </ScrollView>
      <BarraTimer />
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  faixa: { fontSize: 15, color: CORES.textoSuave, fontWeight: '600' },
  ultima: { fontSize: 20, fontWeight: '800', color: CORES.texto, marginTop: 6 },
  dica: { marginTop: 12, fontSize: 13, color: '#1E3A8A' },
  linhaCabecalho: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  linhaSerie: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },
  colSerie: { width: 44, fontSize: 17, fontWeight: '700', color: CORES.texto, textAlign: 'center' },
  col: { flex: 1, flexBasis: 0, minWidth: 0 },
  histLinha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  histBorda: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: CORES.borda },
  histData: { fontSize: 15, color: CORES.textoSuave },
  histValor: { fontSize: 15, fontWeight: '700', color: CORES.texto },
});
