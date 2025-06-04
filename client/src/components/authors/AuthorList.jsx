import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiPencil, 
  HiTrash, 
  HiEye,
  HiX,
  HiCheck,
  HiPlus,
} from 'react-icons/hi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import useApi from '../../hooks/useApi';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, author: null });
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    loading: loadingAuthors,
    error: authorsError,
    execute: fetchAuthors
  } = useApi(apiService.getAuthors);
  
  const {
    loading: loadingDelete,
    execute: executeDelete
  } = useApi(apiService.deleteAuthor, {
    showSuccessToast: true,
    successMessage: 'Autor eliminado correctamente'
  });
  
  const {
    loading: loadingToggle,
    execute: executeToggle
  } = useApi(apiService.toggleAuthorState, {
    showSuccessToast: true
  });

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setIsLoading(true);
      const result = await fetchAuthors();
      setAuthors(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error loading authors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleState = async (id) => {
    try {
      await executeToggle(id);
      // Actualizar la lista después de cambiar el estado
      loadAuthors();
    } catch (err) {
      console.error('Error toggling author state:', err);
    }
  };

  const openDeleteModal = (author) => {
    setDeleteModal({ isOpen: true, author });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, author: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.author) return;
    
    try {
      await executeDelete(deleteModal.author.id);
      // Actualizar la lista después de eliminar
      loadAuthors();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting author:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (authorsError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error cargando autores: {authorsError}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Autores</h2>
        <Link to="/authors/new">
          <Button variant="primary">
            <HiPlus className="w-5 h-5 mr-2" />
            Nuevo Autor
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
              {authors.length === 0 ? (
                <tr key="no-authors">
                  <td colSpan="3" className="px-6 py-4 text-center text-slate-500">
                    No hay autores para mostrar
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr key={author.id ? `author-${author.id}` : `author-temp-${author.name}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {author.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        author.state === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {author.state === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {author.id && (
                        <Link to={`/authors/${author.id}/edit`} className="text-primary-600 hover:text-primary-900 inline-flex items-center">
                          <HiPencil className="w-5 h-5" />
                        </Link>
                      )}
                      
                      <button
                        className={`${author.state === 1 ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} inline-flex items-center`}
                        onClick={() => handleToggleState(author.id)}
                        disabled={loadingToggle}
                      >
                        {author.state === 1 ? <HiX className="w-5 h-5" /> : <HiCheck className="w-5 h-5" />}
                      </button>
                      
                      <button 
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                        onClick={() => openDeleteModal(author)}
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
        description="¿Estás seguro de que deseas eliminar este autor? Esta acción no se puede deshacer."
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
          {deleteModal.author ? (
            <p className="text-slate-700">
              Autor: <span className="font-medium">{deleteModal.author.name}</span>
            </p>
          ) : (
            <p className="text-slate-700">Seleccione un autor para eliminar</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AuthorList;