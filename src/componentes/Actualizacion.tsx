import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Modal, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/componentes/ui';
import { abrirEnNavegador, buscarNovedad, descargarEInstalar, VERSION_ACTUAL, type Novedad } from '@/lib/actualizacion';
import { colores, espacio, radio } from '@/lib/tema';

const CADA = 60 * 60 * 1000; // vuelve a revisar al volver a la app, como mucho una vez por hora

/**
 * Aviso de versión nueva. Si es obligatoria cubre toda la app; si no,
 * se puede dejar para más tarde (vuelve a aparecer la próxima vez).
 */
export function Actualizacion() {
  const [novedad, setNovedad] = useState<Novedad | null>(null);
  const [oculta, setOculta] = useState(false);
  const [estado, setEstado] = useState<'listo' | 'descargando' | 'instalando' | 'error'>('listo');
  const [avance, setAvance] = useState<number | null>(null);
  const ultima = useRef(0);

  const revisar = useCallback(async () => {
    if (Date.now() - ultima.current < CADA) return;
    ultima.current = Date.now();
    const n = await buscarNovedad();
    if (n) {
      setNovedad(n);
      setOculta(false);
    }
  }, []);

  useEffect(() => {
    void revisar();
    const s = AppState.addEventListener('change', (e) => {
      if (e === 'active') void revisar();
    });
    return () => s.remove();
  }, [revisar]);

  if (!novedad || (oculta && !novedad.obligatoria)) return null;

  const actualizar = async () => {
    setEstado('descargando');
    setAvance(0);
    try {
      await descargarEInstalar(novedad, setAvance);
      // Se abrió el instalador; si el socio lo cancela, puede volver a tocar el botón.
      setEstado('instalando');
    } catch {
      setEstado('error');
    }
  };

  return (
    <Modal
      visible
      transparent={!novedad.obligatoria}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => (novedad.obligatoria ? undefined : setOculta(true))}>
      <View style={[estilos.fondo, novedad.obligatoria ? estilos.fondoCompleto : null]}>
        <View style={estilos.tarjeta}>
          <View style={estilos.icono}>
            <Ionicons name="cloud-download-outline" size={30} color={colores.azul} />
          </View>
          <Text style={estilos.titulo}>{novedad.obligatoria ? 'Actualiza Mercadex para continuar' : 'Hay una versión nueva'}</Text>
          <Text style={estilos.texto}>
            Tienes la versión {VERSION_ACTUAL}. La nueva es la {novedad.version}.
            {novedad.obligatoria ? ' Esta actualización es necesaria para seguir usando la app.' : ''}
          </Text>
          {novedad.notas ? <Text style={estilos.notas}>{novedad.notas}</Text> : null}

          {estado === 'descargando' ? (
            <View style={{ marginTop: espacio.l }}>
              <View style={estilos.pista}>
                <View style={[estilos.relleno, { width: `${avance ?? 30}%` }]} />
              </View>
              <Text style={estilos.ayuda}>{avance !== null ? `Descargando… ${avance}%` : 'Descargando…'}</Text>
            </View>
          ) : null}

          {estado === 'instalando' ? (
            <Text style={estilos.ayuda}>
              Toca «Instalar» en la ventana de Android. Si te pide permiso para instalar apps de Mercadex, actívalo y vuelve atrás.
            </Text>
          ) : null}

          {estado === 'error' ? (
            <Text style={[estilos.ayuda, { color: colores.rojo }]}>
              No se pudo descargar. Revisa tu internet y vuelve a intentar, o descárgala con el navegador.
            </Text>
          ) : null}

          <Boton
            titulo={estado === 'instalando' ? 'Abrir el instalador otra vez' : estado === 'error' ? 'Intentar de nuevo' : 'Actualizar ahora'}
            icono="download-outline"
            variante="acento"
            cargando={estado === 'descargando'}
            onPress={() => void actualizar()}
            estilo={{ marginTop: espacio.l }}
          />
          {estado === 'error' ? (
            <Boton titulo="Descargar con el navegador" variante="secundario" onPress={() => abrirEnNavegador(novedad)} estilo={{ marginTop: espacio.s }} />
          ) : null}
          {!novedad.obligatoria && estado !== 'descargando' ? (
            <Boton titulo="Más tarde" variante="secundario" onPress={() => setOculta(true)} estilo={{ marginTop: espacio.s }} />
          ) : null}
          <Text style={estilos.ayuda}>Tus datos y tu sesión se mantienen al actualizar.</Text>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(11, 31, 51, 0.6)', justifyContent: 'center', padding: espacio.xl },
  fondoCompleto: { backgroundColor: colores.azul },
  tarjeta: { backgroundColor: colores.blanco, borderRadius: radio.l, padding: espacio.xl },
  icono: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colores.ambarFondo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacio.l,
  },
  titulo: { fontSize: 21, fontWeight: '700', color: colores.tinta },
  texto: { fontSize: 15, color: colores.texto, marginTop: espacio.s, lineHeight: 21 },
  notas: {
    fontSize: 14,
    color: colores.textoSuave,
    marginTop: espacio.m,
    backgroundColor: colores.superficie,
    borderRadius: radio.s,
    padding: espacio.m,
    lineHeight: 20,
  },
  pista: { height: 8, borderRadius: 4, backgroundColor: colores.borde, overflow: 'hidden' },
  relleno: { height: '100%', backgroundColor: colores.azulMedio },
  ayuda: { fontSize: 13, color: colores.textoSuave, marginTop: espacio.m, textAlign: 'center', lineHeight: 18 },
});
