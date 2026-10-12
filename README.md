# Mercadex App

Proyecto separado de Mercadex (escritorio) para los socios de la asociación.

| Carpeta | Qué es |
|---|---|
| `movil/` | App para Android e iOS (Expo / React Native): deudas, pago por QR con comprobante, recibos y cuenta del socio. |

Los datos (casetas, deudas, recibos) viven en la base de Mercadex, así que la app
los lee a través de la API de Mercadex (`https://mercadex-api.onrender.com`).
Las rutas que usa la app (`/api/app/...`) todavía **no** están en la API de
producción; se agregan cuando el proyecto esté listo para salir.

## Probar la app en el celular

1. Instala **Expo Go** en el celular.
2. En la PC (misma red Wi-Fi que el celular):

   ```powershell
   cd movil
   npm install
   npx expo start
   ```

3. Escanea el QR con Expo Go (Android) o con la cámara (iPhone).

Para usar una API local: `$env:EXPO_PUBLIC_API_URL="http://IP-DE-TU-PC:5189"` antes de `npx expo start`.
