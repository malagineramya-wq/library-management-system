import axios from 'axios';

// Base API configuration (relative /api for seamless unified domain & deployment)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

// --- Books API ---
export const fetchBooks = (params = {}) => api.get('/books', { params });
export const fetchBookById = (id) => api.get(`/books/${id}`);
export const createBook = (bookData) => api.post('/books', bookData);
export const updateBook = (id, bookData) => api.put(`/books/${id}`, bookData);
export const deleteBook = (id) => api.delete(`/books/${id}`);

// --- Members API ---
export const fetchMembers = (params = {}) => api.get('/members', { params });
export const fetchMemberById = (id) => api.get(`/members/${id}`);
export const createMember = (memberData) => api.post('/members', memberData);
export const updateMember = (id, memberData) => api.put(`/members/${id}`, memberData);
export const deleteMember = (id) => api.delete(`/members/${id}`);

// --- Transactions API ---
export const fetchTransactions = (params = {}) => api.get('/transactions', { params });
export const issueBook = (issueData) => api.post('/transactions/issue', issueData);
export const returnBook = (transactionId) => api.put(`/transactions/${transactionId}/return`);

// --- Dashboard API ---
export const fetchDashboardStats = () => api.get('/dashboard/stats');

export default api;
