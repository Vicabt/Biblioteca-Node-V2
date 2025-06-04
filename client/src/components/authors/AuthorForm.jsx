import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import useApi from '../../hooks/useApi';
import apiService from '../../services/api';

const AuthorForm = ({ author, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    state: 1,
  });
  const [errors, setErrors] = useState({});

  // API hooks
  const { 
    loading: creatingAuthor, 
    execute: executeCreate 
  } = useApi(apiService.createAuthor, {
    showSuccessToast: true,
    successMessage: 'Autor creado correctamente'
  });

  const { 
    loading: updatingAuthor, 
    execute: executeUpdate 
  } = useApi(apiService.updateAuthor, {
    showSuccessToast: true,
    successMessage: 'Autor actualizado correctamente'
  });

  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name,
        state: author.state,
      });
    }
  }, [author]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
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
      if (isEdit && author) {
        await executeUpdate(author.id_author, formData);
      } else {
        await executeCreate(formData);
      }
      
      // Redirect to authors list
      navigate('/authors');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    navigate('/authors');
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nombre"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          error={errors.name}
        />
        
        <div className="flex items-center space-x-2">
          <input
            id="state"
            name="state"
            type="checkbox"
            checked={formData.state === 1}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="state" className="text-sm font-medium text-slate-700">
            Activo
          </label>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          
          <Button 
            type="submit" 
            variant="primary"
            isLoading={creatingAuthor || updatingAuthor}
          >
            {isEdit ? 'Actualizar Autor' : 'Crear Autor'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthorForm;