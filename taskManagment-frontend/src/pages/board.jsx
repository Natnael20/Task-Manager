import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Task from '../services/Taskapi';
import Checklist from '../services/Checklistapi';
import Note from '../services/Noteapi';
import CreateModal from '../Components/Task/CreateModal';
import ViewModal from '../Components/Task/ViewModal';
import TaskSelector from '../Components/Task/TaskSelector';
import CreateNoteModal from '../Components/Note/CreateNoteModal';
import ViewNote from '../Components/Note/ViewNoteModal';
import "../assets/CSS/taskList.css";

function board() {
    const [tasks, setTasks] = useState([]);
    const [activeTaskIds, setActiveTaskIds] = useState(() => {
        const saved = localStorage.getItem('activeTaskIds');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeTasks, setActiveTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [checkedItems, setCheckedItems] = useState({});
    const [taskProgress, setTaskProgress] = useState({});
    const [updating, setUpdating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showTaskSelector, setShowTaskSelector] = useState(false);
    const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
    // ✅ ADD MISSING STATES
    const [showViewNoteModal, setShowViewNoteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    useEffect(() => {
        fetchTasks();
        fetchNotes();
    }, []);

    // Auto-sync checkedItems when selectedTask changes or tasks update
    useEffect(() => {
        if (selectedTask && selectedTask.checklist) {
            const initialChecked = {};
            selectedTask.checklist.forEach((item, index) => {
                initialChecked[index] = item.completed || false;
            });
            
            setCheckedItems(prev => ({
                ...prev,
                [selectedTask.id]: initialChecked
            }));
        }
    }, [selectedTask]);

    // Update active tasks when tasks change
    useEffect(() => {
        const active = tasks.filter(task => activeTaskIds.includes(task.id));
        setActiveTasks(active);
        
        if (selectedTask) {
            const updatedSelected = active.find(t => t.id === selectedTask.id);
            if (updatedSelected) {
                setSelectedTask(updatedSelected);
            }
        }
    }, [tasks, activeTaskIds]);

    useEffect(() => {
        localStorage.setItem('activeTaskIds', JSON.stringify(activeTaskIds));
    }, [activeTaskIds]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await Note.getAllNotes();
            setNotes(response.data || response);
            setError(null);
        } catch(err) {
            setError("failed to load notes");
            console.error('Error fetching notes: ', err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ ADD MISSING HANDLER - Note click
    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setShowViewNoteModal(true);
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await Task.getAllTasks();
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
                    } else if (Array.isArray(checklistData) && checklistData.length > 0 && typeof checklistData[0] === 'string') {
                        checklistData = checklistData.map(item => ({
                            id: null,
                            item: item,
                            completed: false
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

    const formatDate = (dateString) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric'
        });
    };

    const dateFormat = (dateString) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('en-GB', { month: 'long' })}`;
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

    const handleTaskClick = (task) => {        
        setSelectedTask(task);
        fetchTaskProgress(task.id);
    };

    const fetchTaskProgress = async (taskId) => {
        try {
            const response = await Checklist.getTaskProgress(taskId);
            const progressData = response.data;
                        
            setTaskProgress(prev => ({
                ...prev,
                [taskId]: progressData.progressPercentage || 0
            }));
        } catch (error) {
            console.error('Error fetching task progress:', error);
        }
    };

    const toggleChecklistItem = async (taskId, checklistId, index) => {
        if (updating) return;
        
        try {
            setUpdating(true);
            
            setCheckedItems(prev => {
                const currentChecked = prev[taskId]?.[index] || false;
                return {
                    ...prev,
                    [taskId]: {
                        ...prev[taskId],
                        [index]: !currentChecked
                    }
                };
            });
            
            const response = await Checklist.toggleChecklistItem(taskId, checklistId);
            const progressData = response.data;
                        
            setTaskProgress(prev => ({
                ...prev,
                [taskId]: progressData.progressPercentage || 0
            }));
            
            await fetchTasks();
            await fetchTaskProgress(taskId);
            
        } catch (error) {
            console.error('❌ Error toggling checklist item:', error);
            
            if (error.response && error.response.data) {
                alert(`Error: ${error.response.data.message || 'Failed to toggle checklist item'}`);
            } else {
                alert('Failed to toggle checklist item. Please try again.');
            }
            
            await fetchTasks();
            if (selectedTask) {
                await fetchTaskProgress(selectedTask.id);
            }
        } finally {
            setUpdating(false);
        }
    };

    const getTaskProgress = (taskId) => {
        return taskProgress[taskId] || 0;
    };

    const handleTaskCreated = () => {
        fetchTasks();
    };

    const handleViewTask = () => {
        if (selectedTask) {
            setShowViewModal(true);
        } else {
            alert('Please select a task first by clicking on it in the task list.');
        }
    };

    const handleSelectTask = (task) => {
        if (!activeTaskIds.includes(task.id)) {
            setActiveTaskIds(prev => [...prev, task.id]);
            fetchTaskProgress(task.id);
        }
    };

    const handleCloseTask = (taskId) => {
        setActiveTaskIds(prev => prev.filter(id => id !== taskId));
        setTaskProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[taskId];
            return newProgress;
        });
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(null);
            setCheckedItems(prev => {
                const newChecked = { ...prev };
                delete newChecked[taskId];
                return newChecked;
            });
        }
    };

    // ✅ Note Handlers
    const handleNoteCreated = (newNote) => {
        fetchNotes();
    };

    // ✅ FIXED: handleNoteDeleted should close the modal
    const handleNoteDeleted = async (noteId) => {
        try {
            await Note.deleteNote(noteId);
            fetchNotes();
            // Close the view modal
            setShowViewNoteModal(false);
            setSelectedNote(null);
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        }
    };

    return (
        <div className="container-fluid d-flex p-0">
            {/* Left Sidebar */}
            <div className="main-navigation position-fixed top-0 start-0 h-100 px-0 mx-0 z-1" 
                 style={{ width: "200px", backgroundColor: "#1a1a2e"}}>
                <div className="headers mt-3 p-3">
                    <h6 className="opacity-100 text-light" style={{ fontSize: "1.5rem" }}>
                        <Link className="text-decoration-none text-light" to="/">TaskFlow</Link>
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

            {/* Task Section */}
            <div className="container px-0 task-container" style={{ marginLeft: "200px", width: "30%", minHeight: "100vh" }}>
                <div className="task-section p-3">
                    <div className="task-header d-flex justify-content-between align-items-center" 
                         style={{ color: "var(--text-color-secondary)" }}>
                        <h4 className="mt-2" style={{ fontSize: ".9rem" }}>Today's Focus</h4>
                        <span className="badge text-light bg-transparent opacity-50">{activeTasks.length} Tasks</span>
                    </div>
                    <div className="add-section d-flex justify-content-center align-items-center my-3 gap-2">
                        <button 
                            className="btn btn-outline-light"
                            onClick={() => setShowTaskSelector(true)}
                            style={{fontSize: '.7rem', padding: '6px 12px'}}
                        >
                            <i className="fa-solid fa-plus" style={{ marginRight: '4px' }}></i>
                            Add Task
                        </button>
                        <button
                            className="btn btn-outline-light"
                            onClick={handleViewTask}
                            style={{fontSize: '.7rem', padding: '6px 12px'}}
                        >
                            <i className="fa-regular fa-eye" style={{ marginRight: '4px' }}></i>
                            View
                        </button>
                        {selectedTask && (
                            <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCloseTask(selectedTask.id)}
                                style={{fontSize: '.7rem', padding: '6px 12px'}}
                            >
                                <i className="fa-regular fa-circle-xmark" style={{ marginRight: '4px' }}></i>
                                Close
                            </button>
                        )}
                    </div>
                    <div className="task-list mt-3">
                        {loading ? (
                            <div className="text-center text-light p-4">
                                <div className="spinner-border text-light" role="status">
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-danger p-4">
                                <i className="fa-solid fa-circle-exclamation fa-2x"></i>
                                <p className="mt-2">{error}</p>
                                <button className="btn btn-outline-light btn-sm" onClick={fetchTasks}>Retry</button>
                            </div>
                        ) : activeTasks.length === 0 ? (
                            <div className="text-center text-light p-4">
                                <i className="fa-regular fa-inbox fa-2x opacity-50"></i>
                                <p className="mt-2 opacity-50" style={{ fontSize: ".8rem" }}>
                                    No active tasks
                                </p>
                                <button 
                                    className="btn btn-outline-light btn-sm"
                                    onClick={() => setShowTaskSelector(true)}
                                >
                                    <i className="fa-solid fa-plus" style={{ marginRight: '4px' }}></i>
                                    Add a task to focus on
                                </button>
                            </div>
                        ) : (
                            <ul className="ps-0 p-1">
                                {activeTasks.map((task) => (
                                    <li
                                        key={task.id || task._id} 
                                        className={`list-unstyled d-flex gap-3 align-items-center p-2 overflow-hiden ${selectedTask?.id === task.id ? 'active-task' : ''}`}
                                        onClick={() => handleTaskClick(task)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="card first-task border text-light p-2 rounded-3 task-card w-100">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h6 style={{ fontSize: ".9rem" }}>{task.title}</h6>
                                                <small className="text-secondary" style={{ fontSize: ".6rem" }}>
                                                    {task.checklist?.length || 0} items
                                                </small>
                                            </div>
                                            <p style={{ fontSize: ".7rem", display: "-webkit-box", WebkitLineClamp: 2, lineClamp: 2, 
                                                WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {task.description || "No description provided"}
                                            </p>
                                            {task.checklist && task.checklist.length > 0 && (
                                                <div className="progress mb-1" style={{ height: "4px" }}>
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ 
                                                            width: `${getTaskProgress(task.id)}%`,
                                                            backgroundColor: getTaskProgress(task.id) === 100 ? '#28a745' : '#0d6efd'
                                                        }}
                                                    ></div>
                                                </div>
                                            )}
                                            <div className="lower-content d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                                                <small className="text-secondary" style={{ fontSize: ".7rem" }}>
                                                    {formatDate(task.dueDate)}
                                                </small>
                                                <p className="opacity-75 mb-0" style={{ fontSize: ".8rem" }}>
                                                    {getStatusDisplay(task.status).text}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Checklist Container */}
            <div className="container px-0 checkList-container" style={{width:"45%"}}>
                <div className="ongoing-plans">
                    <div className="ongoing-header p-3 mb-1">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mt-2 text-light" style={{fontSize: ".9rem"}}>
                                {selectedTask ? selectedTask.title : "Today's List"}
                            </h4>
                            {selectedTask && (
                                <span style={{color: getStatusDisplay(selectedTask.status).color, fontSize: ".8rem"}}>
                                    {getStatusDisplay(selectedTask.status).text}
                                </span>
                            )}
                        </div>
                        {selectedTask && selectedTask.checklist && selectedTask.checklist.length > 0 && (
                            <div className="progress mt-2" style={{ height: "13 px" }}>
                                <div 
                                    className="progress-bar" 
                                    style={{ 
                                        width: `${getTaskProgress(selectedTask.id)}%`,
                                        backgroundColor: getTaskProgress(selectedTask.id) === 100 ? '#28a745' : '#0d6efd'
                                    }}
                                >
                                    {getTaskProgress(selectedTask.id)}%
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="today-list mt-1">
                        {!selectedTask ? (
                            <div className="text-center text-light p-4">
                                <i className="fa-solid fa-hand-pointer fa-2x opacity-50"></i>
                                <p className="mt-2 opacity-50" style={{ fontSize: ".8rem" }}>
                                    Click a task to view its checklist
                                </p>
                            </div>
                        ) : selectedTask.checklist && selectedTask.checklist.length > 0 ? (
                            <ul className="ps-0 p-1">
                                {selectedTask.checklist.map((item, index) => {
                                    const itemText = typeof item === 'object' ? item.item || item.text || '' : item;
                                    const itemId = typeof item === 'object' ? item.id : index + 1;
                                    const isChecked = checkedItems[selectedTask.id]?.[index] || false;
                                    
                                    return (
                                        <li 
                                            key={index} 
                                            className="list-unstyled d-flex align-items-center gap-2 p-2"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div 
                                                className={`card border p-2 rounded-3 today-card w-100`}
                                                onClick={() => toggleChecklistItem(selectedTask.id, itemId, index)}
                                                style={{ borderColor: isChecked ? '#28a745' : '#444' }}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={() => toggleChecklistItem(selectedTask.id, itemId, index)}
                                                        style={{ 
                                                            width: "18px", 
                                                            height: "18px", 
                                                            cursor: 'pointer',
                                                            accentColor: '#0d6efd'
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={updating}
                                                    />
                                                    <span style={{ 
                                                        fontSize: ".8rem",
                                                        textDecoration: isChecked ? 'line-through' : 'none',
                                                        opacity: isChecked ? 0.6 : 1,
                                                        color: isChecked ? '#a8a8a8' : '#ffffff'
                                                    }}>
                                                        {itemText}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center text-light p-4">
                                <i className="fa-solid fa-list-check fa-2x opacity-50"></i>
                                <p className="mt-2 opacity-50" style={{ fontSize: ".8rem" }}>
                                    No checklist items for this task
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="container px-0 note-container" style={{width: "20%"}}>
                <div className="calander">
                    <div className="calander-header p-3 mb-1">
                        <h4 className="mt-2 text-light opacity-50" style={{ fontSize: ".8rem"}}>Calendar</h4>
                        <div className="addCalander">
                            <button 
                                className="btn border d-flex align-items-center gap-2 justify-content-center w-100 btn-outline-light" 
                                style={{ fontSize: ".7rem" }}
                                onClick={() => setShowCreateNoteModal(true)}
                            >
                                <i className="fa fa-plus text-light" style={{ marginLeft: "3%" }} aria-hidden="true"></i>
                                Add Note
                            </button>
                        </div>
                    </div>
                    <div className="calender-task">
                        {notes.length === 0 ? (
                            <div className="text-center text-light p-4">
                                <i className="fa-solid fa-calendar-plus fa-2x opacity-50"></i>
                                <p className="mt-2 opacity-50" style={{ fontSize: ".8rem" }}>No notes available</p>
                            </div>
                        ) : (
                            <div className="calander-wrapper text-light p-3">
                                {notes.map((note, idx) => (
                                    <div key={note.id ?? idx} 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleNoteClick(note)}>
                                        <h6 style={{ fontSize: ".8rem", marginTop: "12px" }}>
                                            {dateFormat(note.date)}
                                        </h6>
                                        <div className="time-task d-flex align-items-center px-2 py-2 w-100 border rounded mb-1 calendar-item">
                                            <div className="time" style={{minWidth: "60px"}}>
                                                <h6 className="mb-0" style={{fontSize: ".8rem", color:" #82b1ff"}}>
                                                    {note.time ? note.time.substring(0,5) : ""}
                                                </h6>
                                            </div>
                                            <div className="time-title flex-grow-1 vertical-line position-relative">
                                                <span className="d-block fw-bold" style={{ fontSize: ".6rem", color: "#b388ff"}}>{note.title}</span>
                                                <p className="mb-0" style={{ fontSize: ".5rem", color: "#9e9e9e", display: "-webkit-box",
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: "vertical",
                                                                            overflow: "hidden",}}>
                                                    {note.description}
                                                </p>
                                            </div>
                                            {/* Delete Note Button - REMOVED from here, only in ViewNote */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
                onClose={() => setShowViewModal(false)}
                task={selectedTask}
            />

            {/* Task Selector Modal */}
            <TaskSelector
                isOpen={showTaskSelector}
                onClose={() => setShowTaskSelector(false)}
                onSelectTask={handleSelectTask}
                activeTaskIds={activeTaskIds}
            />

            {/* Create Note Modal */}
            <CreateNoteModal
                isOpen={showCreateNoteModal}
                onClose={() => setShowCreateNoteModal(false)}
                onNoteCreated={handleNoteCreated}
            />

            <ViewNote
                isOpen={showViewNoteModal}
                onClose={() => {
                    setShowViewNoteModal(false);
                    setSelectedNote(null);
                }}
                note={selectedNote}
                onNoteDeleted={handleNoteDeleted}
            />
        </div>
    );
}

export default board;