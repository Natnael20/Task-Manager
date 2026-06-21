// src/Components/ViewNote.js
import React, { useState } from 'react';
import DeleteNote from './DeleteNoteModal';

function ViewNote({ isOpen, onClose, note, onNoteDeleted }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (onNoteDeleted && note) {
            onNoteDeleted(note.id);
        }
        setShowDeleteModal(false);
        onClose();
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            <div
                className="modal-overlay"
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
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)'
                }}
            >
                <div
                    className="modal-content"
                    style={{
                        backgroundColor: '#1a1a2e',
                        borderRadius: '16px',
                        padding: '35px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                        position: 'relative',
                        animation: 'slideUp 0.3s ease'
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '20px',
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: '24px',
                            cursor: 'pointer',
                            transition: 'color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#fff'}
                        onMouseLeave={(e) => e.target.style.color = '#888'}
                    >
                        ×
                    </button>

                    {note ? (
                        <>
                            {/* Note Header */}
                            <div style={{ marginBottom: '20px' }}>
                                <h2 style={{ 
                                    color: '#ffffff', 
                                    fontSize: '1.5rem', 
                                    margin: '0 0 8px 0',
                                    fontWeight: '600'
                                }}>
                                    {note.title || 'Untitled Note'}
                                </h2>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '12px', 
                                    flexWrap: 'wrap',
                                    alignItems: 'center'
                                }}>
                                    {note.date && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <i className="fa-regular fa-calendar"></i>
                                            {formatDate(note.date)}
                                        </span>
                                    )}
                                    {note.time && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'rgba(255,255,255,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <i className="fa-regular fa-clock"></i>
                                            {note.time}
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '2px 10px',
                                        borderRadius: '12px',
                                        background: 'rgba(139, 92, 246, 0.15)',
                                        color: '#8B5CF6',
                                        border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}>
                                        Note
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                marginBottom: '20px'
                            }}></div>

                            {/* Description */}
                            {note.description ? (
                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.8',
                                        margin: 0,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {note.description}
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '8px',
                                    marginBottom: '24px'
                                }}>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0, fontSize: '0.9rem' }}>
                                        No description provided
                                    </p>
                                </div>
                            )}

                            {/* Divider */}
                            <div style={{
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                marginBottom: '20px'
                            }}></div>

                            {/* Metadata */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Created
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                                        {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Note ID
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                                        #{note.id}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                paddingTop: '20px'
                            }}>
                                <button
                                    onClick={handleDeleteClick}
                                    style={{
                                        padding: '10px 24px',
                                        backgroundColor: 'rgba(220, 53, 69, 0.15)',
                                        border: '1px solid rgba(220, 53, 69, 0.3)',
                                        borderRadius: '8px',
                                        color: '#dc3545',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.25)';
                                        e.target.style.borderColor = 'rgba(220, 53, 69, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.15)';
                                        e.target.style.borderColor = 'rgba(220, 53, 69, 0.3)';
                                    }}
                                >
                                    <i className="fa-regular fa-trash-can"></i>
                                    Delete
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.3s',
                                        fontWeight: '500'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <i className="fa-regular fa-circle-xmark" style={{ fontSize: '48px', color: '#555' }}></i>
                            <h4 style={{ color: '#888', marginTop: '20px' }}>No note selected</h4>
                            <p style={{ color: '#666' }}>Please select a note to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Note Modal */}
            <DeleteNote
                isOpen={showDeleteModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                noteTitle={note?.title}
            />

            <style>{`
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
        </>
    );
}

export default ViewNote;