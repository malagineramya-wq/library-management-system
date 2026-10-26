import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookmarkPlus,
  ArrowLeftRight,
  Library,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books Catalog', icon: BookOpen },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'issue', label: 'Issue Book', icon: BookmarkPlus },
    { id: 'transactions', label: 'Transactions & Returns', icon: ArrowLeftRight },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Library size={24} />
        </div>
        <div>
          <div className="brand-title">Athena LMS</div>
          <div className="brand-subtitle">MERN Stack Edition</div>
        </div>
      </div>

      <nav className="nav-menu" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status-badge">
          <div className="status-dot"></div>
          <span>MongoDB & Express API Connected</span>
        </div>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
          Academic Project • InspireLeap
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
