import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import AuthorsPage from './pages/AuthorsPage';
import CategoriesPage from './pages/CategoriesPage';
import PublishersPage from './pages/PublishersPage';
import BooksPage from './pages/BooksPage';
import LoansPage from './pages/LoansPage'; // Importar LoansPage
import UserProfilePage from './pages/UserProfilePage'; // Importar UserProfilePage
import LoginPage from './pages/auth/LoginPage'; // Asegúrate que la ruta sea correcta
import NotFoundPage from './pages/NotFoundPage';
import BookDetailPage from './pages/BookDetailPage';
import UsersAdminPage from './pages/UsersAdminPage';
import InactiveBooksPage from './pages/InactiveBooksPage'; // Import InactiveBooksPage
import ReportsPage from './pages/ReportsPage';

// Components
import BookForm from './components/books/BookForm';

// Layouts
import Layout from './components/layouts/Layout';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Limpiar localStorage si hay datos corruptos
    const cleanInvalidLocalStorage = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // Si el user está corrupto, limpiar todo
      if (storedUser === 'undefined' || storedUser === 'null' || 
          (storedUser && storedUser.startsWith('{') && !token)) {
        localStorage.clear();
        return false;
      }
      
      return token && storedUser;
    };
    
    // Verificar si hay un token y datos de usuario al cargar la aplicación
    if (cleanInvalidLocalStorage()) {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log('App.jsx handleLoginSuccess - userData:', userData); // Debug log
    setIsAuthenticated(true);
    setUser(userData);
    // localStorage.setItem('user', JSON.stringify(userData)); // Esto ya se hace en LoginPage
  };

  const logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    // Considera navegar a /login aquí para una experiencia de usuario más clara
    // navigate('/login'); // Si usas esto, necesitarás `useNavigate` en App.jsx
  };

  const router = createBrowserRouter([
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
    },
    {
      path: '/',
      element: isAuthenticated ? <Layout user={user} onLogout={logoutHandler} /> : <Navigate to="/login" />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'authors/*', element: user?.role === 'Administrador' ? <AuthorsPage /> : <Navigate to="/" /> },
        { path: 'categories/*', element: user?.role === 'Administrador' ? <CategoriesPage /> : <Navigate to="/" /> },
        { path: 'publishers/*', element: user?.role === 'Administrador' ? <PublishersPage /> : <Navigate to="/" /> },
        { path: 'books/*', element: <BooksPage user={user} /> }, // Pass user to BooksPage
        { path: 'books/new', element: user?.role === 'Administrador' ? <BookForm /> : <Navigate to="/books" /> },
        { path: 'books/edit/:id', element: user?.role === 'Administrador' ? <BookForm isEdit /> : <Navigate to="/books" /> },
        { path: 'books/:id', element: <BookDetailPage user={user} /> }, // Pass user to BookDetailPage
        { path: 'loans', element: user?.role === 'Administrador' ? <LoansPage /> : <Navigate to="/" /> },
        { path: 'profile', element: <UserProfilePage /> },
        { path: 'users-admin', element: user?.role === 'Administrador' ? <UsersAdminPage /> : <Navigate to="/" /> },
        { path: 'admin/inactive-books', element: user?.role === 'Administrador' ? <InactiveBooksPage user={user} /> : <Navigate to="/" /> }, // Pass user prop
        { path: 'reportes', element: user?.role === 'Administrador' ? <ReportsPage /> : <Navigate to="/" /> },
      ]
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <RouterProvider router={router} />
    </>
  );
};

export default App;