// src/Components/CreateNoteModal.js
import React, { useState } from 'react';
import Noteapi from '../../services/Noteapi';

function CreateNoteModal({ isOpen, onClose, onNoteCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const noteData = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time
            };

            const response = await Noteapi.createNote(noteData);
            
            if (onNoteCreated) {
                onNoteCreated(response.data);
            }
            
            setFormData({
                title: '',
                description: '',
                date: '',
                time: ''
            });
            onClose();

        } catch (error) {
            console.error('Error creating note:', error);
            setError(error.response?.data?.message || 'Failed to create note');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(5px)'
            }}
        >
            <div
                className="modal-content"
                style={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: '16px',
                    padding: '30px',
                    width: '90%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    border: '1px solid #333',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="modal-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: '1px solid #333',
                    paddingBottom: '15px'
                }}>
                    <h3 style={{ color: '#ffffff', margin: 0 }}>
                        <i className="fa-regular fa-note-sticky" style={{ marginRight: '10px', color: '#8B5CF6' }}></i>
                        Add Note
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            placeholder="Enter note title"
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                            placeholder="Enter note description"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                                Time
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end',
                        borderTop: '1px solid #333',
                        paddingTop: '20px'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 25px',
                                backgroundColor: 'transparent',
                                border: '1px solid #555',
                                borderRadius: '8px',
                                color: '#aaa',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#fff';
                                e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#555';
                                e.target.style.color = '#aaa';
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 30px',
                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateNoteModal;