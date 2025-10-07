# Basurapp

Aplicación React con Vite, TypeScript y Tailwind CSS lista para desplegar en Vercel. Incluye un flujo de autenticación simulado con tres roles: básico, administrador y recolector.

## Requisitos previos

- Node.js 20 o superior
- pnpm 10 (el repositorio especifica la versión exacta en `package.json`)

## Scripts disponibles

- `pnpm install` — instala las dependencias.
- `pnpm dev` — arranca el servidor de desarrollo en modo hot reload.
- `pnpm build` — genera la aplicación optimizada en `dist/`.
- `pnpm preview` — sirve la versión construida para verificación local.
- `pnpm lint` — ejecuta ESLint usando la configuración recomendada para React + TypeScript.

## Autenticación de prueba

El login funciona contra un conjunto de credenciales en memoria para facilitar el desarrollo:

| Rol           | Usuario      | Contraseña |
| ------------- | ------------ | ---------- |
| Básico        | `ciudadano`  | `basico123`|
| Administrador | `admin`      | `admin123` |
| Recolector    | `recolector` | `reco123`  |

Tras iniciar sesión se muestra el panel con un menú lateral (inicio) y el área principal lista para futuras secciones.

## Tailwind CSS

La configuración de Tailwind se encuentra en `tailwind.config.ts` y el archivo principal de estilos es `src/index.css`. Puedes comenzar a usar utilidades directamente en tus componentes.

## Despliegue en Vercel

Vercel detectará automáticamente el proyecto como una aplicación Vite. Se incluye un archivo `vercel.json` con la configuración mínima necesaria:

- Comando de build: `pnpm build`
- Output: `dist`

Tras hacer push a GitHub, importa el repositorio en Vercel y selecciona pnpm como gestor de paquetes si no se detecta automáticamente.

### Variables de entorno

El front consume la API del backend mediante la variable `VITE_API_URL`.

1. Copia el archivo `.env.example` a `.env` y ajusta el valor para tus entornos locales si es necesario.
2. En Vercel, define `VITE_API_URL` con la URL del backend desplegado (por defecto usamos `https://basurapp-api.vercel.app`).

## Panel ciudadano

El usuario ciudadano puede revisar, editar o eliminar recolecciones existentes desde su panel. El calendario permite seleccionar un día para programar nuevas recolecciones definiendo tipo, localidad, dirección y franja horaria entre las 8:00 a. m. y las 8:00 p. m.

## Panel de recolector

Los recolectores pueden ver exclusivamente las recolecciones asignadas, registrar su realización con fecha y hora efectiva y, cuando aplique, consignar el peso recogido para residuos inorgánicos.
