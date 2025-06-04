# CRUD Library Management System (React + Node.js + Supabase)

Este proyecto es una aplicación completa para la gestión de una biblioteca, desarrollada con **React** (frontend), **Node.js/Express** (backend) y **Supabase** (PostgreSQL).

## Características

- Autenticación y autorización basada en roles (Usuario, Bibliotecario, Administrador)
- CRUD para autores, categorías, editoriales, libros, ejemplares y préstamos
- Gestión de préstamos con flujos de solicitud, aprobación, devolución, etc.
- Interfaz moderna y responsive con React y Tailwind CSS
- Notificaciones y feedback inmediato
- Buenas prácticas de código y limpieza regular

## Estructura del Proyecto

```
crud-app/
├── client/   # Frontend React
├── server/   # Backend Node.js/Express
└── README.md
```

## Buenas Prácticas
- Elimina código y variables no utilizados.
- Mantén los controladores y servicios organizados y documentados.
- Valida siempre los datos recibidos del cliente.
- Usa middlewares para autenticación y autorización.
- Actualiza este README y los de cada subproyecto tras cambios importantes.

## Instalación y Ejecución

Sigue las instrucciones en los README de `client/` y `server/` para instalar dependencias, configurar variables de entorno y ejecutar la aplicación.

---

Para detalles específicos, revisa los README de cada subcarpeta.

## Features

- User authentication with JWT (roles: User, Librarian, Administrator)
- CRUD operations for:
    - Authors
    - Categories
    - Publishers
    - Books
    - Book Copies (associated with Books)
    - Loans (linking Users, Books, and Copies)
- Loan management workflows (request, approve, reject, return, etc.)
- Modern UI with Tailwind CSS
- Responsive design
- Toast notifications for user feedback
- Supabase (PostgreSQL) database

## Project Structure

The project is divided into two main parts:

### Client (React Frontend)

- **public/**: Static assets like favicon and index.html
- **src/**: Main React application code
  - **assets/**: Static assets like images or fonts
  - **components/**: Reusable components
    - **common/**: Common components like Button, Input, and Modal
    - **authors/**: Components related to authors management
    - **categories/**: Components related to categories management
    - **publishers/**: Components related to publishers management
    - **books/**: Components related to books and book copies management
    - **loans/**: Components related to loan management
    - **users/**: Components for user-related views (e.g., profile, admin user list)
    - **layouts/**: Page layout components
  - **hooks/**: Custom hooks for reusable logic (e.g., `useApi`)
  - **pages/**: Page components for different sections (e.g., `BooksPage.jsx`, `LoansPage.jsx`)
  - **services/**: API service functions for backend requests (`api.js`)
  - **App.jsx**: Main application component with routes
  - **index.css**: Global styles including Tailwind CSS
  - **main.jsx**: Entry point for the React application

### Server (Node.js Backend)

- **src/**: Backend application code
  - **config/**: Configuration for database (Supabase), environment variables.
  - **controllers/**: Request handlers for each entity (authors, books, loans, etc.).
  - **middleware/**: Authentication (JWT), authorization (roles), and error handling.
  - **models/**: Definitions for Supabase tables (Author, Book, Copy, Loan, User, etc.).
  - **routes/**: API route definitions for all entities.
  - **scripts/**: Database schema (`create_tables.sql`), seeding (`seedDatabase.js`), and utility scripts.
  - **services/**: Business logic (though much of this might be in controllers or directly using Supabase client).
  - **utils/**: Utility functions (e.g., validation).
  - **app.js**: Main server entry point.

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- Supabase account and a new project created.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd crud-app
    ```

2.  **Set up the Server**:
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory by copying `.env.example` (if it exists) or by creating a new one. Populate it with your Supabase project URL, anon key, service role key (if needed for admin tasks in scripts), and JWT secret:
    ```env
    PORT=3000
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    # SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key (for admin scripts)
    JWT_SECRET=your_strong_jwt_secret
    NODE_ENV=development
    CORS_ORIGIN=http://localhost:5173 # Or your client's URL
    ```
    Initialize your Supabase database by running the SQL script found in `server/src/scripts/create_tables.sql` in your Supabase SQL editor.

3.  **Set up the Client**:
    ```bash
    cd ../client 
    npm install
    ```
    Ensure your client's `.env` file (or Vite environment variables in `vite.config.js` or directly in code) points to the correct backend API URL. For example, create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:3000/api 
    ```
    (Note: The default in `client/src/services/api.js` is `http://localhost:3000/api`)


### Running the Application

1.  **Start the Server**:
    ```bash
    cd server
    npm run dev 
    ```
    The server will typically run on `http://localhost:3000`.

2.  **(Optional) Seed the Database**:
    If you have a seeding script (`server/src/scripts/seedDatabase.js`), run it to populate your database with initial data. Ensure your `.env` file in the `server` directory has the `SUPABASE_SERVICE_ROLE_KEY` if the script requires admin privileges.
    ```bash
    cd server
    npm run seed 
    ```

3.  **Start the Client**:
    ```bash
    cd ../client
    npm run dev
    ```
    The client will typically run on `http://localhost:5173`.

### Accessing the Application

-   **Client (Frontend)**: `http://localhost:5173` (or the port Vite assigns)
-   **Server API**: `http://localhost:3000` (or the port you configured)

### Default Login Credentials

Check the `seedDatabase.js` script or user creation documentation for default admin/user credentials. Typically, an administrator account is created with a known username and password.
For example:
-   **Admin User**:
    -   Email: `admin@example.com`
    -   Password: `password123` (This is an example, check your seed script)

## API Endpoints

### Authentication
- POST /api/auth/login - Login with email and password
- POST /api/auth/register - Register a new user
- GET /api/auth/logout - Logout (clears token)
- GET /api/auth/me - Get current user profile

### Authors
- GET /api/authors - Get all authors
- GET /api/authors/:id - Get author by ID
- POST /api/authors - Create a new author
- POST /api/authors/:id - Update an author
- POST /api/authors/:id/delete - Delete an author
- POST /api/authors/toggle-state/:id - Toggle author state

### Categories & Publishers
Similar endpoints are available for categories and publishers following the same pattern.

### Books
- GET /api/books - Get all books
- GET /api/books/:id - Get book by ID
- POST /api/books - Create a new book
- POST /api/books/:id - Update a book
- POST /api/books/:id/delete - Delete a book
- POST /api/books/toggle-state/:id - Toggle book state

### Book Copies
- GET /api/copies - Get all copies
- GET /api/copies/:id - Get copy by ID
- POST /api/copies - Create a new copy
- POST /api/copies/:id - Update a copy
- POST /api/copies/:id/delete - Delete a copy
- POST /api/copies/toggle-state/:id - Toggle copy state

### Loans
- GET /api/loans - Get all loans
- GET /api/loans/:id - Get loan by ID
- POST /api/loans - Create a new loan
- POST /api/loans/:id - Update a loan
- POST /api/loans/:id/delete - Delete a loan
- POST /api/loans/request - Request a loan
- POST /api/loans/approve/:id - Approve a loan
- POST /api/loans/reject/:id - Reject a loan
- POST /api/loans/return/:id - Return a loan

## Next Steps / Future Improvements

- Add form validation on the client side
- Implement role-based access control
- Create unit and integration tests
- Add pagination for large data sets
- Implement search and filtering
- Add image upload for authors and publishers
- Dark mode support

## License

This project is licensed under the MIT License.