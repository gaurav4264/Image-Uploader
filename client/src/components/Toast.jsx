import React, { useState, useEffect, useCallback } from 'react';

let toastId = 0;
let addToastExternal = null;

// Global function to trigger toasts from anywhere
export const toast = {
    success: (message) => addToastExternal?.({ type: 'success', message }),
    error: (message) => addToastExternal?.({ type: 'error', message }),
    info: (message) => addToastExternal?.({ type: 'info', message }),
    warning: (message) => addToastExternal?.({ type: 'warning', message }),
};

// Confirmation dialog via promise
export const confirmToast = (message) => {
    return new Promise((resolve) => {
        addToastExternal?.({ type: 'confirm', message, resolve });
    });
};

const ICONS = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠',
    confirm: '?',
};

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t =>
            t.id === id ? { ...t, exiting: true } : t
        ));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
    }, []);

    const addToast = useCallback(({ type, message, resolve }) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, type, message, resolve, exiting: false }]);

        // Auto-dismiss non-confirm toasts after 4s
        if (type !== 'confirm') {
            setTimeout(() => removeToast(id), 4000);
        }
    }, [removeToast]);

    useEffect(() => {
        addToastExternal = addToast;
        return () => { addToastExternal = null; };
    }, [addToast]);

    const handleConfirm = (t, result) => {
        t.resolve?.(result);
        removeToast(t.id);
    };

    return (
        <>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}
                    >
                        <span className="toast-icon">{ICONS[t.type]}</span>
                        <span className="toast-message">{t.message}</span>
                        {t.type === 'confirm' ? (
                            <div className="toast-actions">
                                <button className="toast-btn toast-btn-yes" onClick={() => handleConfirm(t, true)}>
                                    Yes
                                </button>
                                <button className="toast-btn toast-btn-no" onClick={() => handleConfirm(t, false)}>
                                    No
                                </button>
                            </div>
                        ) : (
                            <button className="toast-close" onClick={() => removeToast(t.id)}>
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default ToastProvider;
