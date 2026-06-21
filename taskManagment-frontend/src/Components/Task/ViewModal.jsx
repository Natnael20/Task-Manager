// src/Components/ViewModal.js
import React, { useState, useRef, useEffect } from 'react';
import UpdateModal from './UpdateModal';
import DeleteModal from './deleteModal';

function ViewModal({ isOpen, onClose, task, onTaskUpdated, onTaskDelete }) {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // ✅ FIX: Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showMenu &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleUpdateClick = () => {
        setShowUpdateModal(true);
        setShowMenu(false);
    };

    const handleTaskUpdated = (updatedTask) => {
        if (onTaskUpdated) {
            onTaskUpdated(updatedTask);
        }
        setShowUpdateModal(false);
        onClose();
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
        setShowMenu(false);
    };

    const handleConfirmDelete = () => {
        if (onTaskDelete) {
            onTaskDelete(task.id);
        }
        setShowDeleteModal(false);
        onClose();
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    if (!isOpen) return null;

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getPriorityDisplay = (priority) => {
        switch(priority?.toUpperCase()) {
          case 'LOW':
            return { text: 'Low', color: '#22C55E'};
          case 'MEDIUM':
            return { text: 'Medium', color: '#F59E0B'};
          case 'HIGH':
            return { text: 'High', color: '#EF4444'};
          default:
            return { text: priority || 'Unknown', color: '#6B7280'};
        }
    };

    const getStatusDisplay = (status) => {
        switch(status?.toUpperCase()) {
          case 'COMPLETED':
            return { text: 'Completed', color: '#22C55E'};
          case 'IN_PROGRESS':
            return { text: 'In Progress', color: '#F59E0B'};
          case 'PENDING':
            return { text: 'Pending', color: '#EF4444'};
          default:
            return { text: status || 'Unknown', color: '#6B7280'};
        }
    };

    // Count completed checklist items
    const getCompletedCount = (checklistItems) => {
        if (!checklistItems || checklistItems.length === 0) return 0;
        return checklistItems.filter(item => item.completed).length;
    };

    // Close modal on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowMenu(false);
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
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(10px)'
                }}
            >
                <div
                    className="modal-content"
                    style={{
                        backgroundColor: 'inherit',
                        borderRadius: '12px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        border: '1px solid #333',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                        position: 'relative'
                    }}
                >
                    {/* Three Dots Menu - Top Right */}
                    <div style={{
                        position: 'absolute',
                        top: '35px',
                        right: '20px',
                        zIndex: 10
                    }}>
                        <button
                            ref={buttonRef}
                            onClick={toggleMenu}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '8px',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className="fa-solid fa-ellipsis-vertical text-light"></i>
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div
                                ref={menuRef}
                                style={{
                                    position: 'absolute',
                                    top: '30px',
                                    right: '0',
                                    backgroundColor: '#1a1a2e',
                                    borderRadius: '10px',
                                    padding: '6px',
                                    minWidth: '100px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 1)',
                                    animation: 'slideDown 0.2s ease'
                                }}
                            >
                                <button
                                    onClick={handleUpdateClick}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    Update
                                </button>
                                <button
                                    onClick={handleDeleteClick}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {task ? (
                        <>
                            {/* Task Title */}
                            <div style={{ marginBottom: '20px' }}>
                                <h2 style={{ color: '#ffffff', fontSize: '24px', margin: 0 }}>
                                    {task.title}
                                </h2>
                                <div className='mt-4 mb-4 d-flex justify-content-around align-items-center'>
                                    <span className="badge" style={{ 
                                        fontSize: '12px',
                                        backgroundColor: getStatusDisplay(task.status).color,
                                        color: '#fff'}}>
                                        {getStatusDisplay(task.status).text}
                                    </span>
                                    <span className="badge" style={{ 
                                        fontSize: '12px',
                                        backgroundColor: getPriorityDisplay(task.priority).color,
                                        color: '#fff'
                                    }}>
                                        {getPriorityDisplay(task.priority).text}
                                    </span>
                                    {task.dueDate && (
                                        <span className="badge bg-dark" style={{ fontSize: '12px' }}>
                                            <i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i>
                                            {formatDate(task.dueDate)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {task.description && (
                                <div className='mb-4'>
                                    <p style={{ color: '#ddd', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                                        {task.description}
                                    </p>
                                </div>
                            )}

                            {/* Progress */}
                            {task.checklist && task.checklist.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <h5 style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
                                            <i className="fa-regular fa-circle-check" style={{ marginRight: '8px' }}></i>
                                        Progress
                                        </h5>
                                        <span style={{ color: '#ddd', fontSize: '14px' }}>
                                            {getCompletedCount(task.checklist)} / {task.checklist.length} completed
                                        </span>
                                    </div>
                                    <div className="progress rounded-3" style={{ height: '8px', backgroundColor: '#2a2a4e'}}>
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${(getCompletedCount(task.checklist) / task.checklist.length) * 100}%`,
                                                backgroundColor: getCompletedCount(task.checklist) === task.checklist.length ? '#28a745' : '#0d6efd',
                                                transition: 'width 0.3s ease'
                                            }}
                                        >
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Checklist Items */}
                            {task.checklist && task.checklist.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h5 style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
                                        <i className="fa-regular fa-square-check" style={{ marginRight: '8px' }}></i>
                                        Checklist Items
                                    </h5>
                                    <div style={{
                                        borderRadius: '8px',
                                        padding: '10px',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none'
                                    }}>
                                        {task.checklist.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    borderBottom: index < task.checklist.length - 1 ? '1px solid #333' : 'none',
                                                    borderRadius: item.completed ? '4px' : '0'
                                                }}
                                            >
                                                <span className="opacity-75" style={{
                                                    color: item.completed ? '#a8a8a8' : '#ffffff',
                                                    textDecoration: item.completed ? 'line-through' : 'none',
                                                    fontSize: '14px'
                                                }}>
                                                    {item.item || item}
                                                </span> 
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Checklist Items */}
                            {(!task.checklist || task.checklist.length === 0) && (
                                <div style={{
                                    backgroundColor: '#2a2a4e',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <i className="fa-regular fa-list-check" style={{ fontSize: '24px', color: '#555' }}></i>
                                    <p style={{ color: '#666', margin: '10px 0 0 0', fontSize: '14px' }}>
                                        No checklist items for this task
                                    </p>
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '20px',
                                borderTop: '1px solid #333',
                                paddingTop: '20px'
                            }}>
                                <button className='btn text-light border border-0 p-2 px-4 rounded-3 '
                                    onClick={onClose}
                                    style={{
                                        fontSize: '14px',
                                        transition: 'background-color 0.3s'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <i className="fa-regular fa-circle-xmark" style={{ fontSize: '48px', color: '#555' }}></i>
                            <h4 style={{ color: '#888', marginTop: '20px' }}>No task selected</h4>
                            <p style={{ color: '#666' }}>Please select a task to view details</p>
                        </div>
                    )}
                </div>

                {/* Update Modal */}
                <UpdateModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    task={task}
                    onTaskUpdated={handleTaskUpdated}
                />

                {/* Delete Modal */}
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    taskTitle={task?.title}
                />
            </div>

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
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

export default ViewModal;