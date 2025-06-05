import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import CategoryList from '../components/categories/CategoryList';
import CategoryForm from '../components/categories/CategoryForm';
import Button from '../components/common/Button';
import useApi from '../hooks/useApi';
import apiService from '../services/api';
import Pagination from '../components/common/Pagination';

// Component for editing a category
const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { execute: fetchCategory } = useApi(apiService.getCategory);
  
  useEffect(() => {
    const loadCategory = async () => {
      if (!id || id === 'undefined') {
        setError('ID de categoría no válido');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCategory(id);
        setCategory(data);
      } catch (err) {
        setError(err.message || 'Error al cargar la categoría');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategory();
  }, [id, fetchCategory]);

  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/categories')}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          className="mr-4"
          onClick={() => navigate('/categories')}
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Editar Categoría</h1>
      </div>
      
      {category && (
        <CategoryForm 
          category={category} 
          isEdit={true}
        />
      )}
    </div>
  );
};
// Component for creating a new category
const NewCategory = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          className="mr-4"
          onClick={() => navigate('/categories')}
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Nueva Categoría</h1>
      </div>
      
      <CategoryForm />
    </div>
  );
};

// Main Categories Page that manages routing
const CategoriesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const CATEGORIES_PER_PAGE = 10;
  const [categories, setCategories] = useState([]);

  const { execute: fetchCategories } = useApi(apiService.getCategories);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar las categorías:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [fetchCategories]);

  // Calcular categorías a mostrar según la página
  const paginatedCategories = categories.slice((currentPage - 1) * CATEGORIES_PER_PAGE, currentPage * CATEGORIES_PER_PAGE);
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

  return (
    <Routes>
      <Route index element={
        <CategoryList categories={paginatedCategories} onChange={loadCategories} />
      } />
      <Route path="new" element={<NewCategory />} />
      <Route path=":id/edit" element={<EditCategory />} />
    </Routes>
  );
};

export default CategoriesPage;