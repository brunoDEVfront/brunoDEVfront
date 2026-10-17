import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { CORES } from '../theme';

export interface Ponto {
  rotulo: string;
  valor: number;
}

const ALTURA = 150;
const MARGEM = { topo: 18, base: 22, esq: 8, dir: 8 };

export function GraficoLinha({ titulo, pontos, cor, unidade }: { titulo: string; pontos: Ponto[]; cor: string; unidade: string }) {
  const [largura, setLargura] = useState(0);

  // onLayout fica sempre no mesmo View para a largura ser medida desde a primeira renderização.
  const medir = (e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width - 32);

  if (pontos.length < 2) {
    return (
      <View style={estilos.caixa} onLayout={medir}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.vazio}>Registre pelo menos 2 semanas para ver o gráfico.</Text>
      </View>
    );
  }

  const valores = pontos.map((p) => p.valor);
  let min = Math.min(...valores);
  let max = Math.max(...valores);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const areaL = largura - MARGEM.esq - MARGEM.dir;
  const areaA = ALTURA - MARGEM.topo - MARGEM.base;
  const x = (i: number) => MARGEM.esq + (areaL * i) / (pontos.length - 1);
  const y = (v: number) => MARGEM.topo + areaA * (1 - (v - min) / (max - min));
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','));

  return (
    <View style={estilos.caixa} onLayout={medir}>
      <Text style={estilos.titulo}>
        {titulo} <Text style={estilos.faixa}>({fmt(Math.min(...valores))}–{fmt(Math.max(...valores))} {unidade})</Text>
      </Text>
      {largura > 0 && (
        <Svg width={largura} height={ALTURA}>
          <Line x1={MARGEM.esq} x2={largura - MARGEM.dir} y1={ALTURA - MARGEM.base} y2={ALTURA - MARGEM.base} stroke={CORES.borda} />
          <Polyline points={pontos.map((p, i) => `${x(i)},${y(p.valor)}`).join(' ')} fill="none" stroke={cor} strokeWidth={2.5} />
          {pontos.map((p, i) => (
            <Circle key={i} cx={x(i)} cy={y(p.valor)} r={4} fill={cor} />
          ))}
          <SvgText x={x(pontos.length - 1)} y={y(pontos[pontos.length - 1].valor) - 8} fontSize={12} fontWeight="700" fill={cor} textAnchor="end">
            {fmt(pontos[pontos.length - 1].valor)}
          </SvgText>
          <SvgText x={MARGEM.esq} y={ALTURA - 6} fontSize={11} fill={CORES.textoSuave}>
            {pontos[0].rotulo}
          </SvgText>
          <SvgText x={largura - MARGEM.dir} y={ALTURA - 6} fontSize={11} fill={CORES.textoSuave} textAnchor="end">
            {pontos[pontos.length - 1].rotulo}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    backgroundColor: CORES.cartao,
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CORES.borda,
    marginBottom: 12,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: CORES.texto, marginBottom: 8 },
  faixa: { fontSize: 13, fontWeight: '400', color: CORES.textoSuave },
  vazio: { color: CORES.textoSuave, fontSize: 14 },
});
