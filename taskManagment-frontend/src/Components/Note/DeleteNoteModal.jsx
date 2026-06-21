// src/Components/DeleteNote.js
import React from 'react';

function DeleteNote({ isOpen, onClose, onConfirm, noteTitle }) {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="delete-confirm-overlay"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.3s ease'
            }}
        >
            <div
                className="delete-confirm-modal"
                style={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: '16px',
                    padding: '35px',
                    width: '90%',
                    maxWidth: '420px',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                    animation: 'slideUp 0.3s ease'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(220, 53, 69, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <i className="fa-regular fa-trash-can" style={{ fontSize: '28px', color: '#dc3545' }}></i>
                    </div>
                    <h4 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '20px' }}>
                        Delete Note?
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                        Are you sure you want to delete <strong style={{ color: '#fff' }}>"{noteTitle || 'this note'}"</strong>?<br />
                        This action cannot be undone.
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 28px',
                            backgroundColor: 'transparent',
                            border: '1px solid #444',
                            borderRadius: '8px',
                            color: '#aaa',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.3s',
                            flex: 1
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = '#666';
                            e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = '#444';
                            e.target.style.color = '#aaa';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 28px',
                            backgroundColor: '#dc3545',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                            flex: 1,
                            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#c82333';
                            e.target.style.boxShadow = '0 6px 25px rgba(220, 53, 69, 0.4)';
                            e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#dc3545';
                            e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <i className="fa-regular fa-trash-can" style={{ marginRight: '8px' }}></i>
                        Delete
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

export default DeleteNote;