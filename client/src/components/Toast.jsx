import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
          {toast.type === 'success' && <CheckCircle2 size={20} className="text-emerald" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-rose" />}
          {(!toast.type || toast.type === 'info') && <Info size={20} className="text-indigo" />}

          <div style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</div>

          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
