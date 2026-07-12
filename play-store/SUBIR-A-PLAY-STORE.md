# Subir Art Cuadros a Google Play Store

## Requisitos en tu PC

1. **Java JDK 17** – https://adoptium.net/
2. **Android SDK** (se instala solo con Bubblewrap la primera vez)
3. Cuenta **Google Play Developer** – 25 USD (una vez)

## Paso 1 – Generar la app Android (.aab)

```powershell
cd "E:\js cosas\APP MOVIL"
npm install
npm run android:init
npm run android:build
```

El archivo para subir será:
`android/app-release-bundle.aab`

## Paso 2 – Digital Asset Links (obligatorio)

```powershell
npm run android:fingerprint
npm run deploy:github
```

**IMPORTANTE:** Google exige este archivo en la raíz del dominio:

`https://sergioivorra.github.io/.well-known/assetlinks.json`

Como tu app está en un subpath, debes **también** subir el contenido de `.well-known/assetlinks.json` a un repo **`sergioivorra.github.io`** (página de usuario de GitHub), en la carpeta `.well-known/`.

**Mejor opción a futuro:** dominio `app.artcuadros.com` apuntando a la app.

## Paso 3 – Política de privacidad

URL pública (ya incluida en la app):
`https://sergioivorra.github.io/APP-ARTCUADROS-MOVIL/politica-privacidad.html`

Pégala en Play Console → Política de privacidad.

## Paso 4 – Google Play Console

1. https://play.google.com/console
2. **Crear aplicación** → Art Cuadros
3. **Producción** → **Crear versión** → subir `app-release-bundle.aab`
4. **Ficha de Play Store:**
   - Icono 512×512 (`icons/icon-512.png`)
   - Capturas de pantalla (mínimo 2)
   - Descripción corta y larga
   - Categoría: Compras o Arte
5. **Política de privacidad:** URL del paso 3
6. **Clasificación de contenido:** completar cuestionario
7. **Enviar a revisión** (1–7 días)

## Datos de la app

| Campo | Valor |
|-------|--------|
| Package ID | `com.artcuadros.app` |
| Nombre | Art Cuadros |
| URL web | https://sergioivorra.github.io/APP-ARTCUADROS-MOVIL/ |
| Descuento app | 5% código `5%-art` |

## Cambiar contraseña del keystore

La clave de firma por defecto es temporal. Edita `android/twa-manifest.json` y usa contraseñas seguras antes de publicar.

**Guarda `android/android.keystore` en lugar seguro.** Sin él no podrás actualizar la app.
