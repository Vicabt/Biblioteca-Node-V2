# Library Management System - Backend (Node.js/Express + Supabase)

## Descripción

Backend de la aplicación de gestión de biblioteca, desarrollado con **Node.js**, **Express** y **Supabase** (PostgreSQL). Proporciona una API RESTful para gestionar usuarios, autores, categorías, editoriales, libros, ejemplares y préstamos.

## Estructura

- **src/**: Código fuente del backend
  - **config/**: Configuración de Supabase y variables de entorno
  - **controllers/**: Lógica de negocio y endpoints
  - **middleware/**: Autenticación, autorización y manejo de errores
  - **models/**: Definiciones de tablas y helpers
  - **routes/**: Definición de rutas
  - **scripts/**: Scripts de base de datos y utilidades
  - **services/**: Lógica de negocio adicional
  - **utils/**: Funciones utilitarias y validaciones
  - **app.js**: Configuración principal de Express

## Buenas Prácticas
- Elimina imports y variables no utilizados en controladores y servicios.
- Mantén los controladores enfocados y documentados.
- Valida siempre los datos recibidos del cliente.
- Usa middlewares para autenticación y autorización.
- Actualiza este README tras cambios importantes.

## Instalación

1. Entra en la carpeta `server` y ejecuta:
   ```bash
   npm install
   npm run dev
   ```
2. Configura tus variables de entorno en `.env`.
3. Ejecuta los scripts de base de datos si es necesario.

---

Para detalles de endpoints y estructura general, revisa el README principal y el del frontend.