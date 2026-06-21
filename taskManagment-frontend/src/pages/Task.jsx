import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TaskService from '../services/Taskapi';
import CreateModal from '../Components/Task/CreateModal';
import ViewModal from '../Components/Task/ViewModal';
import "../assets/CSS/taskList.css";

function Task() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await TaskService.getAllTasks();
            let tasksData = response.data || response;
            
            if (Array.isArray(tasksData)) {
                tasksData = tasksData.map(task => {
                    let checklistData = task.checklistItems || task.checklist || task.checkList || [];
                    
                    if (typeof checklistData === 'string') {
                        checklistData = checklistData.split(',').filter(item => item.trim() !== '');
                    }
                    
                    if (Array.isArray(checklistData) && checklistData.length > 0 && typeof checklistData[0] === 'object') {
                        checklistData = checklistData.map(item => ({
                            id: item.id,
                            item: item.item || item.text || '',
                            completed: item.completed || false
                        }));
                    }
                    
                    return {
                        ...task,
                        checklist: Array.isArray(checklistData) ? checklistData : []
                    };
                });
            }
            
            setTasks(tasksData);
            setError(null);
        } catch(err) {
            setError("Failed to load tasks");
            console.error('Error fetching tasks: ', err);
        } finally {
            setLoading(false);
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getPriorityColor = (priority) => {
        switch(priority?.toUpperCase()) {
            case 'LOW':
                return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' };
            case 'MEDIUM':
                return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
            case 'HIGH':
                return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' };
            default:
                return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280', border: 'rgba(107, 114, 128, 0.2)' };
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowViewModal(true);
    };

    const handleTaskCreated = (newTask) => {
        fetchTasks();
    };

    const handleTaskUpdated = (updatedTask) => {
        fetchTasks();
    };

    const TaskCard = ({ task }) => {
        const priority = getPriorityColor(task.priority);
        const completedCount = task.checklist?.filter(item => item.completed).length || 0;
        const totalCount = task.checklist?.length || 0;
        const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        return (
            <div className="task-card-modern mb-3" 
                onClick={() => handleTaskClick(task)}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 style={{ 
                        color: '#ffffff', 
                        fontSize: '0.9rem', 
                        margin: 0,
                        fontWeight: '600',
                        letterSpacing: '0.3px'
                    }}>
                        {task.title}
                    </h6>
                    <span style={{
                        fontSize: '0.6rem',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        background: priority.bg,
                        color: priority.text,
                        border: `1px solid ${priority.border}`,
                        fontWeight: '500',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}>
                        {task.priority || 'MEDIUM'}
                    </span>
                </div>

                {task.description && (
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                        margin: '0 0 12px 0',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {task.description}
                    </p>
                )}

                {totalCount > 0 && (
                    <div className="mb-2">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px'
                        }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.6rem' }}>
                                Progress
                            </span>
                            {/*completed items 
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.6rem' }}>
                                {completedCount}/{totalCount}
                            </span>
                            */}
                        </div>
                        <div style={{
                            height: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${progress}%`,
                                background: progress === 100 ? 'linear-gradient(90deg, #22C55E, #16A34A)' : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                                borderRadius: '4px',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-regular fa-calendar" style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.6rem' }}></i>
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.6rem' }}>
                            {formatDate(task.dueDate)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.6rem' }}>
                            {totalCount} Items
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const Column = ({ title, status, icon, color, bgColor }) => {
        const columnTasks = getTasksByStatus(status);
        
        return (
            <div className="col-md-4">
                <div style={{
                    background: bgColor || 'radial-gradient(ellipse at top left, #0f0c29, #302b63, #24243e)',
                    borderRadius: '16px',
                    padding: '20px',
                    minHeight: '70vh',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: `rgba(${color}, 0.15)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className={icon} style={{ color: `#${color.toString(16).padStart(6, '0')}` }}></i>
                            </div>
                            <div>
                                <h5 style={{ 
                                    color: '#ffffff', 
                                    margin: 0,
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>
                                    {title}
                                </h5>
                                <span style={{ 
                                    color: 'rgba(255, 255, 255, 0.3)', 
                                    fontSize: '0.65rem',
                                    fontWeight: '400'
                                }}>
                                    {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
                                </span>
                            </div>
                        </div>
                        <span style={{
                            background: `rgba(${color}, 0.15)`,
                            color: `#${color.toString(16).padStart(6, '0')}`,
                            padding: '2px 12px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                        }}>
                            {columnTasks.length}
                        </span>
                    </div>

                    <div className="task-list" style={{ 
                        maxHeight: 'calc(70vh - 100px)', 
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        <style>{`
                            .task-list::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-light" role="status" style={{ width: '30px', height: '30px' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : columnTasks.length === 0 ? (
                            <div className="text-center py-5" style={{ opacity: 0.4 }}>
                                <i className="fa-regular fa-inbox" style={{ fontSize: '28px', color: 'rgba(255,255,255,0.2)' }}></i>
                                <p className="mt-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                                    No {title.toLowerCase()} tasks
                                </p>
                            </div>
                        ) : (
                            columnTasks.map(task => <TaskCard key={task.id} task={task} />)
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid d-flex p-0" style={{ minHeight: '100vh', background: '#0f0c29'}}>
            {/* Sidebar */}
            <div className="main-navigation position-fixed top-0 start-0 h-100 px-0 mx-0 z-1" 
                 style={{ width: "200px", backgroundColor: "#1a1a2e"}}>
                <div className="headers mt-3 p-3">
                    <h6 className="opacity-100 text-light" style={{ fontSize: "1.5rem" }}>
                        <Link className="text-decoration-none text-light"  to="/">TaskFlow</Link>
                    </h6>
                    <p className="mt-4 opacity-75 text-light" style={{ fontSize: ".8rem" }}>
                        Main Navigation
                    </p>
                </div>
                <div className="lists">
                    <ul>
                        <li className="list-unstyled d-flex gap-3 align-items-center">
                            <i className="fa-solid fa-house"></i>
                            <Link className="underlink text-decoration-none" to="/board">Board</Link>
                        </li>
                        <li className="list-unstyled d-flex gap-3 align-items-center">
                            <i className="fa-solid fa-list-check"></i>
                            <Link className="underlink text-decoration-none" to="/Task">All Tasks</Link>
                        </li>
                        <li className="list-unstyled d-flex gap-3 align-items-center">
                            <i className="fa fa-tasks mt-2" aria-hidden="true"></i>
                            <Link className="underlink text-decoration-none" to="/progress">Calendar</Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-fluid px-4" style={{ marginLeft: "200px", padding: "30px" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 style={{ color: '#ffffff', fontWeight: '700', fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                            Task Board
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: 0 }}>
                            {tasks.length} tasks in total
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 25px rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                        }}>
                        <i className="fa-solid fa-pen-to-square text-light"></i>
                    </button>
                </div>

                <div className="row g-4">
                    <Column 
                        title="Pending" 
                        status="PENDING" 
                        icon="fa-regular fa-clock"
                        color={0xEF4444}
                        bgColor="rgba(239, 68, 68, 0.05)"
                    />
                    <Column 
                        title="In Progress" 
                        status="IN_PROGRESS" 
                        icon="fa-regular fa-circle-play"
                        color={0xF59E0B}
                        bgColor="rgba(245, 158, 11, 0.05)"
                    />
                    <Column 
                        title="Completed" 
                        status="COMPLETED" 
                        icon="fa-regular fa-circle-check"
                        color={0x22C55E}
                        bgColor="rgba(34, 197, 94, 0.05)"
                    />
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTaskCreated={handleTaskCreated}
            />

            {/* View Task Modal */}
            <ViewModal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
                onTaskUpdated={handleTaskUpdated}
            />
        </div>
    );
}

export default Task;