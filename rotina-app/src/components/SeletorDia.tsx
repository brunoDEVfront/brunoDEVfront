import { ScrollView, StyleSheet } from 'react-native';

import type { DiaSemana } from '../data/tipos';
import { DIAS_EXIBICAO, NOMES_DIAS_CURTOS } from '../lib/tempo';
import { Chip } from './ui';

export function SeletorDia({ valor, hoje, onChange }: { valor: DiaSemana; hoje: DiaSemana; onChange: (d: DiaSemana) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.linha}>
      {DIAS_EXIBICAO.map((d) => (
        <Chip key={d} rotulo={d === hoje ? `${NOMES_DIAS_CURTOS[d]} •` : NOMES_DIAS_CURTOS[d]} ativo={d === valor} onPress={() => onChange(d)} />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  linha: { gap: 8, paddingVertical: 4 },
});
