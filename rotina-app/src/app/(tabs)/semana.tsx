import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GraficoLinha } from '../../components/GraficoLinha';
import { Botao, Cartao, TituloSecao, estilos as ui } from '../../components/ui';
import { dataDoDiaNaSemana } from '../../lib/agenda';
import { chaveData, deChaveData, diasEntre, formatarDataCurta } from '../../lib/tempo';
import { useApp } from '../../state/AppContext';
import type { RegistroSemana } from '../../state/tipos';
import { CORES, CORES_TIPO } from '../../theme';

const TOTAL_SEMANAS = 8;

const paraNumero = (txt: string): number | null => {
  const n = Number(txt.replace(',', '.'));
  return txt.trim() === '' || Number.isNaN(n) ? null : n;
};
const paraTexto = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n).replace('.', ','));
const fmt = (n: number | null, un: string) => (n === null ? '—' : `${String(n).replace('.', ',')} ${un}`);

export default function SemanaScreen() {
  const { dados, salvarSemana, apagarSemana } = useApp();
  const hoje = new Date();
  const semanaAtual = Math.floor(diasEntre(deChaveData(dados.inicio), hoje) / 7) + 1;
  // Um registro por semana (segunda a domingo), identificado pela segunda-feira.
  const idSemana = chaveData(dataDoDiaNaSemana(1, hoje));
  const existente = dados.semanas.find((s) => s.id === idSemana);

  const [peso, setPeso] = useState('');
  const [sono, setSono] = useState('');
  const [humor, setHumor] = useState<number | null>(null);
  const [energia, setEnergia] = useState<number | null>(null);
  const [obs, setObs] = useState('');
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setPeso(paraTexto(existente?.peso));
    setSono(paraTexto(existente?.sono));
    setHumor(existente?.humor ?? null);
    setEnergia(existente?.energia ?? null);
    setObs(existente?.obs ?? '');
  }, [existente]);

  const salvar = () => {
    const registro: RegistroSemana = {
      id: idSemana,
      data: chaveData(hoje),
      peso: paraNumero(peso),
      sono: paraNumero(sono),
      humor,
      energia,
      obs: obs.trim(),
    };
    salvarSemana(registro);
    setSalvo(true);
  };

  const anteriores = useMemo(() => [...dados.semanas].reverse(), [dados.semanas]);
  const pontosPeso = dados.semanas.filter((s) => s.peso !== null).map((s) => ({ rotulo: formatarDataCurta(s.id), valor: s.peso as number }));
  const pontosSono = dados.semanas.filter((s) => s.sono !== null).map((s) => ({ rotulo: formatarDataCurta(s.id), valor: s.sono as number }));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView style={ui.tela} contentContainerStyle={ui.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.contador}>
          <Text style={estilos.contadorTexto}>
            {semanaAtual <= TOTAL_SEMANAS ? `Semana ${semanaAtual} de ${TOTAL_SEMANAS}` : `Semana ${semanaAtual} · ciclo de 8 concluído 🎉`}
          </Text>
          <View style={estilos.trilho}>
            {Array.from({ length: TOTAL_SEMANAS }, (_, i) => (
              <View key={i} style={[estilos.bolinha, i < Math.min(semanaAtual, TOTAL_SEMANAS) && estilos.bolinhaAtiva]} />
            ))}
          </View>
          <Text style={estilos.contadorSub}>Desde {formatarDataCurta(dados.inicio)}</Text>
        </View>

        <TituloSecao>Registro desta semana ({formatarDataCurta(idSemana)})</TituloSecao>
        <Cartao>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.rotulo}>Peso (kg)</Text>
              <TextInput style={ui.input} value={peso} onChangeText={(v) => (setPeso(v), setSalvo(false))} keyboardType="decimal-pad" placeholder="ex.: 78,5" placeholderTextColor="#9CA3AF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.rotulo}>Média de sono (h)</Text>
              <TextInput style={ui.input} value={sono} onChangeText={(v) => (setSono(v), setSalvo(false))} keyboardType="decimal-pad" placeholder="ex.: 7,5" placeholderTextColor="#9CA3AF" />
            </View>
          </View>
          <Escala rotulo="Humor" valor={humor} onChange={(v) => (setHumor(v), setSalvo(false))} />
          <Escala rotulo="Energia" valor={energia} onChange={(v) => (setEnergia(v), setSalvo(false))} />
          <Text style={estilos.rotulo}>Observação</Text>
          <TextInput
            style={[ui.input, { minHeight: 70, textAlignVertical: 'top' }]}
            value={obs}
            onChangeText={(v) => (setObs(v), setSalvo(false))}
            multiline
            placeholder="Como foi a semana?"
            placeholderTextColor="#9CA3AF"
          />
          <Botao titulo={salvo ? 'Salvo ✓' : existente ? 'Atualizar semana' : 'Salvar semana'} onPress={salvar} style={{ marginTop: 12 }} />
        </Cartao>

        <TituloSecao>Evolução</TituloSecao>
        <GraficoLinha titulo="Peso" pontos={pontosPeso} cor={CORES_TIPO.treino.forte} unidade="kg" />
        <GraficoLinha titulo="Sono" pontos={pontosSono} cor={CORES_TIPO.sono.forte} unidade="h" />

        <TituloSecao>Semanas anteriores</TituloSecao>
        {anteriores.length === 0 && <Text style={ui.textoSuave}>Nenhuma semana registrada ainda.</Text>}
        {anteriores.map((s) => (
          <Pressable
            key={s.id}
            onLongPress={() =>
              Alert.alert('Apagar semana?', `Semana de ${formatarDataCurta(s.id)}`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Apagar', style: 'destructive', onPress: () => apagarSemana(s.id) },
              ])
            }
          >
            <Cartao style={{ marginBottom: 8 }}>
              <Text style={estilos.semanaTitulo}>Semana de {formatarDataCurta(s.id)}</Text>
              <Text style={estilos.semanaValores}>
                ⚖️ {fmt(s.peso, 'kg')}   😴 {fmt(s.sono, 'h')}   🙂 {s.humor ?? '—'}/5   ⚡ {s.energia ?? '—'}/5
              </Text>
              {!!s.obs && <Text style={ui.textoSuave}>{s.obs}</Text>}
            </Cartao>
          </Pressable>
        ))}
        {anteriores.length > 0 && <Text style={ui.textoSuave}>Segure uma semana para apagar.</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Escala({ rotulo, valor, onChange }: { rotulo: string; valor: number | null; onChange: (v: number) => void }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={estilos.rotulo}>{rotulo} (1–5)</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} style={[estilos.nota, valor === n && estilos.notaAtiva]}>
            <Text style={[estilos.notaTexto, valor === n && { color: '#fff' }]}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contador: { backgroundColor: CORES.primaria, borderRadius: 18, padding: 18 },
  contadorTexto: { color: '#fff', fontSize: 24, fontWeight: '800' },
  contadorSub: { color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  trilho: { flexDirection: 'row', gap: 6, marginTop: 12 },
  bolinha: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  bolinhaAtiva: { backgroundColor: '#fff' },
  rotulo: { fontSize: 14, fontWeight: '600', color: CORES.textoSuave, marginBottom: 6, marginTop: 4 },
  nota: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: CORES.borda, alignItems: 'center', backgroundColor: '#fff' },
  notaAtiva: { backgroundColor: CORES.primaria, borderColor: CORES.primaria },
  notaTexto: { fontSize: 17, fontWeight: '700', color: CORES.texto },
  semanaTitulo: { fontSize: 16, fontWeight: '700', color: CORES.texto },
  semanaValores: { fontSize: 15, color: CORES.texto, marginVertical: 4 },
});
