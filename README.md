# Mercadex App

Proyecto separado de Mercadex (escritorio) para los socios de la asociación.

| Carpeta | Qué es |
|---|---|
| `movil/` | App para Android e iOS (Expo / React Native): deudas, pago por QR con comprobante, recibos y cuenta del socio. |

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

Los datos (casetas, deudas, recibos) viven en la base de Mercadex, así que la app
los lee por la API de Mercadex. Las rutas que usa la app (`/api/app/...`) se
agregan primero en desarrollo y llegan a producción cuando todo esté probado.
