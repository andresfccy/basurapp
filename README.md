# IngSoftware

Aplicación React creada con Vite, TypeScript y Tailwind CSS lista para desplegar en Vercel.

## Requisitos previos

- Node.js 20 o superior
- pnpm 10 (el repositorio especifica la versión exacta en `package.json`)

## Scripts disponibles

- `pnpm install` — instala las dependencias.
- `pnpm dev` — arranca el servidor de desarrollo en modo hot reload.
- `pnpm build` — genera la aplicación optimizada en `dist/`.
- `pnpm preview` — sirve la versión construida para verificación local.
- `pnpm lint` — ejecuta ESLint usando la configuración recomendada para React + TypeScript.

## Tailwind CSS

La configuración de Tailwind se encuentra en `tailwind.config.ts` y el archivo principal de estilos es `src/index.css`. Puedes comenzar a usar utilidades directamente en tus componentes.

## Despliegue en Vercel

Vercel detectará automáticamente el proyecto como una aplicación Vite. Se incluye un archivo `vercel.json` con la configuración mínima necesaria:

- Comando de build: `pnpm build`
- Output: `dist`

Tras hacer push a GitHub, importa el repositorio en Vercel y selecciona pnpm como gestor de paquetes si no se detecta automáticamente.
