# Mercadex App

Proyecto separado de Mercadex (escritorio) para los socios de la asociación.

| Carpeta | Qué es |
|---|---|
| `movil/` | App para Android e iOS (Expo / React Native): deudas, pago por QR con comprobante, recibos y cuenta del socio. |
| `panel/` | Panel web de caja (React + Vite): revisar comprobantes con foto, dar acceso a socios y cargar el QR de cobro. |

## Ramas y entornos (igual que Mercadex)

| | Desarrollo | Producción |
|---|---|---|
| Rama | `develop` | `main` |
| API | Mercadex local en tu PC (`http://IP-DE-TU-PC:5189`) | `https://mercadex-api.onrender.com` |
| Base de datos | PostgreSQL local (`mercadex_dev`) | PostgreSQL de Render |
| Cómo se usa | Expo Go en tu celular, con la franja amarilla **Desarrollo** arriba | App publicada en Play Store / App Store |

Se trabaja en `develop`. Cuando algo está probado, se pasa a `main` y recién
desde `main` se compila la versión para las tiendas.

La configuración de cada entorno está en `movil/`:
- `.env.production`: dirección de la API de producción (se usa al compilar para las tiendas).
- `.env.development.local`: tu dirección local. **No se sube a GitHub**; créala a partir de
  `.env.development.local.example`.

## Probar en tu celular (desarrollo)

1. Instala **Expo Go** en el celular. El celular y la PC deben estar en la misma red Wi-Fi.
2. Averigua la IP de tu PC con `ipconfig` ("Dirección IPv4") y crea el archivo local:

   ```powershell
   cd C:\mercadex-app\movil
   copy .env.development.local.example .env.development.local
   notepad .env.development.local   # cambia 192.168.1.20 por tu IP
   ```

3. Inicia la API de Mercadex escuchando en la red (no solo en 127.0.0.1):

   ```powershell
   cd C:\Mercadex\Proyecto
   dotnet run --project src\Mercadex.Api --urls http://0.0.0.0:5189
   ```

4. Inicia la app y escanea el QR con Expo Go (Android) o con la cámara (iPhone):

   ```powershell
   cd C:\mercadex-app\movil
   npm install
   npx expo start
   ```

## Panel web de caja (desarrollo)

Con la API de Mercadex encendida en tu PC (`--urls http://127.0.0.1:5189`):

```powershell
cd C:\mercadex-app\panel
npm install
npm run dev
```

Abre http://localhost:5173 e ingresa con el usuario administrador de Mercadex
(`MERCADEX_ADMIN_USER` / `MERCADEX_ADMIN_PASSWORD` de tu configuración local).
La API de desarrollo ya acepta el panel en ese puerto.

Los datos (casetas, deudas, recibos) viven en la base de Mercadex, así que la app
los lee por la API de Mercadex. Las rutas que usa la app (`/api/app/...`) se
agregan primero en desarrollo y llegan a producción cuando todo esté probado.

## Exportar la app como APK

El APK usa siempre la API de **producción** (Render). Antes de repartirlo, las
rutas de la app deben estar publicadas en la API de producción.

### Opción A: en tu PC con Android Studio (sin cuentas)

Necesita Android Studio instalado. La primera vez tarda 10–15 minutos.

```powershell
cd C:\mercadex-app\movil
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm install
npm run apk
```

El archivo queda en
`movil\android\app\build\outputs\apk\release\app-release.apk`.
Está firmado con una clave de prueba: sirve para instalarlo en celulares de la
asociación, no para Google Play.

### Opción B: en la nube con EAS (firmado, listo para repartir o publicar)

Necesita una cuenta gratuita en https://expo.dev.

```powershell
cd C:\mercadex-app\movil
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile apk
```

Al terminar, EAS muestra un enlace y un QR para descargar el APK. EAS guarda la
clave de firma de la app; usa siempre la misma cuenta para que las
actualizaciones se instalen encima de la versión anterior.

Para Google Play se usa `--profile playstore` (genera un .aab).

Antes de cada versión nueva, sube `version` y `android.versionCode` en `movil/app.json`.
