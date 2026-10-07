# Bar Bocatería El Búho · Toledo

Web del Bar Bocatería El Búho (P.º Federico García Lorca, 6 · 45007 Toledo · Tel. 607 96 83 10).

Es una web estática (HTML + CSS + JavaScript, sin dependencias de compilación) que incluye:

- **Estado en vivo:** indica si el bar está abierto o cerrado según la hora de Toledo (Europe/Madrid), con una cuenta atrás hasta el cierre o la apertura y una barra del día.
- **Horario semanal** que resalta el día de hoy.
- **Carta** con filtros por categoría y buscador.
- **Galería** con visor ampliado (teclado y gestos táctiles).
- **Reseñas** con carrusel automático y contadores animados.
- **Reservas:** formulario validado que genera el mensaje de WhatsApp listo para enviar.
- **Cómo llegar:** mapa interactivo (Leaflet + OpenStreetMap), enlaces a Google Maps, Waze y Apple Maps, y cálculo de la distancia desde tu ubicación.
- Animaciones: preloader, título animado letra a letra, luciérnagas en canvas, búho que sigue el cursor, parallax, efectos de inclinación (tilt) y botones magnéticos.
- Diseño adaptable a móvil y respeta `prefers-reduced-motion`.

## Requisitos

Node.js 20.19+ o 22.12+ (ver `.nvmrc`).

## Uso

```bash
npm install
npm run preview   # compila y sirve la versión de producción (http://localhost:4173)
npm run dev       # servidor de desarrollo con recarga en caliente
npm run build     # genera la web estática en dist/
npm run lint      # ESLint
npm test          # tests de la lógica de horario y distancia (Vitest)
```

## Estructura

```
index.html                 Página (punto de entrada de Vite)
public/                    Favicon e imagen para redes sociales
src/main.js                Arranque: inicia cada componente
src/components/            Un módulo por sección (horario, carta, galería, reservas, mapa…)
src/lib/schedule.js        Lógica pura de abierto/cerrado (con tests)
src/lib/geo.js             Cálculo de distancias (con tests)
src/data/bar.js            Datos editables: horario, carta, galería, reseñas, créditos
src/styles/main.css        Estilos
src/assets/img/            Fotos (Vite las versiona en el build)
```

Para cambiar platos, precios, fotos o el horario, edita **`src/data/bar.js`**.

## Publicar con GitHub Pages

`npm run build` genera `dist/` con rutas relativas, así que funciona en cualquier subcarpeta.

## Notas

- Los precios de la carta son **orientativos**: confírmalos con el local.
- Las fotos son de Wikimedia Commons con licencias libres (CC BY, CC BY-SA, CC0 y dominio público); los créditos aparecen en el pie de la web («Créditos de las fotos»). Se pueden sustituir por fotos propias del bar en `assets/img/` manteniendo los nombres.
- Datos del local obtenidos de su ficha pública en Google Maps (valoración 4,1 con 548 reseñas, horario, servicios).
