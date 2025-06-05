import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi';
import Button from '../components/common/Button';
import useApi from '../hooks/useApi';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/common/Pagination';

const BooksPage = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, book: null });
  const [currentPage, setCurrentPage] = useState(1);

  const {
    loading: loadingBooks,
    error: booksError,
    execute: fetchBooks
  } = useApi(apiService.getBooks);

  const {
    loading: loadingDelete,
    execute: executeDelete
  } = useApi(apiService.deleteBook, {
    showSuccessToast: true,
    successMessage: 'Libro eliminado correctamente'
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Error al cargar los libros');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      try {
        await executeDelete(id);
        setBooks(books.filter(book => book.id !== id));
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const BOOKS_PER_PAGE = 10;
  const paginatedBooks = books.slice((currentPage - 1) * BOOKS_PER_PAGE, currentPage * BOOKS_PER_PAGE);
  const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (booksError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error cargando libros: {booksError}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Libros</h1>
        {user?.role === 'Administrador' && (
          <Link to="/books/new">
            <Button variant="primary">
              <HiPlus className="w-5 h-5 mr-2" />
              Nuevo Libro
            </Button>
          </Link>
        )}
      </div>

      {books.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">No hay libros registrados</p>
          {user?.role === 'Administrador' && (
            <Link to="/books/new">
              <Button variant="primary">
                <HiPlus className="w-5 h-5 mr-2" />
                Crear un libro
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Editorial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBooks.map(book => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.category?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.publisher?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.isbn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/books/${book.id}`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      Ver
                    </Link>
                    {user?.role === 'Administrador' && (
                      <>
                        <Link
                          to={`/books/edit/${book.id}`}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <HiPencil className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                          disabled={loadingDelete}
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </>
                    )}
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

export default BooksPage;