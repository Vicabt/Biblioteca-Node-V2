import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    document_number: '',
    phone: '',
    training: '',
    ficha_number: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profileData = await apiService.getUserProfile();
        setFormData({
          email: profileData.email || '',
          full_name: profileData.full_name || '',
          document_number: profileData.document_number || '',
          phone: profileData.phone || '',
          training: profileData.training || '',
          ficha_number: profileData.ficha_number || '',
          password: '',
          confirmPassword: ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
        toast.error(error.response?.data?.message || 'Error al cargar el perfil del usuario.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido.';
    }
    if (!formData.full_name.trim()) newErrors.full_name = 'El nombre completo es requerido.';
    if (!formData.document_number.trim()) newErrors.document_number = 'El número de documento es requerido.';
    // Add other validations as needed for phone, training, ficha_number (e.g., format, length)

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const dataToUpdate = {
        email: formData.email,
        full_name: formData.full_name,
        document_number: formData.document_number,
        phone: formData.phone || null, // Send null if empty to clear
        training: formData.training || null,
        ficha_number: formData.ficha_number || null,
      };
      if (formData.password) {
        dataToUpdate.password = formData.password;
      }

      const response = await apiService.updateUserProfile(dataToUpdate);
      toast.success(response.message || 'Perfil actualizado correctamente.');
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // Ensure response.user has the updated fields to merge into localStorage
      localStorage.setItem('user', JSON.stringify({ 
        ...storedUser, 
        ...response.user // Assuming backend returns the full updated user object
      }));
      
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil.';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
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
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Mi Perfil</h1>
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre Completo"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={errors.full_name}
            required
          />
          <Input
            label="Número de Documento"
            id="document_number"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            error={errors.document_number}
            required
          />
          <Input
            label="Correo Electrónico"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Teléfono (Opcional)"
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <Input
            label="Formación (Opcional)"
            id="training"
            name="training"
            value={formData.training}
            onChange={handleChange}
            error={errors.training}
          />
          <Input
            label="Número de Ficha (Opcional)"
            id="ficha_number"
            name="ficha_number"
            value={formData.ficha_number}
            onChange={handleChange}
            error={errors.ficha_number}
          />
          <p className="text-sm text-slate-600 mt-4 mb-2">Cambiar Contraseña (opcional):</p>
          <Input
            label="Nueva Contraseña"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Dejar en blanco para no cambiar"
          />
          <Input
            label="Confirmar Nueva Contraseña"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={!formData.password} 
          />
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => navigate(-1)} // Volver a la página anterior
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              isLoading={saving}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;