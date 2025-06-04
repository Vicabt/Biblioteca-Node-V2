import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import useApi from '../../hooks/useApi';
import apiService from '../../services/api';

const PublisherForm = ({ publisher, isEdit = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        state: 1,
    });
    
    const { loading: loadingSubmit, execute: executeSubmit } = useApi(
        isEdit ? apiService.updatePublisher : apiService.createPublisher,
        {
            showSuccessToast: true,
            successMessage: isEdit 
                ? 'Editorial actualizada correctamente' 
                : 'Editorial creada correctamente',
        }
    );
    
    useEffect(() => {
        if (publisher) {
            setFormData({
                name: publisher.name || '',
                state: publisher.state ?? 1,
            });
        }
    }, [publisher]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isEdit && publisher) {
                await executeSubmit(publisher.id, formData);
            } else {
                await executeSubmit(formData);
            }
            navigate('/publishers');
        } catch (error) {
            // Error is handled by useApi hook
        }
    };
    
    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="name" // Añadir id para el input
                    label="Nombre"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nombre de la editorial"
                />
                
                <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="state"
                            checked={formData.state === 1}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-primary-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Activo</span>
                    </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate('/publishers')}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit"
                        disabled={loadingSubmit}
                        className="bg-primary-600 hover:bg-primary-700"
                    >
                        {isEdit ? 'Actualizar' : 'Crear'} Editorial
                        {loadingSubmit && (
                            <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PublisherForm;