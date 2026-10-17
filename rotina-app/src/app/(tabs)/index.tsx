import { useFocusEffect, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvisoPermissoes } from '../../components/AvisoPermissoes';
import { SeletorDia } from '../../components/SeletorDia';
import { Botao } from '../../components/ui';
import type { DiaSemana } from '../../data/tipos';
import { agendaDoDia, dataDoDiaNaSemana, deslocamentoSono, type ItemDoDia } from '../../lib/agenda';
import { diaDaSemana, formatarDuracao, formatarHora, minutosDoDia, NOMES_DIAS, somarDias } from '../../lib/tempo';
import { useApp } from '../../state/AppContext';
import { CORES, CORES_TIPO } from '../../theme';

function useAgora(intervaloMs: number) {
  const [agora, setAgora] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setAgora(new Date());
      const id = setInterval(() => setAgora(new Date()), intervaloMs);
      return () => clearInterval(id);
    }, [intervaloMs]),
  );
  return agora;
}

export default function HojeScreen() {
  const { dados } = useApp();
  const ajustes = dados.ajustes;
  const agora = useAgora(20_000);
  const hoje = diaDaSemana(agora);
  const [diaVisto, setDiaVisto] = useState<DiaSemana | null>(null);
  const [mostrarDias, setMostrarDias] = useState(false);
  const dia = diaVisto ?? hoje;
  const ehHoje = dia === hoje;

  const itens = useMemo(() => agendaDoDia(dia, dataDoDiaNaSemana(dia, agora), ajustes), [dia, agora, ajustes]);

  const { atual, proximo, faltam } = useMemo(() => {
    const min = minutosDoDia(agora);
    const hojeItens = agendaDoDia(hoje, agora, ajustes);
    let atualItem: ItemDoDia | undefined;
    for (const i of hojeItens) if (i.minutos <= min) atualItem = i;
    if (!atualItem) {
      // Madrugada antes do primeiro item: ainda vale o último de ontem (ex.: Dormir).
      const ontem = somarDias(agora, -1);
      atualItem = agendaDoDia(diaDaSemana(ontem), ontem, ajustes).at(-1);
    }
    let proximoItem = hojeItens.find((i) => i.minutos > min);
    let minutosAte = proximoItem ? proximoItem.minutos - min : 0;
    if (!proximoItem) {
      const amanha = somarDias(agora, 1);
      proximoItem = agendaDoDia(diaDaSemana(amanha), amanha, ajustes)[0];
      if (proximoItem) minutosAte = 1440 - min + proximoItem.minutos;
    }
    return { atual: atualItem, proximo: proximoItem, faltam: minutosAte };
  }, [agora, hoje, ajustes]);

  const minAgora = minutosDoDia(agora);
  const desloc = deslocamentoSono(dia, dataDoDiaNaSemana(dia, agora), ajustes);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <AvisoPermissoes />

      <View style={estilos.cabecalho}>
        <View>
          <Text style={estilos.diaSemana}>{NOMES_DIAS[dia]}</Text>
          <Text style={estilos.subtitulo}>
            {ehHoje ? `Hoje · ${formatarHora(minAgora)}` : 'Visualizando outro dia'}
          </Text>
        </View>
        <Pressable onPress={() => setMostrarDias((v) => !v)} style={estilos.botaoDias}>
          <Text style={estilos.botaoDiasTexto}>{mostrarDias ? 'Fechar' : 'Ver outro dia'}</Text>
        </Pressable>
      </View>

      {mostrarDias && (
        <View style={{ marginBottom: 12 }}>
          <SeletorDia valor={dia} hoje={hoje} onChange={(d) => setDiaVisto(d === hoje ? null : d)} />
          {!ehHoje && <Botao titulo="Voltar para hoje" variante="secundario" onPress={() => setDiaVisto(null)} style={{ marginTop: 8 }} />}
        </View>
      )}

      {ehHoje && (
        <View style={estilos.destaques}>
          <Destaque rotulo="AGORA" item={atual} />
          <Destaque rotulo="PRÓXIMO" item={proximo} extra={proximo ? `em ${faltam} min${faltam >= 60 ? ` (${formatarDuracao(faltam)})` : ''}` : undefined} />
        </View>
      )}

      {desloc > 0 && (
        <Text style={estilos.aviso}>🌙 Modo adaptação do sono: bloco da noite {desloc} min mais tarde que o horário final.</Text>
      )}

      <View style={{ marginTop: 8 }}>
        {itens.map((item) => {
          const passado = ehHoje && item.id !== atual?.id && item.minutos <= minAgora;
          const ehAtual = ehHoje && item.id === atual?.id;
          const cor = CORES_TIPO[item.tipo];
          return (
            <Pressable
              key={item.id}
              onPress={item.treinoId ? () => router.navigate({ pathname: '/treino', params: { dia: String(dia) } }) : undefined}
              style={[estilos.item, { borderLeftColor: cor.forte, backgroundColor: ehAtual ? cor.fundo : CORES.cartao }, passado && estilos.passado, ehAtual && { borderColor: cor.forte }]}
            >
              <Text style={[estilos.hora, { color: cor.forte }]}>{formatarHora(item.minutos)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={estilos.itemTitulo}>
                  {item.emoji} {item.titulo}
                </Text>
                {!!item.detalhe && <Text style={estilos.itemDetalhe}>{item.detalhe}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Destaque({ rotulo, item, extra }: { rotulo: string; item?: ItemDoDia; extra?: string }) {
  if (!item) return null;
  const cor = CORES_TIPO[item.tipo];
  return (
    <View style={[estilos.destaque, { backgroundColor: cor.forte }]}>
      <View style={estilos.destaqueTopo}>
        <Text style={estilos.destaqueRotulo}>{rotulo}</Text>
        <Text style={estilos.destaqueHora}>{formatarHora(item.minutos)}</Text>
      </View>
      <Text style={estilos.destaqueTitulo}>
        {item.emoji} {item.titulo}
      </Text>
      {!!item.detalhe && (
        <Text style={estilos.destaqueDetalhe} numberOfLines={2}>
          {item.detalhe}
        </Text>
      )}
      {extra && <Text style={estilos.destaqueExtra}>⏳ {extra}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.fundo },
  conteudo: { padding: 16, paddingBottom: 40 },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  diaSemana: { fontSize: 28, fontWeight: '800', color: CORES.texto },
  subtitulo: { fontSize: 15, color: CORES.textoSuave, marginTop: 2 },
  botaoDias: { backgroundColor: '#E8EEFB', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  botaoDiasTexto: { color: CORES.primaria, fontWeight: '700' },
  destaques: { gap: 10, marginBottom: 8 },
  destaque: { borderRadius: 18, padding: 18 },
  destaqueTopo: { flexDirection: 'row', justifyContent: 'space-between' },
  destaqueRotulo: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', letterSpacing: 1.2, fontSize: 13 },
  destaqueHora: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 14 },
  destaqueTitulo: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 6 },
  destaqueDetalhe: { color: 'rgba(255,255,255,0.92)', fontSize: 15, marginTop: 4 },
  destaqueExtra: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 10 },
  aviso: { color: '#5B21B6', backgroundColor: '#EDE9FE', padding: 10, borderRadius: 10, fontSize: 13, marginTop: 4 },
  item: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  passado: { opacity: 0.4 },
  hora: { fontSize: 16, fontWeight: '800', width: 52, fontVariant: ['tabular-nums'] },
  itemTitulo: { fontSize: 16, fontWeight: '700', color: CORES.texto },
  itemDetalhe: { fontSize: 14, color: CORES.textoSuave, marginTop: 2 },
});
