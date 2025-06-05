import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import AuthorList from '../components/authors/AuthorList';
import AuthorForm from '../components/authors/AuthorForm';
import Button from '../components/common/Button';
import useApi from '../hooks/useApi';
import apiService from '../services/api';
import Pagination from '../components/common/Pagination';

// Component for editing an author
const EditAuthor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { execute: fetchAuthor } = useApi(apiService.getAuthor);
  
  useEffect(() => {
    const loadAuthor = async () => {
      if (!id || id === 'undefined') {
        setError('ID de autor no válido');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAuthor(id);
        setAuthor(data);
      } catch (err) {
        setError(err.message || 'Error al cargar el autor');
      } finally {
        setLoading(false);
      }
    };
    
    loadAuthor();
  }, [id, fetchAuthor]);
  
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
          onClick={() => navigate('/authors')}
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
          onClick={() => navigate('/authors')}
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Editar Autor</h1>
      </div>
      
      {author && (
        <AuthorForm 
          author={author} 
          isEdit={true}
        />
      )}
    </div>
  );
};

// Component for creating a new author
const NewAuthor = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          className="mr-4"
          onClick={() => navigate('/authors')}
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo Autor</h1>
      </div>
      
      <AuthorForm />
    </div>
  );
};

// Main Authors Page that manages routing
const AuthorsPage = () => {
  const AUTHORS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [authors, setAuthors] = useState([]);

  const { execute: fetchAuthors } = useApi(apiService.getAuthors);

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const data = await fetchAuthors();
        setAuthors(data);
      } catch (err) {
        console.error('Error al cargar la lista de autores:', err);
      }
    };
    
    loadAuthors();
  }, [fetchAuthors]);

  // Calcular autores a mostrar según la página
  const paginatedAuthors = authors.slice((currentPage - 1) * AUTHORS_PER_PAGE, currentPage * AUTHORS_PER_PAGE);
  const totalPages = Math.ceil(authors.length / AUTHORS_PER_PAGE);

  return (
    <Routes>
      <Route index element={
        <div>
          <div className="mb-6 flex items-center">
            <Button 
              variant="outline" 
              className="mr-4"
              onClick={() => navigate('/authors')}
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Lista de Autores</h1>
          </div>
          {Array.isArray(authors) && paginatedAuthors.length > 0 ? (
            <AuthorList authors={paginatedAuthors} />
          ) : (
            <p>No se encontraron autores.</p>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      } />
      <Route path="new" element={<NewAuthor />} />
      <Route path=":id/edit" element={<EditAuthor />} />
    </Routes>
  );
};

export default AuthorsPage;