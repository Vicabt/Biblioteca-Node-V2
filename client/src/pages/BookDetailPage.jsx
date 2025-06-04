import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import BookCopiesTable from '../components/books/BookCopiesTable';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import BookCopyModal from '../components/books/BookCopyModal';
import Modal from '../components/common/Modal'; // Import Modal
import LoanForm from '../components/loans/LoanForm'; // Import LoanForm
import BookCoverImage from '../components/books/BookCoverImage'; // Import BookCoverImage

const BookDetailPage = ({ user }) => { // Add user prop
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [editCopy, setEditCopy] = useState(null);
  const [copyModalLoading, setCopyModalLoading] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false); // State for loan modal

  // Get user from localStorage to pre-fill document number for loan requests
  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchBook();
    fetchCopies();
  }, [id]);

  const fetchBook = async () => {
    try {
      const data = await apiService.getBookById(id);
      setBook(data);
    } catch (error) {
      toast.error('Error al cargar el libro');
    }
  };

  const fetchCopies = async () => {
    try {
      const data = await apiService.getCopiesByBook(id);
      setCopies(data);
    } catch (error) {
      toast.error('Error al cargar ejemplares');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLoanModal = () => {
    if (!loggedInUser || !loggedInUser.document_number) {
      toast.error('Debe completar su perfil (número de documento) para solicitar un préstamo.');
      return;
    }
    if (copies.filter(c => c.state === 'disponible').length === 0) {
      toast.error('No hay ejemplares disponibles para este libro.');
      return;
    }
    setLoanModalOpen(true);
  };

  const handleLoanFormSubmit = async (submittedLoanData) => {
    // The actual API call is now within LoanForm.jsx
    // This function is called on successful submission from LoanForm
    toast.success('Solicitud de préstamo procesada.');
    setLoanModalOpen(false);
    fetchCopies(); // Refresh copies list as one might now be 'solicitado' or unavailable
  };

  const handleAddCopy = () => {
    setEditCopy(null);
    setCopyModalOpen(true);
  };

  const handleEditCopy = (copy) => {
    setEditCopy(copy);
    setCopyModalOpen(true);
  };

  const handleDeleteCopy = async (copy) => {
    if (window.confirm('¿Seguro que deseas eliminar este ejemplar?')) {
      try {
        setCopyModalLoading(true);
        await apiService.deleteCopy(copy.id);
        toast.success('Ejemplar eliminado');
        fetchCopies();
      } catch (error) {
        toast.error('Error al eliminar ejemplar');
      } finally {
        setCopyModalLoading(false);
      }
    }
  };

  const handleCopyModalSubmit = async (form) => {
    setCopyModalLoading(true);
    try {
      if (editCopy) {
        await apiService.updateCopy(editCopy.id, form);
        toast.success('Ejemplar actualizado');
      } else {
        await apiService.createCopy({ ...form, book_id: id });
        toast.success('Ejemplar agregado');
      }
      setCopyModalOpen(false);
      fetchCopies();
    } catch (error) {
      toast.error('Error al guardar ejemplar');
    } finally {
      setCopyModalLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  if (!book) {
    return <div className="text-center text-red-600">Libro no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
        <Link to="/books">
          <Button variant="secondary">Volver a libros</Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">Autor:</span> {book.author?.name}</p>
            <p><span className="font-semibold">Categoría:</span> {book.category?.name}</p>
            <p><span className="font-semibold">Editorial:</span> {book.publisher?.name}</p>
            <p><span className="font-semibold">ISBN:</span> {book.isbn}</p>
            <p><span className="font-semibold">Año:</span> {book.publication_year}</p>
            <p><span className="font-semibold">Descripción:</span> {book.description}</p>
          </div>
          <div className="flex justify-center items-center">
            <BookCoverImage 
              coverUrlFromDb={book.cover_url} 
              isbn={book.isbn} 
              title={book.title} 
              altText={`Portada de ${book.title}`}
              className="max-h-64 rounded shadow" 
            />
          </div>
        </div>
      </div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ejemplares</h2>
          {user?.role === 'Administrador' && (
            <Button variant="primary" onClick={handleAddCopy}>Agregar ejemplar</Button>
          )}
        </div>
        <BookCopiesTable
          copies={copies}
          onEdit={user?.role === 'Administrador' ? handleEditCopy : undefined}
          onDelete={user?.role === 'Administrador' ? handleDeleteCopy : undefined}
          showActions={user?.role === 'Administrador'} // Pass showActions prop
        />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Solicitar préstamo</h2>
        {copies.filter(c => c.state === 'disponible').length > 0 ? (
          <Button variant="primary" onClick={handleOpenLoanModal}>
            Solicitar Préstamo de este Libro
          </Button>
        ) : (
          <p className="text-gray-500">No hay ejemplares disponibles para préstamo en este momento.</p>
        )}
      </div>

      {loanModalOpen && (
        <Modal isOpen={loanModalOpen} onClose={() => setLoanModalOpen(false)} title={`Solicitar Préstamo para: ${book.title}`}>
          <LoanForm 
            bookForLoanRequest={book} 
            onFormSubmit={handleLoanFormSubmit} 
            onCancel={() => setLoanModalOpen(false)} 
          />
        </Modal>
      )}

      {copyModalOpen && (
        <Modal isOpen={copyModalOpen} onClose={() => setCopyModalOpen(false)} title={editCopy ? 'Editar Ejemplar' : 'Agregar Nuevo Ejemplar'}>
          <BookCopyModal
            open={copyModalOpen}
            onClose={() => setCopyModalOpen(false)}
            onSubmit={handleCopyModalSubmit}
            initialData={editCopy}
            isEdit={!!editCopy}
            loading={copyModalLoading}
          />
        </Modal>
      )}
    </div>
  );
};

export default BookDetailPage;