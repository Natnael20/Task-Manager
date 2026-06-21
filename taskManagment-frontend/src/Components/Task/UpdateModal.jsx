// src/components/UpdateModal.js
import React, { useState, useEffect } from 'react';
import Task from '../../services/Taskapi';

function UpdateModal({ isOpen, onClose, task, onTaskUpdated }) {
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

    useEffect(() => {
        if (task) {
            const checklistItems = task.checklist ? task.checklist.map(item => ({
                id: item.id,
                item: typeof item === 'object' ? item.item || '' : item,
                completed: typeof item === 'object' ? item.completed || false : false
            })) : [];
            
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'MEDIUM',
                status: task.status || 'PENDING',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                checklistItems: checklistItems
            });
        }
    }, [task]);

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
            checklistItems: [...prev.checklistItems, { 
                item: checklistInput.trim(), 
                completed: false 
            }]
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

    // ✅ FIX: Toggle checklist item completion
    const toggleChecklistItem = (index) => {
        setFormData(prev => ({
            ...prev,
            checklistItems: prev.checklistItems.map((item, i) => 
                i === index ? { ...item, completed: !item.completed } : item
            )
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ✅ FIX: Preserve the completed status when sending to API
            const taskData = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
                dueDate: formData.dueDate,
                checklistItems: formData.checklistItems.map(item => ({
                    id: item.id, // Keep the ID if it exists
                    item: item.item,
                    completed: item.completed || false // Preserve the completion status
                }))
            };


            const response = await Task.updateTask(task.id, taskData);

            // Notify parent
            if (onTaskUpdated) {
                onTaskUpdated(response.data);
            }

            // Close modal
            onClose();

        } catch (error) {
            console.error('❌ Error updating task:', error);
            setError(error.response?.data?.message || 'Failed to update task. Please try again.');
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
            className="modal-overlay"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(10px)'
            }}
        >
            <div 
                className="modal-content"
                style={{
                    borderRadius: '12px',
                    padding: '30px',
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    border: '1px solid #333',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Modal Header */}
                <div className="modal-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: '1px solid #333',
                    paddingBottom: '15px'
                }}>
                    <h3 style={{ color: '#ffffff', margin: 0 }}>Update Task</h3>
                    <button
                        onClick={onClose}
                        style={{
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
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group" style={{ marginBottom: '15px' }}>
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
                                backgroundColor: 'inherit',
                                border: '1px solid #444',
                                borderRadius: '6px',
                                color: '#fff',
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
                    <div className="form-group" style={{ marginBottom: '15px' }}>
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
                                backgroundColor: 'inherit',
                                border: '1px solid #444',
                                borderRadius: '6px',
                                color: '#fff',
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
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#2a2a4e',
                                    border: '1px solid #444',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#2a2a4e',
                                    border: '1px solid #444',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                            Due Date
                        </label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'inherit',
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

                    {/* Checklist Items */}
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                            Checklist Items
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={checklistInput}
                                onChange={(e) => setChecklistInput(e.target.value)}
                                onKeyPress={handleChecklistKeyPress}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: 'inherit',
                                    border: '1px solid #444',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                                onBlur={(e) => e.target.style.borderColor = '#444'}
                                placeholder="Enter checklist item"
                            />
                            <button
                                type="button"
                                onClick={addChecklistItem}
                                style={{
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.3)';
                                }}
                            >
                                <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>
                                Add
                            </button>
                        </div>

                        {/* Checklist Items List */}
                        {formData.checklistItems.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                {formData.checklistItems.map((item, index) => (
                                    <div className='bg-transparent'
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            marginBottom: '5px',
                                            backgroundColor: item.completed ? 'rgba(40, 167, 69, 0.1)' : 'transparent',
                                            border: item.completed ? '1px solid rgba(40, 167, 69, 0.3)' : '1px solid transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="checkbox"
                                                checked={item.completed || false}
                                                onChange={() => toggleChecklistItem(index)}
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    cursor: 'pointer',
                                                    accentColor: '#0d6efd'
                                                }}
                                            />
                                            <span style={{ 
                                                color: item.completed ? '#a8a8a8' : '#ddd', 
                                                fontSize: '14px',
                                                textDecoration: item.completed ? 'line-through' : 'none'
                                            }}>
                                                {item.item}
                                            </span>
                                        </div>
                                        <button
                                            className='rounded-4 px-3 p-1'
                                            type="button"
                                            onClick={() => removeChecklistItem(index)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                padding: '0 5px',
                                                color: '#dc3545'
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
                    <div className='d-flex gap-3 justify-content-end mt-3 pt-3'
                        style={{
                            borderTop: '1px solid #333',
                    }}>
                        <button
                            className='btn bt-t'
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 25px',
                                border: '1px solid #555',
                                borderRadius: '6px',
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
                        <button
                            className='btn'
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 30px',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                transition: 'background-color 0.3s',
                                opacity: loading ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    Update Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateModal;