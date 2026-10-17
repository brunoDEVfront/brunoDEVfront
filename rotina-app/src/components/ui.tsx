import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CORES, RAIO } from '../theme';

export function Cartao({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[estilos.cartao, style]}>{children}</View>;
}

export function TituloSecao({ children }: { children: ReactNode }) {
  return <Text style={estilos.tituloSecao}>{children}</Text>;
}

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  desabilitado,
  style,
}: {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const fundo = variante === 'primario' ? CORES.primaria : variante === 'perigo' ? CORES.perigo : '#E8EEFB';
  const cor = variante === 'secundario' ? CORES.primaria : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      style={({ pressed }) => [estilos.botao, { backgroundColor: fundo, opacity: desabilitado ? 0.5 : pressed ? 0.8 : 1 }, style]}
    >
      <Text style={[estilos.botaoTexto, { color: cor }]}>{titulo}</Text>
    </Pressable>
  );
}

export function Chip({ rotulo, ativo, onPress }: { rotulo: string; ativo?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[estilos.chip, ativo && estilos.chipAtivo]}>
      <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

export function Selo({ texto, cor, fundo }: { texto: string; cor: string; fundo: string }) {
  return (
    <View style={[estilos.selo, { backgroundColor: fundo }]}>
      <Text style={[estilos.seloTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

export const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: CORES.cartao,
    borderRadius: RAIO,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CORES.borda,
  },
  tituloSecao: {
    fontSize: 13,
    fontWeight: '700',
    color: CORES.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
  },
  botao: { borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' },
  botaoTexto: { fontSize: 16, fontWeight: '700' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: CORES.cartao,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  chipAtivo: { backgroundColor: CORES.primaria, borderColor: CORES.primaria },
  chipTexto: { fontSize: 14, fontWeight: '600', color: CORES.texto },
  chipTextoAtivo: { color: '#fff' },
  selo: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  seloTexto: { fontSize: 13, fontWeight: '700' },
  tela: { flex: 1, backgroundColor: CORES.fundo },
  conteudo: { padding: 16, paddingBottom: 40 },
  textoSuave: { color: CORES.textoSuave, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    backgroundColor: '#fff',
    color: CORES.texto,
  },
});
