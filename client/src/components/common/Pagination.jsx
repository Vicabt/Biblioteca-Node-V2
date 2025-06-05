import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generar array de páginas (puedes mejorar para muchos números)
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Page navigation example" className="flex justify-center mt-6">
      <ul className="inline-flex -space-x-px text-sm">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight border border-e-0 rounded-s-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-300'}`}
          >
            Previous
          </button>
        </li>
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`flex items-center justify-center px-3 h-8 leading-tight border ${currentPage === page ? 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center px-3 h-8 leading-tight border rounded-e-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-300'}`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 