import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Actualizacion } from '@/componentes/Actualizacion';
import { FranjaDesarrollo } from '@/componentes/ui';
import { ENTORNO } from '@/lib/api';
import { ProveedorSesion } from '@/lib/sesion';
import { colores } from '@/lib/tema';

export default function Raiz() {
  return (
    <SafeAreaProvider>
      <ProveedorSesion>
        <StatusBar style="dark" />
        {ENTORNO === 'desarrollo' ? (
          <SafeAreaView edges={['top']} style={{ backgroundColor: colores.maiz }}>
            <FranjaDesarrollo />
          </SafeAreaView>
        ) : null}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colores.superficie },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="bienvenida" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="pagar"
            options={{
              headerShown: true,
              title: 'Pagar',
              headerTintColor: colores.azul,
              headerStyle: { backgroundColor: colores.superficie },
              headerShadowVisible: false,
            }}
          />
        </Stack>
        <Actualizacion />
      </ProveedorSesion>
    </SafeAreaProvider>
  );
}
