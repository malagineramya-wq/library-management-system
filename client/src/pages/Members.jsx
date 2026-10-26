import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { fetchMembers, createMember, updateMember, deleteMember } from '../services/api';
import Modal from '../components/Modal';

export const Members = ({ addToast, openAddTrigger, resetAddTrigger }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete candidate
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await fetchMembers(params);
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (openAddTrigger) {
      handleOpenAddModal();
      resetAddTrigger();
    }
  }, [openAddTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMembers();
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Please fill in all member fields.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingMember) {
        await updateMember(editingMember._id, formData);
        addToast(`Member "${formData.name}" updated successfully!`, 'success');
      } else {
        await createMember(formData);
        addToast(`Member "${formData.name}" registered successfully!`, 'success');
      }
      setIsModalOpen(false);
      loadMembers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteMember(deleteCandidate._id);
      addToast(`Member "${deleteCandidate.name}" removed.`, 'info');
      setDeleteCandidate(null);
      loadMembers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', marginBottom: 4 }}>Member Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Register and manage library patrons eligible for book loans.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search members by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <button onClick={loadMembers} className="btn btn-secondary">
          Refresh List
        </button>
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Contact Email</th>
              <th>Phone</th>
              <th>Membership Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  Loading member directory...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Users size={28} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      No Members Found
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>
                      Register members to start issuing books from your catalog.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#a5b4fc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {member._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <span>{member.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span>{new Date(member.membershipDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="btn-icon"
                        title="Edit Member"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(member)}
                        className="btn-icon"
                        style={{ color: 'var(--accent-rose)' }}
                        title="Delete Member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Member Information' : 'Register New Member'}
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
              {submitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Register Member'}
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
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. john.doe@example.com"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={handleFormChange}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Member Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Member Deletion"
        footer={
          <>
            <button
              onClick={() => setDeleteCandidate(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMember}
              className="btn btn-danger"
            >
              Delete Member
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Are you sure you want to delete member <strong style={{ color: '#fff' }}>"{deleteCandidate?.name}"</strong>?
          Ensure that this member has returned all issued books.
        </p>
      </Modal>
    </div>
  );
};

export default Members;
