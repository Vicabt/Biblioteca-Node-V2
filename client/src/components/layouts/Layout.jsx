import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  HiHome, 
  HiUsers, 
  HiBookOpen, 
  HiMenu,
  HiX,
  HiLogout,
  HiBookmark,
  HiClipboardList, // Añadir ícono para préstamos
  HiArchive // Icon for inactive books
} from 'react-icons/hi';
import { HiBuildingLibrary } from 'react-icons/hi2';

const Layout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  let navigationItems = [
    { name: 'Inicio', path: '/', icon: HiHome },
    { name: 'Libros', path: '/books', icon: HiBookmark },
  ];

  if (user?.role === 'Administrador') {
    navigationItems = [
      ...navigationItems,
      { name: 'Autores', path: '/authors', icon: HiUsers },
      { name: 'Categorías', path: '/categories', icon: HiBookOpen },
      { name: 'Editoriales', path: '/publishers', icon: HiBuildingLibrary },
      { name: 'Préstamos', path: '/loans', icon: HiClipboardList },
      { name: 'Usuarios', path: '/users-admin', icon: HiUsers },
      { name: 'Libros Inactivos', path: '/admin/inactive-books', icon: HiArchive },
    ];
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b">
            <h1 className="text-xl font-semibold text-primary-600">Biblioteca App</h1>
            <button 
              className="absolute right-4 top-4 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <HiX className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-grow px-4 py-6 overflow-y-auto">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Profile & Logout */}
          <div className="p-4 border-t">
            <Link to="/profile" className="block mb-4 hover:bg-slate-100 p-2 rounded-md">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-medium">
                    {user && (user.full_name || user.email) ? (user.full_name || user.email).split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-800">
                    {user && (user.full_name || user.email) ? (user.full_name || 'Usuario Desconocido') : 'Usuario Desconocido'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user && user.email ? user.email : 'email@example.com'}
                  </p>
                </div>
              </div>
            </Link>
            
            <button
              onClick={onLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <HiLogout className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <HiMenu className="w-6 h-6 text-slate-600" />
            </button>
            
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string, // This can be removed if not used elsewhere, or kept if other parts still expect it
    full_name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string, // Added role as it's used in navigationItems
    // Agrega aquí otras propiedades del usuario que esperas
  }),
  onLogout: PropTypes.func.isRequired
};

export default Layout;
