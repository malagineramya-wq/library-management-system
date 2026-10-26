import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  ArrowLeftRight,
  CheckCircle,
  Calendar,
  Clock,
  BookOpen,
  User,
} from 'lucide-react';
import { fetchTransactions, returnBook } from '../services/api';
import Modal from '../components/Modal';

export const Transactions = ({ addToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Return confirmation
  const [returnCandidate, setReturnCandidate] = useState(null);
  const [returning, setReturning] = useState(false);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await fetchTransactions(params);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [statusFilter]);

  const handleReturnConfirm = async () => {
    if (!returnCandidate) return;
    try {
      setReturning(true);
      const res = await returnBook(returnCandidate._id);
      if (res.success) {
        addToast(
          `Book "${returnCandidate.bookId?.title}" returned by ${returnCandidate.memberId?.name}!`,
          'success'
        );
        setReturnCandidate(null);
        loadTransactions();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setReturning(false);
    }
  };

  // Filtered by local search
  const filteredTransactions = transactions.filter((tx) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const titleMatch = tx.bookId?.title?.toLowerCase().includes(s);
    const authorMatch = tx.bookId?.author?.toLowerCase().includes(s);
    const memberMatch = tx.memberId?.name?.toLowerCase().includes(s);
    const emailMatch = tx.memberId?.email?.toLowerCase().includes(s);
    return titleMatch || authorMatch || memberMatch || emailMatch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', marginBottom: 4 }}>Circulation Records & Book Returns</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Monitor active loans, track issue and return timestamps, and process book check-ins.
          </p>
        </div>

        <button onClick={loadTransactions} className="btn btn-secondary">
          Refresh Records
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by book title or member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Issued', 'Returned'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`btn ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {tab === 'All' ? 'All Loans' : tab === 'Issued' ? 'Currently Issued' : 'Returned'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Book Details</th>
              <th>Member Details</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  Loading circulation transactions...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <ArrowLeftRight size={28} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      No Transactions Found
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>
                      {statusFilter === 'Issued'
                        ? 'There are currently no active book loans.'
                        : 'No records matching the filter criteria.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIssued = tx.status === 'Issued';
                return (
                  <tr key={tx._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.925rem' }}>
                        {tx.bookId?.title || 'Unknown / Deleted Book'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {tx.bookId?.author ? `by ${tx.bookId.author}` : 'N/A'} • {tx.bookId?.category}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        {tx.memberId?.name || 'Unknown / Deleted Member'}
                      </div>
                      <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                        {tx.memberId?.email || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{new Date(tx.issueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      {tx.returnDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
                          <CheckCircle size={14} />
                          <span>{new Date(tx.returnDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>— Active Loan —</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isIssued ? 'badge-issued' : 'badge-returned'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isIssued ? (
                        <button
                          onClick={() => setReturnCandidate(tx)}
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <RotateCcw size={14} />
                          <span>Return Book</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={!!returnCandidate}
        onClose={() => setReturnCandidate(null)}
        title="Confirm Book Return"
        footer={
          <>
            <button
              onClick={() => setReturnCandidate(null)}
              className="btn btn-secondary"
              disabled={returning}
            >
              Cancel
            </button>
            <button
              onClick={handleReturnConfirm}
              className="btn btn-success"
              disabled={returning}
            >
              {returning ? 'Processing...' : 'Confirm Return'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: 16 }}>
          Record the check-in and return of this volume back into library inventory:
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: 16,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong>Book:</strong> {returnCandidate?.bookId?.title}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Member:</strong> {returnCandidate?.memberId?.name} ({returnCandidate?.memberId?.email})
          </div>
          <div>
            <strong>Issued on:</strong> {returnCandidate?.issueDate && new Date(returnCandidate.issueDate).toLocaleDateString()}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: 14 }}>
          This will update the status to "Returned", set the return date to today, and increment available stock by 1.
        </p>
      </Modal>
    </div>
  );
};

export default Transactions;
