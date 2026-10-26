import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { fetchBooks, createBook, updateBook, deleteBook } from '../services/api';
import Modal from '../components/Modal';

export const Books = ({ addToast, openAddTrigger, resetAddTrigger }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    quantity: 1,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation modal state
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Load books
  const loadBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await fetchBooks(params);
      if (res.success) {
        setBooks(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [selectedCategory]);

  // Handle external trigger from topbar / dashboard
  useEffect(() => {
    if (openAddTrigger) {
      handleOpenAddModal();
      resetAddTrigger();
    }
  }, [openAddTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBooks();
  };

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      category: '',
      isbn: '',
      quantity: 1,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      quantity: book.quantity,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.author.trim() || !formData.category.trim() || !formData.isbn.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setFormError('Quantity must be 0 or greater.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBook) {
        await updateBook(editingBook._id, {
          ...formData,
          quantity: qty,
        });
        addToast(`Book "${formData.title}" updated successfully!`, 'success');
      } else {
        await createBook({
          ...formData,
          quantity: qty,
        });
        addToast(`Book "${formData.title}" added to catalog!`, 'success');
      }
      setIsModalOpen(false);
      loadBooks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteBook(deleteCandidate._id);
      addToast(`Book "${deleteCandidate.title}" deleted.`, 'info');
      setDeleteCandidate(null);
      loadBooks();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Derive unique categories for filter
  const categories = ['All', ...new Set(books.map((b) => b.category).filter(Boolean))];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', marginBottom: 4 }}>Book Catalog</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage the library inventory, monitor stock copies, and add new volumes.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <button onClick={loadBooks} className="btn btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title & Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Total Copies</th>
              <th>Available</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  Loading catalog records...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <BookOpen size={28} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      No Books Found
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>
                      Try adjusting your search criteria or add your first book to the collection.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              books.map((book) => {
                const isAvailable = book.availableQuantity > 0;
                return (
                  <tr key={book._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.925rem' }}>
                        {book.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        by {book.author}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">{book.category}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {book.isbn}
                    </td>
                    <td style={{ fontWeight: 600 }}>{book.quantity}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        }}
                      >
                        {book.availableQuantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isAvailable ? 'badge-available' : 'badge-out-of-stock'}`}>
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEditModal(book)}
                          className="btn-icon"
                          title="Edit Book"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(book)}
                          className="btn-icon"
                          style={{ color: 'var(--accent-rose)' }}
                          title="Delete Book"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book Record' : 'Add New Book to Catalog'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Book'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
                fontSize: '0.85rem',
                marginBottom: 16,
              }}
            >
              {formError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Book Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Clean Code"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Author *</label>
            <input
              type="text"
              name="author"
              className="form-input"
              placeholder="e.g. Robert C. Martin"
              value={formData.author}
              onChange={handleFormChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                name="category"
                className="form-input"
                placeholder="e.g. Computer Science"
                value={formData.category}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">ISBN *</label>
              <input
                type="text"
                name="isbn"
                className="form-input"
                placeholder="e.g. 978-0132350884"
                value={formData.isbn}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Total Quantity Copies *</label>
            <input
              type="number"
              name="quantity"
              min="0"
              className="form-input"
              value={formData.quantity}
              onChange={handleFormChange}
              required
            />
            {editingBook && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Currently available: {editingBook.availableQuantity} | Currently issued: {editingBook.quantity - editingBook.availableQuantity}
              </p>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Deletion"
        footer={
          <>
            <button
              onClick={() => setDeleteCandidate(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteBook}
              className="btn btn-danger"
            >
              Delete Book
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Are you sure you want to delete <strong style={{ color: '#fff' }}>"{deleteCandidate?.title}"</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Books;
