import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  BookmarkCheck,
  RotateCcw,
  PlusCircle,
  UserPlus,
  BookmarkPlus,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { fetchDashboardStats } from '../services/api';

export const Dashboard = ({ setActiveTab, openAddBookModal, openAddMemberModal }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Loading Library Analytics...</div>
        <div style={{ fontSize: '0.85rem' }}>Fetching real-time records from MongoDB...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', borderColor: 'rgba(244, 63, 94, 0.4)' }}>
        <h3 style={{ color: 'var(--accent-rose)', marginBottom: 8 }}>Connection Note</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
          Could not connect to backend server ({error}). Make sure the backend is running at http://localhost:5000.
        </p>
        <button onClick={loadStats} className="btn btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Welcome Banner */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} color="#a5b4fc" />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Library Management System
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Welcome to Athena Central Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Real-time status of catalog inventory, active memberships, and circulation records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={openAddBookModal} className="btn btn-secondary">
            <PlusCircle size={16} />
            <span>Add Book</span>
          </button>
          <button onClick={openAddMemberModal} className="btn btn-secondary">
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
          <button onClick={() => setActiveTab('issue')} className="btn btn-primary">
            <BookmarkPlus size={16} />
            <span>Issue Book</span>
          </button>
        </div>
      </div>

      {/* 4 Core Statistics (PDF Section 4.1 Requirement) */}
      <div className="stats-grid">
        <div className="stat-card indigo">
          <div>
            <div className="stat-label">Total Books (Titles)</div>
            <div className="stat-value">{stats?.totalBooks || 0}</div>
            <div className="stat-meta">
              {stats?.totalCopies || 0} Total physical copies
            </div>
          </div>
          <div className="stat-icon-wrapper indigo">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="stat-card cyan">
          <div>
            <div className="stat-label">Total Members</div>
            <div className="stat-value">{stats?.totalMembers || 0}</div>
            <div className="stat-meta">Registered library patrons</div>
          </div>
          <div className="stat-icon-wrapper cyan">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card amber">
          <div>
            <div className="stat-label">Issued Books</div>
            <div className="stat-value">{stats?.issuedBooks || 0}</div>
            <div className="stat-meta">Currently in circulation</div>
          </div>
          <div className="stat-icon-wrapper amber">
            <BookmarkCheck size={24} />
          </div>
        </div>

        <div className="stat-card emerald">
          <div>
            <div className="stat-label">Returned Books</div>
            <div className="stat-value">{stats?.returnedBooks || 0}</div>
            <div className="stat-meta">Successfully returned to shelves</div>
          </div>
          <div className="stat-icon-wrapper emerald">
            <RotateCcw size={24} />
          </div>
        </div>
      </div>

      {/* Grid: Categories and Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Category Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem' }}>Catalog by Category</h3>
            <button onClick={() => setActiveTab('books')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {stats?.categoryBreakdown?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No book categories recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats?.categoryBreakdown?.map((cat) => {
                const percentage = stats.totalBooks > 0 ? Math.round((cat.count / stats.totalBooks) * 100) : 0;
                return (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{cat.category}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.count} title{cat.count !== 1 ? 's' : ''} ({percentage}%)</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'var(--grad-primary)',
                          borderRadius: 999,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Circulation Transactions */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Circulation Activity</h3>
            <button onClick={() => setActiveTab('transactions')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              All Records <ArrowRight size={14} />
            </button>
          </div>

          {stats?.recentTransactions?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No circulation transactions recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats?.recentTransactions?.map((tx) => (
                <div
                  key={tx._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.bookId?.title || 'Unknown Book'}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      Member: {tx.memberId?.name || 'N/A'} • {new Date(tx.issueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <span className={`badge ${tx.status === 'Issued' ? 'badge-issued' : 'badge-returned'}`}>
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
