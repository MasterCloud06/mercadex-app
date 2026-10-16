import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import { getContentUriAsync } from 'expo-file-system/legacy';
import { startActivityAsync } from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';
import { ENTORNO } from '@/lib/api';

// Actualización de la app de socios (APK fuera de la Play Store).
// Igual que Mercadex de escritorio: la app lee un archivo público en el
// repositorio mercadex-updates y, si hay una versión nueva, la descarga
// y abre el instalador de Android. Si la versión instalada es menor que
// la mínima, la app no deja seguir hasta actualizar.

const FUENTE = 'https://raw.githubusercontent.com/MasterCloud06/mercadex-updates/main/version-app.json';

/** Solo se aceptan instaladores publicados en las versiones de mercadex-updates. */
const ORIGEN_PERMITIDO = 'https://github.com/MasterCloud06/mercadex-updates/releases/download/';

export type Novedad = {
  version: string;
  obligatoria: boolean;
  notas: string | null;
  apkUrl: string;
};

type Fuente = {
  schemaVersion?: number;
  latestVersion?: string;
  minimumRequiredVersion?: string;
  apkUrl?: string;
  releaseNotes?: string;
};

export const VERSION_ACTUAL: string = Constants.expoConfig?.version ?? '0.0.0';

/** -1, 0 o 1 al comparar "1.10.2" con "1.9.0". */
export function compararVersiones(a: string, b: string): number {
  const pa = a.split('.').map((x) => parseInt(x, 10) || 0);
  const pb = b.split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return 0;
}

/** Busca una versión nueva. Null si no hay, si no hay internet o fuera de Android. */
export async function buscarNovedad(): Promise<Novedad | null> {
  if (Platform.OS !== 'android' || ENTORNO === 'desarrollo') return null;

  try {
    const control = new AbortController();
    const espera = setTimeout(() => control.abort(), 10_000);
    const r = await fetch(`${FUENTE}?t=${Date.now()}`, { signal: control.signal, cache: 'no-store' });
    clearTimeout(espera);
    if (!r.ok) return null;

    const f = (await r.json()) as Fuente;
    if (f.schemaVersion !== 1 || !f.latestVersion || !f.apkUrl || !f.apkUrl.startsWith(ORIGEN_PERMITIDO)) return null;
    if (compararVersiones(VERSION_ACTUAL, f.latestVersion) >= 0) return null;

    return {
      version: f.latestVersion,
      obligatoria: !!f.minimumRequiredVersion && compararVersiones(VERSION_ACTUAL, f.minimumRequiredVersion) < 0,
      notas: f.releaseNotes?.trim() || null,
      apkUrl: f.apkUrl,
    };
  } catch {
    // Sin internet o GitHub caído: la app sigue funcionando.
    return null;
  }
}

/**
 * Descarga el APK y abre el instalador de Android. La primera vez Android
 * pide permitir "instalar apps de esta fuente" para Mercadex.
 */
export async function descargarEInstalar(novedad: Novedad, alAvanzar: (porcentaje: number | null) => void): Promise<void> {
  const destino = new File(Paths.cache, `Mercadex-${novedad.version}.apk`);
  if (destino.exists) destino.delete();

  const archivo = await File.downloadFileAsync(novedad.apkUrl, destino, {
    idempotent: true,
    onProgress: ({ bytesWritten, totalBytes }) =>
      alAvanzar(totalBytes > 0 ? Math.min(100, Math.round((bytesWritten / totalBytes) * 100)) : null),
  });

  const uri = await getContentUriAsync(archivo.uri);
  await startActivityAsync('android.intent.action.VIEW', {
    data: uri,
    type: 'application/vnd.android.package-archive',
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
  });
}

/** Plan B: descargar con el navegador del celular. */
export function abrirEnNavegador(novedad: Novedad) {
  void Linking.openURL(novedad.apkUrl);
}
