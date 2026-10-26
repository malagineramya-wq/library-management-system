import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import IssueBook from './pages/IssueBook';
import Transactions from './pages/Transactions';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [openBookTrigger, setOpenBookTrigger] = useState(false);
  const [openMemberTrigger, setOpenMemberTrigger] = useState(false);

  // Helper for adding toast notifications
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4200);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerAddBook = () => {
    setActiveTab('books');
    setOpenBookTrigger(true);
  };

  const triggerAddMember = () => {
    setActiveTab('members');
    setOpenMemberTrigger(true);
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openAddBookModal={triggerAddBook}
          openAddMemberModal={triggerAddMember}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              openAddBookModal={triggerAddBook}
              openAddMemberModal={triggerAddMember}
            />
          )}

          {activeTab === 'books' && (
            <Books
              addToast={addToast}
              openAddTrigger={openBookTrigger}
              resetAddTrigger={() => setOpenBookTrigger(false)}
            />
          )}

          {activeTab === 'members' && (
            <Members
              addToast={addToast}
              openAddTrigger={openMemberTrigger}
              resetAddTrigger={() => setOpenMemberTrigger(false)}
            />
          )}

          {activeTab === 'issue' && (
            <IssueBook
              addToast={addToast}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions
              addToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
