import React, { useState, useEffect } from 'react';
import {
  BookmarkPlus,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { fetchBooks, fetchMembers, issueBook } from '../services/api';

export const IssueBook = ({ addToast, setActiveTab }) => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDropdownData = async () => {
    try {
      setLoadingData(true);
      const [booksRes, membersRes] = await Promise.all([
        fetchBooks(),
        fetchMembers(),
      ]);
      if (booksRes.success) setBooks(booksRes.data);
      if (membersRes.success) setMembers(membersRes.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDropdownData();
  }, []);

  const selectedBook = books.find((b) => b._id === selectedBookId);
  const selectedMember = members.find((m) => m._id === selectedMemberId);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedBookId || !selectedMemberId) {
      setErrorMessage('Please select both a book and a member.');
      return;
    }

    if (selectedBook && selectedBook.availableQuantity <= 0) {
      setErrorMessage(`Cannot issue "${selectedBook.title}". All copies are currently checked out.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await issueBook({
        bookId: selectedBookId,
        memberId: selectedMemberId,
      });

      if (res.success) {
        addToast(`Successfully issued "${selectedBook.title}" to ${selectedMember.name}!`, 'success');
        setIssueSuccess(res.data);
        // Refresh available books count
        loadDropdownData();
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setIssueSuccess(null);
    setSelectedBookId('');
    setSelectedMemberId('');
    setErrorMessage('');
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.45rem', marginBottom: 4 }}>Issue Book to Member</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Select a title from available stock and assign the loan to an active library member.
        </p>
      </div>

      {issueSuccess ? (
        <div
          className="glass-card"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.4)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)',
            textAlign: 'center',
            padding: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--grad-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#fff',
            }}
          >
            <CheckCircle size={32} />
          </div>

          <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: '#34d399' }}>
            Book Loan Issued Successfully!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 24 }}>
            Transaction record created for <strong>{issueSuccess.bookId?.title}</strong> to member{' '}
            <strong>{issueSuccess.memberId?.name}</strong>.
          </p>

          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 32,
              textAlign: 'left',
              gap: 24,
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issue Date</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {new Date(issueSuccess.issueDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
              <span className="badge badge-issued">{issueSuccess.status}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              Issue Another Book
            </button>
            <button onClick={() => setActiveTab('transactions')} className="btn btn-primary">
              View Transactions List <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
                fontSize: '0.875rem',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleIssueSubmit}>
            {/* Step 1: Select Book */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} color="var(--accent-primary)" />
                <span>1. Select Book from Catalog *</span>
              </label>

              <select
                className="form-select"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                disabled={loadingData}
                required
              >
                <option value="">-- Choose a book to issue --</option>
                {books.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                    disabled={b.availableQuantity <= 0}
                  >
                    {b.title} — by {b.author} ({b.availableQuantity} of {b.quantity} available)
                    {b.availableQuantity <= 0 ? ' [OUT OF STOCK]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Book detail preview card if chosen */}
            {selectedBook && (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedBook.title}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Author: {selectedBook.author} • Category: {selectedBook.category} • ISBN: {selectedBook.isbn}
                  </div>
                </div>
                <div>
                  <span
                    className={`badge ${selectedBook.availableQuantity > 0 ? 'badge-available' : 'badge-out-of-stock'}`}
                  >
                    {selectedBook.availableQuantity > 0
                      ? `${selectedBook.availableQuantity} In Stock`
                      : 'Out of Stock'}
                  </span>
                </div>
              </div>
            )}

            {/* Step 2: Select Member */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} color="var(--accent-cyan)" />
                <span>2. Select Registered Member *</span>
              </label>

              <select
                className="form-select"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                disabled={loadingData}
                required
              >
                <option value="">-- Choose member --</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.email} - {m.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Member preview card */}
            {selectedMember && (
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: 20,
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#fff' }}>{selectedMember.name}</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Email: {selectedMember.email} • Phone: {selectedMember.phone}
                </div>
              </div>
            )}

            {/* Issue summary */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 20,
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Loan Date: Today ({new Date().toLocaleDateString()})
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  submitting ||
                  !selectedBookId ||
                  !selectedMemberId ||
                  (selectedBook && selectedBook.availableQuantity <= 0)
                }
              >
                <BookmarkPlus size={16} />
                <span>{submitting ? 'Issuing...' : 'Confirm Book Loan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default IssueBook;
