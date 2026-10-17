import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { CORES } from '../../theme';

function Icone({ emoji, focado }: { emoji: string; focado: boolean }) {
  return <Text style={{ fontSize: 18, lineHeight: 24, opacity: focado ? 1 : 0.55 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: CORES.primaria,
        tabBarInactiveTintColor: CORES.textoSuave,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: { backgroundColor: CORES.cartao },
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        sceneStyle: { backgroundColor: CORES.fundo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje', tabBarIcon: ({ focused }) => <Icone emoji="📅" focado={focused} /> }} />
      <Tabs.Screen name="treino" options={{ title: 'Treino', tabBarIcon: ({ focused }) => <Icone emoji="🏋️" focado={focused} /> }} />
      <Tabs.Screen name="semana" options={{ title: 'Semana', tabBarIcon: ({ focused }) => <Icone emoji="📈" focado={focused} /> }} />
      <Tabs.Screen name="ajustes" options={{ title: 'Ajustes', tabBarIcon: ({ focused }) => <Icone emoji="⚙️" focado={focused} /> }} />
    </Tabs>
  );
}
