import React from 'react';
import { PlusCircle, UserPlus, BookmarkPlus, Calendar } from 'lucide-react';

export const Navbar = ({
  activeTab,
  openAddBookModal,
  openAddMemberModal,
  setActiveTab,
}) => {
  const titles = {
    dashboard: 'Dashboard Overview',
    books: 'Book Catalog & Inventory',
    members: 'Member Management',
    issue: 'Issue Books',
    transactions: 'Circulation & Return Records',
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="top-navbar">
      <div className="top-navbar-title">
        <h1 className="page-title">{titles[activeTab] || 'Library System'}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Calendar size={14} />
          <span>{currentDate}</span>
        </div>

        {activeTab === 'books' && (
          <button onClick={openAddBookModal} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>
            <PlusCircle size={15} />
            <span>Add Book</span>
          </button>
        )}

        {activeTab === 'members' && (
          <button onClick={openAddMemberModal} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>
            <UserPlus size={15} />
            <span>Add Member</span>
          </button>
        )}

        {activeTab !== 'issue' && (
          <button
            onClick={() => setActiveTab('issue')}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.825rem' }}
          >
            <BookmarkPlus size={15} />
            <span>Issue Loan</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
