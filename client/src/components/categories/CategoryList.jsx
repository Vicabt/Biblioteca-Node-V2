import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiPencil, 
  HiTrash, 
  HiX,
  HiCheck,
  HiPlus,
} from 'react-icons/hi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import useApi from '../../hooks/useApi';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    loading: loadingCategories,
    error: categoriesError,
    execute: fetchCategories
  } = useApi(apiService.getCategories);
  
  const {
    loading: loadingDelete,
    execute: executeDelete
  } = useApi(apiService.deleteCategory, {
    showSuccessToast: true,
    successMessage: 'Categoría eliminada correctamente'
  });
  
  const {
    loading: loadingToggle,
    execute: executeToggle
  } = useApi(apiService.toggleCategoryState, {
    showSuccessToast: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const result = await fetchCategories();
      setCategories(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleState = async (id) => {
    try {
      await executeToggle(id);
      // Actualizar la lista después de cambiar el estado
      loadCategories();
    } catch (err) {
      console.error('Error toggling category state:', err);
    }
  };

  const openDeleteModal = (category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    
    try {
      await executeDelete(deleteModal.category.id);
      // Actualizar la lista después de eliminar
      loadCategories();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error cargando categorías: {categoriesError}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Categorías</h2>
        <Link to="/categories/new">
          <Button variant="primary">
            <HiPlus className="w-5 h-5 mr-2" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {categories.length === 0 ? (
                <tr key="no-categories">
                  <td colSpan="3" className="px-6 py-4 text-center text-slate-500">
                    No hay categorías para mostrar
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id ? `category-${category.id}` : `category-temp-${category.name}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.state === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.state === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {category.id && (
                        <Link to={`/categories/${category.id}/edit`} className="text-primary-600 hover:text-primary-900 inline-flex items-center p-1" title="Editar">
                          <HiPencil className="w-5 h-5" />
                        </Link>
                      )}
                      
                      <button
                        title={category.state === 1 ? 'Desactivar' : 'Activar'}
                        className={`${category.state === 1 ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} inline-flex items-center p-1`}
                        onClick={() => handleToggleState(category.id)}
                        disabled={loadingToggle}
                      >
                        {category.state === 1 ? <HiX className="w-5 h-5" /> : <HiCheck className="w-5 h-5" />}
                      </button>
                      
                      <button 
                        title="Eliminar"
                        className="text-red-600 hover:text-red-900 inline-flex items-center p-1"
                        onClick={() => openDeleteModal(category)}
                        disabled={loadingDelete} // Added disabled state for consistency
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirmar eliminación"
        description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        footerContent={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loadingDelete}>
              Eliminar
            </Button>
          </div>
        }
      >
        <div className="mt-3">
          {deleteModal.category ? (
            <p className="text-slate-700">
              Categoría: <span className="font-medium">{deleteModal.category.name}</span>
            </p>
          ) : (
            <p className="text-slate-700">Seleccione una categoría para eliminar</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;