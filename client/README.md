# Library Management System - Frontend (React)

## Descripción

Frontend de la aplicación de gestión de biblioteca, desarrollado con **React**, **Vite** y **Tailwind CSS**. Permite gestionar autores, categorías, editoriales, libros, ejemplares y préstamos, comunicándose con el backend Node.js/Express y Supabase.

## Estructura

- **public/**: Archivos estáticos
- **src/**: Código fuente React
  - **components/**: Componentes reutilizables (autores, libros, préstamos, etc.)
  - **hooks/**: Hooks personalizados
  - **pages/**: Vistas principales
  - **services/**: Funciones para consumir la API
  - **App.jsx**: Componente principal y rutas
  - **index.css**: Estilos globales

## Buenas Prácticas
- Mantén los componentes limpios y reutilizables.
- Elimina imports y variables no utilizados.
- Usa hooks para lógica compartida.
- Actualiza este README tras cambios importantes.

## Instalación

1. Entra en la carpeta `client` y ejecuta:
   ```bash
   npm install
   npm run dev
   ```
2. Accede a la app en `http://localhost:5173`

---

Para detalles de endpoints y estructura general, revisa el README principal y el del backend.