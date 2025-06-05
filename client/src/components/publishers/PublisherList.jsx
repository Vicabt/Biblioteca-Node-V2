import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiPencil, HiTrash, HiPlus, HiX, HiCheck } from 'react-icons/hi';
import Button from '../common/Button';
import useApi from '../../hooks/useApi';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const PublisherList = ({ publishers = [] }) => {
    const navigate = useNavigate();
    
    const { loading: loadingDelete, execute: executeDelete } = useApi(
        apiService.deletePublisher,
        {
            showSuccessToast: true,
            successMessage: 'Editorial eliminada correctamente',
        }
    );
    
    const { loading: loadingToggle, execute: executeToggle } = useApi(
        apiService.togglePublisherState,
        {
            showSuccessToast: true,
            successMessage: 'Estado de la editorial actualizado',
        }
    );
    
    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro que desea eliminar esta editorial?')) {
            try {
                await executeDelete(id);
            } catch (error) {
                // Error is handled by useApi hook
            }
        }
    };
    
    const handleToggleState = async (id) => {
        try {
            const updatedPublisher = await executeToggle(id);
        } catch (error) {
            // Error is handled by useApi hook
        }
    };
    
    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Editoriales</h1>
                <Button 
                    onClick={() => navigate('/publishers/new')}
                    className="bg-primary-600 hover:bg-primary-700"
                >
                    <HiPlus className="w-5 h-5 mr-2" />
                    Nueva Editorial
                </Button>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {publishers.map(publisher => (
                            <tr key={publisher.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{publisher.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        publisher.state ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {publisher.state ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2 justify-end">
                                        <Link 
                                            to={`/publishers/${publisher.id}/edit`} 
                                            className="text-primary-600 hover:text-primary-900 inline-flex items-center p-1"
                                            title="Editar"
                                        >
                                            <HiPencil className="w-5 h-5" />
                                        </Link>
                                        <button
                                            title={publisher.state ? 'Desactivar' : 'Activar'}
                                            className={`${publisher.state ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} inline-flex items-center p-1`}
                                            onClick={() => handleToggleState(publisher.id)}
                                            disabled={loadingToggle}
                                        >
                                            {publisher.state ? <HiX className="w-5 h-5" /> : <HiCheck className="w-5 h-5" />}
                                        </button>
                                        <button 
                                            title="Eliminar"
                                            className="text-red-600 hover:text-red-900 inline-flex items-center p-1"
                                            onClick={() => handleDelete(publisher.id)}
                                            disabled={loadingDelete}
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PublisherList;