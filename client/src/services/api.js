import axios from 'axios';

// Create Axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Here you could implement token refresh logic if needed
        // For now, just redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  },


  // User Profile
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },


  // Activities
  getActivities: async () => {
    const response = await api.get('/activities');
    return response.data.data;
  },


  // Users (Admin)
  resetUserPassword: async (id, password) => {
    const response = await api.put(`/users/reset-password/${id}`, { password });
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData); // Assuming endpoint is /users for admin
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData); // Assuming endpoint is /users/:id for admin
    return response.data;
  },

  toggleUserActive: async (id, active) => {
    const response = await api.patch(`/users/${id}/active`, { active });
    return response.data;
  },

  
  // Authors
  getAuthors: async () => {
    const response = await api.get('/authors');
    return response.data.data;
  },

  getAuthor: async (id) => {
    const response = await api.get(`/authors/${id}`);
    return response.data.data;
  },

  createAuthor: async (authorData) => {
    const response = await api.post('/authors', authorData);
    return response.data;
  },

  updateAuthor: async (id, authorData) => {
    const response = await api.put(`/authors/${id}`, authorData); // Changed to PUT
    return response.data;
  },

  deleteAuthor: async (id) => {
    const response = await api.delete(`/authors/${id}`); // Changed to DELETE and removed /delete path segment
    return response.data;
  },

  toggleAuthorState: async (id) => {
    const response = await api.patch(`/authors/${id}/state`, {}); // Changed to PATCH, assuming it toggles state
    return response.data;
  },

  
  // Categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData); // Changed to PUT
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`); // Changed to DELETE and removed /delete path segment
    return response.data;
  },

  toggleCategoryState: async (id) => {
    const response = await api.patch(`/categories/${id}/state`, {}); // Changed to PATCH, assuming it toggles state
    return response.data;
  },

  
  // Publishers
  getPublishers: async () => {
    const response = await api.get('/publishers');
    return response.data.data;
  },

  getPublisher: async (id) => {
    const response = await api.get(`/publishers/${id}`);
    return response.data.data;
  },

  createPublisher: async (publisherData) => {
    const response = await api.post('/publishers', publisherData);
    return response.data;
  },

  updatePublisher: async (id, publisherData) => {
    const response = await api.put(`/publishers/${id}`, publisherData); // Changed to PUT
    return response.data;
  },
  
  deletePublisher: async (id) => {
    const response = await api.delete(`/publishers/${id}`); // Changed to DELETE and removed /delete path segment
    return response.data;
  },
  
  togglePublisherState: async (id) => {
    const response = await api.patch(`/publishers/${id}/state`, {}); // Changed to PATCH, assuming it toggles state
    return response.data;
  },

  // Books
  getBooks: async () => {
    const response = await api.get('/books');
    return response.data.data;
  },

  resetUserPassword: async (id, password) => {
    const response = await api.put(`/users/reset-password/${id}`, { password });
    return response.data;
  },
  
  getInactiveBooks: async () => {
    const response = await api.get('/books/status/inactive');
    return response.data.data;
  },

  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data.data;
  },
  
  createBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },
  
  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData); // Changed to PUT
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`); // Changed to DELETE and removed /delete path segment
    return response.data;
  },
  
  toggleBookState: async (id) => {
    const response = await api.patch(`/books/${id}/state`, {}); // Changed to PATCH, assuming it toggles state
    return response.data;
  },

  // Loans
  getLoans: async () => {
    const response = await api.get('/loans');
    return response.data.data;
  },

  getLoan: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  createLoan: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },

  requestLoan: async (loanData) => {
    const response = await api.post('/loans/request', loanData);
    return response.data;
  },

  updateLoan: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData); // Using PUT for updates
    return response.data;
  },

  deleteLoan: async (id) => {
    const response = await api.delete(`/loans/${id}`); // Using DELETE for deletions
    return response.data;
  },

  approveLoan: async (id) => {
    const response = await api.put(`/loans/${id}/status`, { status: 'aprobado' });
    return response.data;
  },

  returnLoan: async (id) => {
    const response = await api.put(`/loans/${id}/return`, { status: 'devuelto' });
    return response.data;
  },

  // Obtener ejemplares de un libro
  getCopiesByBook: async (bookId) => {
    const response = await api.get(`/books/${bookId}/copies`);
    return response.data.data;
  },

  // Crear ejemplar
  createCopy: async (copyData) => {
    const response = await api.post(`/books/${copyData.book_id}/copies`, copyData);
    return response.data;
  },

  // Actualizar ejemplar
  updateCopy: async (id, copyData) => {
    const response = await api.put(`/copies/${id}`, copyData); // Changed to PUT
    return response.data;
  },

  // Eliminar ejemplar
  deleteCopy: async (id) => {
    const response = await api.delete(`/copies/${id}`); // Changed to DELETE
    return response.data;
  },

  // Verificar estado de paz y salvo de un usuario
  checkUserStatus: async (userId) => {
    const response = await api.get(`/loans/check-user-status/${userId}`);
    return response.data.data;
  },

  // Obtener préstamos de un usuario por su ID
  getLoansByUser: async (userId) => {
    const response = await api.get(`/loans?user_id=${userId}`);
    return response.data.data;
  }
};

export default apiService;