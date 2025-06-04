import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import useApi from '../../hooks/useApi';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';

const BookForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author_id: '',
    category_id: '',
    publisher_id: '',
    publication_year: '',
    description: '',
    state: 1,
    cover_url: '' // Add cover_url to initial state
  });
  const [errors, setErrors] = useState({});
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true

  // API hooks for create and update operations
  const { 
    loading: creatingBook, 
    execute: executeCreate 
  } = useApi(apiService.createBook, {
    showSuccessToast: true,
    successMessage: 'Libro creado correctamente'
  });

  const { 
    loading: updatingBook, 
    execute: executeUpdate 
  } = useApi(apiService.updateBook, {
    showSuccessToast: true,
    successMessage: 'Libro actualizado correctamente'
  });

  // API hooks for fetching select options data
  const { execute: fetchAuthors, loading: loadingAuthors } = useApi(apiService.getAuthors);
  const { execute: fetchCategories, loading: loadingCategories } = useApi(apiService.getCategories);
  const { execute: fetchPublishers, loading: loadingPublishers } = useApi(apiService.getPublishers);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load data for select options
        const loadSelectOptions = async () => {
          try {
            setLoading(true);
            const [authorsData, categoriesData, publishersData] = await Promise.all([
              fetchAuthors(),
              fetchCategories(),
              fetchPublishers()
            ]);
            setAuthors(Array.isArray(authorsData) ? authorsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            setPublishers(Array.isArray(publishersData) ? publishersData : []);
          } catch (error) {
            console.error('Error loading select options:', error);
            toast.error('Error al cargar los datos necesarios para el formulario.');
            if (isEdit) navigate('/books'); // Redirect if editing and book data fails
          } finally {
            setLoading(false);
          }
        };

        await loadSelectOptions();

        // If in edit mode, load book data
        if (isEdit && id) {
          const bookData = await apiService.getBookById(id);
          setFormData({
            title: bookData.title || '',
            isbn: bookData.isbn || '',
            author_id: bookData.author_id || '',
            category_id: bookData.category_id || '',
            publisher_id: bookData.publisher_id || '',
            publication_year: bookData.publication_year || '',
            description: bookData.description || '',
            state: bookData.state ?? 1,
            cover_url: bookData.cover_url || '' // Add cover_url when editing
          });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Error al cargar los datos necesarios para el formulario.');
        if (isEdit) navigate('/books'); // Redirect if editing and book data fails
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEdit, navigate, fetchAuthors, fetchCategories, fetchPublishers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.isbn.trim()) {
      newErrors.isbn = 'El ISBN es requerido';
    }
    
    if (!formData.author_id) {
      newErrors.author_id = 'El autor es requerido';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'La categoría es requerida';
    }
    
    if (!formData.publisher_id) {
      newErrors.publisher_id = 'La editorial es requerida';
    }
    
    if (!formData.publication_year) {
      newErrors.publication_year = 'El año de publicación es requerido';
    } else if (!/^\d{4}$/.test(formData.publication_year)) {
      newErrors.publication_year = 'Año inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEdit && id) {
        await executeUpdate(id, formData);
      } else {
        await executeCreate(formData);
      }
      
      navigate('/books');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEdit ? 'Editar Libro' : 'Nuevo Libro'}
        </h1>
        
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Título"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              error={errors.title}
            />
            
            <Input
              label="ISBN"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              error={errors.isbn}
              placeholder="Ej: 978-8491051884"
            />
            
            <Select
              label="Autor"
              id="author_id"
              name="author_id"
              value={formData.author_id}
              onChange={handleChange}
              required
              error={errors.author_id}
            >
              <option value="">Seleccione un autor</option>
              {authors.map(author => (
                <option key={author.id ? `author-${author.id}` : `author-temp-${author.name}`} value={author.id}>
                  {author.name}
                </option>
              ))}
            </Select>
            
            <Select
              label="Categoría"
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              error={errors.category_id}
            >
              <option value="">Seleccione una categoría</option>
              {categories.map(category => (
                <option key={category.id ? `category-${category.id}` : `category-temp-${category.name}`} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            
            <Select
              label="Editorial"
              id="publisher_id"
              name="publisher_id"
              value={formData.publisher_id}
              onChange={handleChange}
              required
              error={errors.publisher_id}
            >
              <option value="">Seleccione una editorial</option>
              {publishers.map(publisher => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </Select>
            
            <Input
              label="Año de publicación"
              id="publication_year"
              name="publication_year"
              type="number"
              value={formData.publication_year}
              onChange={handleChange}
              required
              error={errors.publication_year}
              min="1000"
              max={new Date().getFullYear()}
            />
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            
            <Input
              label="URL de la Portada (Opcional)"
              id="cover_url"
              name="cover_url"
              type="url"
              value={formData.cover_url}
              onChange={handleChange}
              error={errors.cover_url}
              placeholder="Ej: https://ejemplo.com/portada.jpg"
            />
            
            <div className="flex items-center space-x-2">
              <input
                id="state"
                name="state"
                type="checkbox"
                checked={formData.state === 1}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="state" className="text-sm font-medium text-gray-700">
                Activo
              </label>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/books')}
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                variant="primary"
                isLoading={creatingBook || updatingBook}
              >
                {isEdit ? 'Actualizar Libro' : 'Crear Libro'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookForm;