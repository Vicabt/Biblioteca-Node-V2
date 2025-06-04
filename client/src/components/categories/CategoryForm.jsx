import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import useApi from '../../hooks/useApi';
import apiService from '../../services/api';

const CategoryForm = ({ category, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    state: 1,
  });
  const [errors, setErrors] = useState({});

  // API hooks
  const { 
    loading: creatingCategory, 
    execute: executeCreate 
  } = useApi(apiService.createCategory, {
    showSuccessToast: true,
    successMessage: 'Categoría creada correctamente'
  });

  const { 
    loading: updatingCategory, 
    execute: executeUpdate 
  } = useApi(apiService.updateCategory, {
    showSuccessToast: true,
    successMessage: 'Categoría actualizada correctamente'
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        state: category.state,
      });
    }
  }, [category]);

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
      if (isEdit && category) {
        await executeUpdate(category.id_category, formData);
      } else {
        await executeCreate(formData);
      }
      
      // Redirect to categories list
      navigate('/categories');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    navigate('/categories');
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
            isLoading={creatingCategory || updatingCategory}
          >
            {isEdit ? 'Actualizar Categoría' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;