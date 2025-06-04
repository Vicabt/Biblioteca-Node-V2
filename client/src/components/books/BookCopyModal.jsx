import React, { useState, useEffect } from 'react';

const stateOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'prestado', label: 'Prestado' },
  { value: 'dañado', label: 'Dañado' },
  { value: 'perdido', label: 'Perdido' },
];

const BookCopyModal = ({ open, onClose, onSubmit, initialData, isEdit = false }) => {
  const [form, setForm] = useState({ code: '', location: '', state: 'disponible' });

  useEffect(() => {
    if (open) {
      setForm({
        code: initialData?.code || '', // Use optional chaining and ensure default
        location: initialData?.location || '', // Use optional chaining and ensure default
        state: initialData?.state || 'disponible', // Use optional chaining and ensure default
      });
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Editar Ejemplar' : 'Agregar Ejemplar'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              className="block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              className="block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
              required
            >
              {stateOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEdit ? 'Guardar Cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookCopyModal;