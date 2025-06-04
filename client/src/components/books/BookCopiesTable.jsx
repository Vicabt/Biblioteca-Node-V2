import React from 'react';
import { HiPencil, HiTrash } from 'react-icons/hi';

const stateColors = {
  'disponible': 'bg-green-100 text-green-800',
  'prestado': 'bg-blue-100 text-blue-800',
  'dañado': 'bg-yellow-100 text-yellow-800',
  'perdido': 'bg-red-100 text-red-800',
};

const BookCopiesTable = ({ copies, onEdit, onDelete, showActions }) => { // Add showActions prop
  if (!Array.isArray(copies) || copies.length === 0) {
    return <div className="text-gray-500">No hay ejemplares registrados para este libro.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {copies.map(copy => (
            <tr key={copy.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{copy.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${stateColors[copy.state] || 'bg-gray-100 text-gray-800'}`}>
                  {copy.state.charAt(0).toUpperCase() + copy.state.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{copy.location || '-'}</td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    onClick={() => onEdit && onEdit(copy)}
                    title="Editar"
                    disabled={!onEdit} // Disable if onEdit is not provided
                  >
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                    onClick={() => onDelete && onDelete(copy)}
                    title="Eliminar"
                    disabled={!onDelete} // Disable if onDelete is not provided
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookCopiesTable;