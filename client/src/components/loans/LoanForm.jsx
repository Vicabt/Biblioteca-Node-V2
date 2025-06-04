import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import apiService from '../../services/api';

const estadosDisponiblesParaFormulario = [
  'solicitado',
  'aprobado',
  'rechazado',
  'devuelto',
  'atrasado',
  'cancelado'
];

const LoanForm = ({ loanToEdit, bookForLoanRequest, onFormSubmit, onCancel }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const [form, setForm] = useState({
    book_id: '',
    copy_id: '',
    document_number: '',
    loan_date: new Date().toISOString().slice(0,10),
    due_date: '',
    status: 'solicitado',
  });
  const [errors, setErrors] = useState({});
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [documentNumberError, setDocumentNumberError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsUserLoaded(true);
  }, []);

  const canEditStatus = !!loanToEdit && (currentUser?.role === 'Administrador' || currentUser?.role === 'Bibliotecario');

  useEffect(() => {
    if (!isUserLoaded) return;

    if (loanToEdit) {
      setForm({
        book_id: loanToEdit.book_id || '',
        copy_id: loanToEdit.copy_id || '',
        document_number: loanToEdit.user?.document_number || '',
        loan_date: loanToEdit.loan_date ? loanToEdit.loan_date.slice(0,10) : '',
        due_date: loanToEdit.due_date ? loanToEdit.due_date.slice(0,10) : '',
        status: loanToEdit.status || 'solicitado',
      });
      setDocumentNumberError(null);
    } else { // New loan
      setForm(prev => ({
        ...prev,
        book_id: bookForLoanRequest?.id || '',
        copy_id: '',
        document_number: prev.document_number || currentUser?.document_number || '',
        loan_date: new Date().toISOString().slice(0,10),
        due_date: '',
        status: 'solicitado',
      }));

      if (!currentUser) {
        setDocumentNumberError('Debe iniciar sesión para solicitar un préstamo.');
      } else if (!currentUser.document_number) {
        setDocumentNumberError('Número de documento no encontrado en su perfil. Por favor, complete su perfil o inicie sesión nuevamente.');
      } else {
        setDocumentNumberError(null);
      }
    }
  }, [loanToEdit, bookForLoanRequest, isUserLoaded]);

  useEffect(() => {
    if (!isUserLoaded) return;

    if (!loanToEdit && !bookForLoanRequest) {
      const loadBooks = async () => {
        setLoadingBooks(true);
        try {
          const data = await apiService.getBooks();
          setBooks(Array.isArray(data) ? data : []);
        } catch (error) {
          setBooks([]);
        } finally {
          setLoadingBooks(false);
        }
      };
      loadBooks();
    } else if (bookForLoanRequest && !loanToEdit) {
      setBooks(bookForLoanRequest ? [bookForLoanRequest] : []);
      setLoadingBooks(false);
    } else { // Editing
      setBooks(loanToEdit && loanToEdit.book ? [loanToEdit.book] : []); // Show current book if editing
      setLoadingBooks(false);
    }
  }, [loanToEdit, bookForLoanRequest, currentUser, isUserLoaded]);

  useEffect(() => {
    const fetchCopiesData = async () => {
      if (!form.book_id || !isUserLoaded) {
        setCopies([]);
        if (!form.book_id) setForm(prev => ({ ...prev, copy_id: ''})); // Clear copy_id if book_id is cleared
        return;
      }
      try {
        setLoadingCopies(true);
        if (!loanToEdit) { // For new loans, ensure copy_id is reset if book changes
             // This is handled when form.book_id changes if not loanToEdit
        }
        setCopies([]); 

        const allCopiesForBook = await apiService.getCopiesByBook(form.book_id);

        if (loanToEdit && loanToEdit.book_id === form.book_id) {
          setCopies(allCopiesForBook || []);
        } else {
          const availableCopies = allCopiesForBook.filter(copy => copy.state === 'disponible');
          setCopies(availableCopies || []);
          // If creating a new loan and only one copy is available, auto-select it.
          if (availableCopies.length === 1 && !loanToEdit && form.book_id) {
            setForm(prev => ({ ...prev, copy_id: availableCopies[0].id }));
          } else if (!loanToEdit) { // If multiple copies or no copies, ensure copy_id is clear unless one was just auto-selected
            // This check prevents clearing copy_id if it was just set by the auto-selection above
            if (!(availableCopies.length === 1 && form.book_id)) {
                 setForm(prev => ({ ...prev, copy_id: '' }));
            }
          }
        }
      } catch (err) {
        setCopies([]);
        setErrors(prev => ({ ...prev, copy_id: 'Error al cargar ejemplares' }));
      } finally {
        setLoadingCopies(false);
      }
    };
    if (form.book_id) { // Only fetch if there's a book_id
        fetchCopiesData();
    } else {
        setCopies([]); // Clear copies if no book is selected
        if (!loanToEdit) {
            setForm(prev => ({ ...prev, copy_id: ''}));
        }
    }
  }, [form.book_id, loanToEdit, isUserLoaded]);


  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => {
      const newState = { ...prev, [name]: value };
      // If book_id changes for a new loan, reset copy_id
      if (name === 'book_id' && !loanToEdit) {
        newState.copy_id = '';
      }
      return newState;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.book_id) newErrors.book_id = 'Libro es requerido.';
    if (!form.copy_id) newErrors.copy_id = 'Ejemplar es requerido.';
    
    if (!loanToEdit && documentNumberError) {
        newErrors.document_number = documentNumberError;
    } else if (!form.document_number && !loanToEdit) { // Check only for new loans if not pre-existing error
        newErrors.document_number = 'Número de documento es requerido.';
    } else if (loanToEdit && !form.document_number) { // For edit mode, it should be there
        newErrors.document_number = 'Número de documento del usuario del préstamo es requerido.';
    }

    if (!form.loan_date) newErrors.loan_date = 'Fecha de préstamo es requerida.';
    if (!form.due_date) newErrors.due_date = 'Fecha de devolución es requerida.';
    
    if (canEditStatus && !form.status) newErrors.status = 'Estado es requerido.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isUserLoaded) {
        setErrors({ general: "Verificando información del usuario..."});
        return;
    }
    if (!loanToEdit && documentNumberError) {
      setErrors(prev => ({ ...prev, document_number: documentNumberError, general: 'Por favor, corrija los errores.' }));
      return;
    }
    if (!validate()) {
      setErrors(prev => ({...prev, general: 'Por favor, corrija los errores.'}));
      return;
    }
    try {
      const loanData = {
        copy_id: form.copy_id,
        document_number: form.document_number, // This is now from localStorage for new, or loanToEdit for edits
        due_date: form.due_date,
        // loan_date is included for both new and edit, backend might override for new if needed
        loan_date: form.loan_date,
      };

      if (loanToEdit) {
        loanData.status = form.status; // Only send status if editing
        await apiService.updateLoan(loanToEdit.id, loanData);
      } else {
        // Para nueva solicitud de préstamo
        const result = await apiService.requestLoan(loanData);
        // Si la respuesta tiene status 201 y data.loan, consideramos éxito
        if (result && result.status === 201 && result.data && result.data.loan) {
          setErrors({}); // Limpia errores
        } else if (result && result.message) {
          setErrors({ general: result.message });
          return;
        }
      }
      onFormSubmit(form); 
    } catch (error) {
      setErrors({ general: error?.response?.data?.message || 'Error al procesar el préstamo' });
    }
  };

  if (!isUserLoaded && !loanToEdit) {
    return <p>Cargando formulario de préstamo...</p>; // Or a more sophisticated loader
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-2">{loanToEdit ? 'Editar Préstamo' : (bookForLoanRequest ? `Solicitar Préstamo para: ${bookForLoanRequest.title}` : 'Nuevo Préstamo')}</h3>
      
      <div>
        <label className="block font-medium">Libro</label>
        <select
          name="book_id"
          value={form.book_id}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
          disabled={loadingBooks || !!loanToEdit || (!!bookForLoanRequest && !loanToEdit)}
        >
          {(!bookForLoanRequest && !loanToEdit) && <option value="">Selecciona un libro</option>}
          {books.map(book => (
            <option key={book.id} value={book.id}>
              {book.title} {book.author?.name ? `- ${book.author.name}` : (book.author_name ? `- ${book.author_name}` : '')}
            </option>
          ))}
        </select>
        {errors.book_id && <span className="text-red-500 text-sm">{errors.book_id}</span>}
      </div>
      
      <div>
        <label className="block font-medium">Ejemplar (Copia)</label>
        <select
          name="copy_id"
          value={form.copy_id}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
          disabled={loadingCopies || !form.book_id || !!loanToEdit}
        >
          <option value="">Selecciona un ejemplar</option>
          {copies.length > 0 ? (
            copies.map(copy => (
              <option key={copy.id} value={copy.id}>
                {copy.code} - {copy.location || 'N/A'} ({copy.state})
              </option>
            ))
          ) : (
            <option value="" disabled>{loadingCopies ? 'Cargando...' : (form.book_id ? 'No hay ejemplares disponibles' : 'Selecciona un libro primero')}</option>
          )}
        </select>
        {errors.copy_id && <span className="text-red-500 text-sm">{errors.copy_id}</span>}
      </div>

      <div>
        <label className="block font-medium">Número de Documento del Solicitante</label>
        <input
          type="text"
          name="document_number"
          value={form.document_number}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
          placeholder="Número de documento (automático)"
        />
        {documentNumberError && <span className="text-red-500 text-sm">{documentNumberError}</span>}
        {errors.document_number && !documentNumberError && <span className="text-red-500 text-sm">{errors.document_number}</span>} 
      </div>
      <div>
        <label className="block font-medium">Fecha Préstamo</label>
        <input
          type="date"
          name="loan_date"
          value={form.loan_date}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
          readOnly={!!loanToEdit && !canEditStatus} // Admins can edit loan_date on existing loans
        />
        {errors.loan_date && <span className="text-red-500 text-sm">{errors.loan_date}</span>}
      </div>
      <div>
        <label className="block font-medium">Fecha Devolución (Estimada)</label>
        <input
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
        />
        {errors.due_date && <span className="text-red-500 text-sm">{errors.due_date}</span>}
      </div>
      {loanToEdit && ( // Only show status for existing loans, editable by authorized users
        <div>
          <label className="block font-medium">Estado</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
            disabled={!canEditStatus}
          >
            {estadosDisponiblesParaFormulario.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
          {errors.status && <span className="text-red-500 text-sm">{errors.status}</span>}
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-2">
        {errors.general && <span className="text-red-500 text-sm mr-auto">{errors.general}</span>}
        <Button type="button" onClick={onCancel} className="bg-gray-500 text-white hover:bg-gray-600">Cancelar</Button>
        <Button 
            type="submit" 
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={!isUserLoaded && !loanToEdit} // Disable submit if user not loaded for new loan
        >
            {loanToEdit ? 'Actualizar' : 'Solicitar Préstamo'}
        </Button>
      </div>
    </form>
  );
};

export default LoanForm;