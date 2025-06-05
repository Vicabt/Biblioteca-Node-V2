import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import Button from '../components/common/Button';
import toast from 'react-hot-toast'; // Import toast
import Pagination from '../components/common/Pagination';

const InactiveBooksPage = ({ user }) => {
  const [inactiveBooks, setInactiveBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const INACTIVE_BOOKS_PER_PAGE = 10;

  const fetchInactiveBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getInactiveBooks();
      setInactiveBooks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los libros inactivos.');
      setInactiveBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'Administrador') {
      fetchInactiveBooks();
    }
  }, [fetchInactiveBooks, user]);

  const handleReactivateBook = async (bookId) => {
    try {
      await apiService.toggleBookState(bookId);
      toast.success('Libro reactivado con éxito!'); // Add success toast
      // Refresh the list after reactivating
      fetchInactiveBooks(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reactivar el libro.');
      toast.error(err.response?.data?.message || 'Error al reactivar el libro.'); // Add error toast
    }
  };

  if (user?.role !== 'Administrador') {
    return <p className="text-red-500">Acceso denegado. Esta página es solo para administradores.</p>;
  }

  if (loading) {
    return <p>Cargando libros inactivos...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const paginatedBooks = inactiveBooks.slice((currentPage - 1) * INACTIVE_BOOKS_PER_PAGE, currentPage * INACTIVE_BOOKS_PER_PAGE);
  const totalPages = Math.ceil(inactiveBooks.length / INACTIVE_BOOKS_PER_PAGE);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Libros Inactivos</h1>
      {inactiveBooks.length === 0 ? (
        <p>No hay libros inactivos en este momento.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Título</th>
                <th className="py-2 px-4 border-b text-left">Autor</th>
                <th className="py-2 px-4 border-b text-left">ISBN</th>
                <th className="py-2 px-4 border-b text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{book.title}</td>
                  <td className="py-2 px-4 border-b">{book.author?.name || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{book.isbn}</td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => handleReactivateBook(book.id)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Reactivar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default InactiveBooksPage;
