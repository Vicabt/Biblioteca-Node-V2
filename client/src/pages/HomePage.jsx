import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiUsers, HiBookOpen, HiChartBar, HiBookmark } from 'react-icons/hi';
import { HiBuildingLibrary } from 'react-icons/hi2';
import useApi from '../hooks/useApi';
import apiService from '../services/api';

const HomePage = () => {
  const [stats, setStats] = useState({
    authors: 0,
    categories: 0,
    publishers: 0,
    books: 0,
    activeLoans: 0,
    total: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API hooks
  const { execute: fetchAuthors } = useApi(apiService.getAuthors);
  const { execute: fetchCategories } = useApi(apiService.getCategories);
  const { execute: fetchPublishers } = useApi(apiService.getPublishers);
  const { execute: fetchBooks } = useApi(apiService.getBooks);
  const { execute: fetchLoans } = useApi(apiService.getLoans);
  const { execute: fetchActivitiesData, loading: loadingActivities, error: activitiesError } = useApi(apiService.getActivities);

  useEffect(() => {
    const fetchStatsAndActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const [authors, categories, publishers, books, loans] = await Promise.all([
          fetchAuthors(),
          fetchCategories(),
          fetchPublishers(),
          fetchBooks(),
          fetchLoans()
        ]);
        const activeLoans = Array.isArray(loans)
          ? loans.filter(l => l.status === 'aprobado' && !l.return_date).length
          : 0;
        setStats({
          authors: authors?.length || 0,
          categories: categories?.length || 0,
          publishers: publishers?.length || 0,
          books: books?.length || 0,
          activeLoans,
          total: (authors?.length || 0) + (categories?.length || 0) + (publishers?.length || 0) + (books?.length || 0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Error al cargar las estadísticas');
        setStats({
          authors: 0,
          categories: 0,
          publishers: 0,
          books: 0,
          activeLoans: 0,
          total: 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStatsAndActivities();
  }, [fetchAuthors, fetchCategories, fetchPublishers, fetchBooks, fetchLoans, fetchActivitiesData]);

  // Separate useEffect for fetching activities to handle its own loading/error state if needed
  // or combine if logic is simple enough. For now, let's assume fetchActivitiesData updates 'activities' state via useApi.
  useEffect(() => {
    const loadActivities = async () => {
      const data = await fetchActivitiesData();
      setActivities(Array.isArray(data) ? data : []);
    };
    loadActivities();
  }, [fetchActivitiesData]);

  // Consolidate loading and error states if desired, or handle them separately.
  // For simplicity, we'll use the main 'loading' and 'error' for now.
  // If activitiesError is present, you might want to display a specific message.

  // Original fetchStats renamed to fetchStatsAndActivities and modified to include activities
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [authors, categories, publishers, books, activitiesData] = await Promise.all([
          fetchAuthors(),
          fetchCategories(),
          fetchPublishers(),
          fetchBooks(),
          fetchActivitiesData() // Fetch activities here as well
        ]);

        setStats({
          authors: authors?.length || 0,
          categories: categories?.length || 0,
          publishers: publishers?.length || 0,
          books: books?.length || 0,
          total: (authors?.length || 0) + (categories?.length || 0) + (publishers?.length || 0) + (books?.length || 0)
        });
        setActivities(activitiesData || []); // Set activities from Promise.all result

      } catch (error) {
        console.error('Error fetching stats or activities:', error);
        setError('Error al cargar datos del panel');
        setStats({
          authors: 0,
          categories: 0,
          publishers: 0,
          books: 0,
          total: 0
        });
        setActivities([]); // Clear activities on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed individual fetch functions from deps, useApi handles its own deps.

  const statsArray = [
    { id: 1, name: 'Autores', value: stats.authors, icon: HiUsers, color: 'bg-blue-500', path: '/authors' },
    { id: 2, name: 'Categorías', value: stats.categories, icon: HiBookOpen, color: 'bg-purple-500', path: '/categories' },
    { id: 3, name: 'Editoriales', value: stats.publishers, icon: HiBuildingLibrary, color: 'bg-green-500', path: '/publishers' },
    { id: 4, name: 'Libros', value: stats.books, icon: HiBookmark, color: 'bg-yellow-500', path: '/books' },
    { id: 5, name: 'Préstamos Activos', value: stats.activeLoans, icon: HiBookmark, color: 'bg-cyan-500', path: '/loans' },
    { id: 6, name: 'Total registros', value: stats.total, icon: HiChartBar, color: 'bg-amber-500', path: '#' }
  ];

  function formateaTiempo(fecha) {
    const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
    if (diff < 60) return `Hace ${diff} segundos`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
        <p className="mt-2 text-slate-600">Bienvenido a la aplicación de gestión de biblioteca</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsArray.map((stat) => (
          <Link 
            key={stat.id} 
            to={stat.path}
            className="card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-slate-600">{stat.name}</h2>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link 
            to="/authors/new" 
            className="card bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white p-6 hover:shadow-lg transition-all duration-300"
          >
            <HiUsers className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Crear Autor</h3>
            <p className="text-primary-100">Añadir un nuevo autor al sistema</p>
          </Link>
          
          <Link 
            to="/categories/new" 
            className="card bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 hover:shadow-lg transition-all duration-300"
          >
            <HiBookOpen className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Crear Categoría</h3>
            <p className="text-purple-100">Añadir una nueva categoría al sistema</p>
          </Link>
          
          <Link 
            to="/publishers/new" 
            className="card bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 hover:shadow-lg transition-all duration-300"
          >
            <HiBuildingLibrary className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Crear Editorial</h3>
            <p className="text-green-100">Añadir una nueva editorial al sistema</p>
          </Link>
          <Link 
            to="/books/new" 
            className="card bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-6 hover:shadow-lg transition-all duration-300"
          >
            <HiBookmark className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Crear Libro</h3>
            <p className="text-yellow-100">Añadir un nuevo libro al sistema</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity (Dynamic) */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Actividad Reciente</h2>
        <div className="card overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {!Array.isArray(activities) || activities.length === 0 ? (
              <li className="p-4 text-center text-slate-500">No hay actividad reciente</li>
            ) : (
              activities.map((activity) => (
                <li key={activity.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {activity.entity.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                      <p className="text-sm text-slate-500">{formateaTiempo(activity.created_at)}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;