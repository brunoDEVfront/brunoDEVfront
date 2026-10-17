import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatarCronometro } from '../lib/tempo';
import { useTimer } from '../state/TimerContext';
import { CORES } from '../theme';

/** Barra fixa no rodapé com o descanso em andamento. */
export function BarraTimer() {
  const { restante, duracao, rotulo, acabou, parar } = useTimer();
  if (restante === null && !acabou) return null;

  const progresso = restante === null || duracao === 0 ? 1 : 1 - restante / duracao;
  return (
    <View style={[estilos.barra, acabou && { backgroundColor: CORES.sucesso }]}>
      <View style={[estilos.progresso, { width: `${progresso * 100}%` }]} />
      <View style={estilos.linha}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.rotulo} numberOfLines={1}>
            {acabou ? 'Descanso acabou! Próxima série 💪' : `Descanso · ${rotulo}`}
          </Text>
          {!acabou && restante !== null && <Text style={estilos.tempo}>{formatarCronometro(restante)}</Text>}
        </View>
        <Pressable onPress={parar} style={estilos.botao}>
          <Text style={estilos.botaoTexto}>{acabou ? 'OK' : 'Parar'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: CORES.texto,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
  },
  progresso: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: 'rgba(255,255,255,0.12)' },
  linha: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rotulo: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tempo: { color: '#fff', fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  botao: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
