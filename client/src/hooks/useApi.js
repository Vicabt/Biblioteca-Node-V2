import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing API calls with loading and error states
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Additional options
 * @param {boolean} options.showSuccessToast - Whether to show a success toast
 * @param {boolean} options.showErrorToast - Whether to show an error toast
 * @param {string} options.successMessage - Custom success message
 * @returns {Object} - { data, loading, error, execute }
 */
const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operación completada con éxito',
  } = options;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ha ocurrido un error';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, showSuccessToast, showErrorToast, successMessage]);

  return { data, loading, error, execute };
};

export default useApi;