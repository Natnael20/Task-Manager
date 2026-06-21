// src/components/CreateModal.js
import React, { useState } from 'react';
import Task from '../../services/Taskapi';

function CreateModal({ isOpen, onClose, onTaskCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: '',
        checklistItems: []
    });
    const [checklistInput, setChecklistInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add checklist item
    const addChecklistItem = () => {
        if (checklistInput.trim() === '') return;
        
        setFormData(prev => ({
            ...prev,
            checklistItems: [...prev.checklistItems, checklistInput.trim()]
        }));
        setChecklistInput('');
    };

    // Remove checklist item
    const removeChecklistItem = (index) => {
        setFormData(prev => ({
            ...prev,
            checklistItems: prev.checklistItems.filter((_, i) => i !== index)
        }));
    };

    // Handle Enter key for checklist input
    const handleChecklistKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addChecklistItem();
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare data for API
            const taskData = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
                dueDate: formData.dueDate,
                checklistItems: formData.checklistItems.map(item => ({
                    item: item,
                    completed: false
                }))
            };


            const response = await Task.createTask(taskData);

            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'MEDIUM',
                status: 'PENDING',
                dueDate: '',
                checklistItems: []
            });
            setChecklistInput('');

            // Notify parent
            if (onTaskCreated) {
                onTaskCreated(response.data);
            }

            // Close modal
            onClose();

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Close modal on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="modal-overlay position-fixed top-0 start-0 d-flex justify-content-center align-items-center z-3"
            onClick={handleBackdropClick}
            style={{
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,.3)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <div 
                className="modal-content rounded"
                style={{
                    backgroundColor: 'linear-gradient(180deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
                    borderRadius: '12px',
                    padding: '30px',
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    scrollbarWidth: 'none', // Hide scrollbar for Firefox
                    msOverflowStyle: 'none', // Hide scrollbar for IE and Edge
                }}
            >

                {/* Error Message */}
                {error && (
                    <div className='mb-4 rounded-3 p-4 text-light' style={{backgroundColor: '#dc3545',fontSize: '14px'}}>
                        <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group text-light opacity-75 d-block mb-4">
                        <label style={{fontSize: '14px'}}>
                            Title *
                        </label>
                        <input
                            className='w-100 p-2 bg-transparent rounded-3 text-light'
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            style={{
                                border: '1px solid #444',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                            onBlur={(e) => e.target.style.borderColor = '#444'}
                            placeholder="Enter task title"
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group text-light opacity-75" style={{ marginBottom: '15px' }}>
                        <label style={{fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                            Description
                        </label>
                        <textarea
                            className='w-100 p-2 bg-transparent rounded-3 text-light'
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                                border: '1px solid #444',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                            onBlur={(e) => e.target.style.borderColor = '#444'}
                            placeholder="Enter task description"
                        />
                    </div>

                    {/* Priority and Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div className="form-group">
                            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                                Priority
                            </label>
                            <select
                                className='w-100 p-2 rounded-3 text-light'
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                style={{
                                    backgroundColor: '#1a1a3e',
                                    border: '1px solid #444',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                                Due Date
                            </label>
                            <input
                                className='w-100 p-2 rounded-3 text-light'
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                style={{
                                    backgroundColor: '#1a1a3e',
                                    border: '1px solid #444',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                                onBlur={(e) => e.target.style.borderColor = '#444'}
                            />
                        </div>
                    </div>


                    {/* Checklist Items */}
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                            Checklist Items
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                className='w-100 p-2 bg-transparent rounded-3 text-light'
                                type="text"
                                value={checklistInput}
                                onChange={(e) => setChecklistInput(e.target.value)}
                                onKeyPress={handleChecklistKeyPress}
                                style={{
                                    flex: 1,
                                    border: '1px solid #444',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                                onBlur={(e) => e.target.style.borderColor = '#444'}
                                placeholder="Enter checklist item"
                            />
                            <button className='btn border border-0 rounded-2 text-light'
                                type="button"
                                onClick={addChecklistItem}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#1a1a3e',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'background-color 0.3s',
                                    whiteSpace: 'nowrap'
                                }}

                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#fff';
                                    e.target.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = '#555';
                                    e.target.style.color = '#aaa';
                                }}
                            >
                                Add
                            </button>
                        </div>

                        {/* Checklist Items List */}
                        {formData.checklistItems.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                {formData.checklistItems.map((item, index) => (
                                    <div className='d-flex justify-content-between align-items-center p-3 py-2 px-3 rounded-3 mb-3 '
                                        key={index}
                                        style={{
                                            backgroundColor: '#2a2a4e',
                                            border: '1px solid #444'
                                        }}
                                    >
                                        <span style={{ color: '#ddd', fontSize: '14px' }}>
                                            {item}
                                        </span>
                                        <button
                                            className='bg-transparent text-light border border-0 px-3'
                                            type="button"
                                            onClick={() => removeChecklistItem(index)}
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
                                            onMouseLeave={(e) => e.target.style.color = '#dc3545'}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className='d-flex gap-2 mt-4 pt-3' style={{justifyContent: 'flex-end', borderTop: '1px solid #333',}}>
                        <button 
                            className='bg-transparent rounded-4 p-3 px-4'
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 25px',
                                border: '1px solid #555',
                                color: '#aaa',
                                cursor: 'pointer',
                                fontSize: '14px',
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
                        <button className='d-flex rounded-3 bg-transparent  align-items-center justify-content-between gap-3'
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 25px',
                                border: '1px solid #555',
                                color: '#aaa',
                                cursor: 'pointer',
                                fontSize: '14px',
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
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-plus"></i>
                                    Create Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateModal;