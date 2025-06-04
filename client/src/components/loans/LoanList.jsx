import React from 'react';
import apiService from '../../services/api';
import { FaEye, FaEdit, FaTrash, FaCheck, FaUndo } from 'react-icons/fa'; // Import icons

const LoanCard = ({ loan, onEdit, onView, onDeleteSuccess, onApproveSuccess, onReturnSuccess }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) {
      try {
        await apiService.deleteLoan(loan.id);
        onDeleteSuccess(loan.id); // Pasar id
      } catch (error) {
        console.error('Error deleting loan:', error);
        alert('Error al eliminar el préstamo.');
      }
    }
  };

  const handleApprove = async () => {
    try {
      await apiService.approveLoan(loan.id);
      onApproveSuccess(loan.id); // Pasar id
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Error al aprobar el préstamo.');
    }
  };

  const handleReturn = async () => {
    try {
      await apiService.returnLoan(loan.id);
      onReturnSuccess(loan.id); // Pasar id
    } catch (error) {
      console.error('Error returning loan:', error);
      alert('Error al marcar como devuelto.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'solicitado':
        return 'bg-yellow-400 text-yellow-800';
      case 'aprobado':
        // Check if overdue
        if (new Date(loan.due_date) < new Date() && !loan.return_date) {
          return 'bg-red-500 text-white'; // Vencido
        }
        return 'bg-green-400 text-green-800'; // Activo
      case 'devuelto':
        return 'bg-blue-400 text-blue-800';
      case 'rechazado': // Assuming a 'rechazado' status might exist
        return 'bg-gray-400 text-gray-800';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    if (status === 'aprobado' && new Date(loan.due_date) < new Date() && !loan.return_date) {
      return 'Vencido';
    }
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusDisplay = getStatusText(loan.status);
  const statusColorClass = getStatusColor(loan.status);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 flex flex-col justify-between">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 truncate" title={loan.book?.title || 'Título no disponible'}>
            {loan.book?.title || 'Libro Desconocido'}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorClass}`}>
            {statusDisplay}
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p><span className="font-medium">Usuario:</span> {loan.user?.username || loan.user?.email || 'N/A'}</p>
          <p><span className="font-medium">Fecha Préstamo:</span> {new Date(loan.loan_date).toLocaleDateString()}</p>
          <p><span className="font-medium">Fecha Devolución:</span> {new Date(loan.due_date).toLocaleDateString()}</p>
          {loan.return_date && (
            <p><span className="font-medium">Fecha Retornado:</span> {new Date(loan.return_date).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-4 flex justify-end items-center space-x-2 border-t border-gray-200">
        {onView && (
          <button
            onClick={() => onView(loan)}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors duration-150"
            title="Ver Detalles"
          >
            <FaEye size={18} />
          </button>
        )}
        {(user?.role === 'admin' || user?.role === 'Administrador') && (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(loan)}
                className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition-colors duration-150"
                title="Editar Préstamo"
              >
                <FaEdit size={18} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-150"
              title="Eliminar Préstamo"
            >
              <FaTrash size={18} />
            </button>
            {loan.status === 'solicitado' && (
              <button
                onClick={handleApprove}
                className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors duration-150"
                title="Aprobar Préstamo"
              >
                <FaCheck size={18} />
              </button>
            )}
            {loan.status === 'aprobado' && !loan.return_date && (
                 <button
                    onClick={handleReturn}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors duration-150"
                    title="Marcar como Devuelto"
                >
                    <FaUndo size={18} />
                </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const LoanList = ({ loans = [], onEditLoan, onViewLoan, onDeleteSuccess, onApproveSuccess, onReturnSuccess }) => {
  // Eliminar lógica local de actualización de préstamos

  if (!loans || loans.length === 0) return <p>No hay préstamos registrados.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Listado de Préstamos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            onEdit={onEditLoan}
            onView={onViewLoan}
            onDeleteSuccess={onDeleteSuccess}
            onApproveSuccess={onApproveSuccess}
            onReturnSuccess={onReturnSuccess}
          />
        ))}
      </div>
    </div>
  );
};

export default LoanList;