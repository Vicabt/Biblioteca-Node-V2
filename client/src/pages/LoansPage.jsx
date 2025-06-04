import React, { useState, useEffect, useCallback } from 'react';
import LoanList from '../components/loans/LoanList';
import LoanForm from '../components/loans/LoanForm';
import apiService from '../services/api';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const LoansPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [viewingLoan, setViewingLoan] = useState(null);
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getLoans();
      setLoans(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar los préstamos');
      setLoans([]);
      console.error('Error fetching loans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    let currentLoans = [...loans];
    // Sort by loan_date in descending order (most recent first)
    currentLoans.sort((a, b) => new Date(b.loan_date) - new Date(a.loan_date));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight

    const filterLogic = (loan) => {
      const dueDate = new Date(loan.due_date);
      dueDate.setHours(0, 0, 0, 0); // Normalize due_date to midnight

      switch (activeTab) {
        case 'Todos':
          return true;
        case 'Activos':
          // Active: approved, not yet returned, and due date is today or in the future.
          return loan.status === 'aprobado' && !loan.return_date && dueDate >= today;
        case 'Vencidos':
          // Overdue: approved, not yet returned, and due date is in the past.
          return loan.status === 'aprobado' && !loan.return_date && dueDate < today;
        case 'Devueltos':
          return loan.status === 'devuelto';
        case 'Solicitados':
          return loan.status === 'solicitado';
        default:
          return true; // Should not happen with defined tabs
      }
    };
    setFilteredLoans(currentLoans.filter(filterLogic));
  }, [activeTab, loans]);

  const handleOpenModal = (loan = null) => {
    setEditingLoan(loan);
    setViewingLoan(null); // Clear viewing state
    setIsModalOpen(true);
  };

  const handleViewLoan = (loan) => {
    setViewingLoan(loan);
    setEditingLoan(null); // Clear editing state
    setIsModalOpen(true); // Open modal to view details
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLoan(null);
    setViewingLoan(null);
  };

  const handleSaveLoan = async (loanData) => {
    try {
      if (editingLoan) {
        await apiService.updateLoan(editingLoan.id, loanData);
      } else {
        await apiService.createLoan(loanData);
      }
      fetchLoans(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error("Error saving loan:", error);
      // Handle error display to user
    }
  };

  const tabs = ['Todos', 'Solicitados', 'Activos', 'Vencidos', 'Devueltos'];
  const commonTabStyle = "py-2 px-4 cursor-pointer transition-colors duration-300 ease-in-out";
  const activeTabStyle = "border-b-2 border-blue-500 text-blue-500";
  const inactiveTabStyle = "text-gray-500 hover:text-blue-500";


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Préstamos</h1>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 hover:bg-blue-700 text-white"
        >
          Solicitar Préstamo
        </Button>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${commonTabStyle} ${activeTab === tab ? activeTabStyle : inactiveTabStyle}`}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-8">Cargando préstamos...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">Error: {error}</p>
      ) : (
        <LoanList
          loans={filteredLoans}
          onEditLoan={user?.role === 'admin' ? handleOpenModal : null}
          onViewLoan={handleViewLoan} // Pass view handler to LoanList
          onDeleteSuccess={fetchLoans} // To refresh list after delete
          onApproveSuccess={fetchLoans} // To refresh list after approval
          onReturnSuccess={fetchLoans} // To refresh list after return
        />
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {viewingLoan ? (
            // Simplified view for now, can be expanded
            <div>
              <h2 className="text-xl font-semibold mb-4">Detalles del Préstamo</h2>
              <p><strong>Libro:</strong> {viewingLoan.book?.title || viewingLoan.book_id}</p>
              <p><strong>Usuario:</strong> {viewingLoan.user?.username || viewingLoan.user?.email || (viewingLoan.user_id ? `ID: ${viewingLoan.user_id}` : (viewingLoan.user?.id ? `ID: ${viewingLoan.user.id}` : 'Usuario Desconocido'))}</p>
              <p><strong>Fecha Préstamo:</strong> {new Date(viewingLoan.loan_date).toLocaleDateString()}</p>
              <p><strong>Fecha Devolución:</strong> {new Date(viewingLoan.due_date).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> {viewingLoan.status}</p>
              {viewingLoan.return_date && <p><strong>Fecha Retornado:</strong> {new Date(viewingLoan.return_date).toLocaleDateString()}</p>}
            </div>
          ) : (
            // LoanForm for creating/editing
            <LoanForm
              loanToEdit={editingLoan}
              onFormSubmit={handleSaveLoan}
              onCancel={handleCloseModal}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default LoansPage;