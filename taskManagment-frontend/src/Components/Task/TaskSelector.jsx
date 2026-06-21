// src/Components/TaskSelector.js
import React, { useState, useEffect } from 'react';
import TaskService from '../../services/Taskapi';

function TaskSelector({ isOpen, onClose, onSelectTask, activeTaskIds }) {
    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAllTasks();
        }
    }, [isOpen]);

    const fetchAllTasks = async () => {
        try {
            setLoading(true);
            const response = await TaskService.getAllTasks();
            const tasksData = response.data || response;
            setAllTasks(Array.isArray(tasksData) ? tasksData : []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toUpperCase()) {
            case 'COMPLETED': return '#22C55E';
            case 'IN_PROGRESS': return '#F59E0B';
            case 'PENDING': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority?.toUpperCase()) {
            case 'LOW': return '#22C55E';
            case 'MEDIUM': return '#F59E0B';
            case 'HIGH': return '#EF4444';
            case 'CRITICAL': return '#DC2626';
            default: return '#6B7280';
        }
    };

    const filteredTasks = allTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const isActive = activeTaskIds.includes(task.id);
        return matchesSearch && !isActive;
    });

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
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="modal-content"
          style={{
            borderRadius: "16px",
            padding: "30px",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "100vh",
            overflowY: "auto",
            scrollbarWidth: "none", // Hide scrollbar for Firefox
            msOverflowStyle: "none", // Hide scrollbar for IE and Edge
          }}
        >
          {/* Search Bar */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
              onBlur={(e) => (e.target.style.borderColor = "#333")}
            />
          </div>

          {/* ✅ FIX: Grid Layout - 3 columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              maxHeight: "400px",
              overflowY: "auto",
              scrollbarWidth: "none", // Hide scrollbar for Firefox
              msOverflowStyle: "none", // Hide scrollbar for IE and Edge
              padding: "4px",
            }}
          >
            {loading ? (
              <div
                className="text-center py-5"
                style={{ gridColumn: "1 / -1" }}
              >
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ gridColumn: "1 / -1", opacity: 0.5 }}
              >
                <i
                  className="fa-regular fa-inbox"
                  style={{ fontSize: "28px", color: "rgba(255,255,255,0.2)" }}
                ></i>
                <p
                  style={{ color: "rgba(255,255,255,0.3)", marginTop: "10px" }}
                >
                  {searchTerm
                    ? "No tasks match your search"
                    : "No available tasks to add"}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    onClose();
                  }}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                    padding: "14px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "120px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(99, 102, 241, 0.4)";
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.06)";
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.03)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <h6
                      style={{
                        color: "#fff",
                        margin: "0 0 4px 0",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {task.title}
                    </h6>
                    {task.description && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.6rem",
                          margin: "0 0 8px 0",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: "1.4",
                        }}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="d-flex justify-content-between flex-wrap mb-3">
                      <span
                        style={{
                          fontSize: "0.5rem",
                          padding: "1px 8px",
                          borderRadius: "10px",
                          backgroundColor: getStatusColor(task.status) + "20",
                          color: getStatusColor(task.status),
                          border: `1px solid ${getStatusColor(task.status)}30`,
                        }}
                      >
                        {task.status || "PENDING"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.5rem",
                          padding: "1px 8px",
                          borderRadius: "10px",
                          backgroundColor:
                            getPriorityColor(task.priority) + "20",
                          color: getPriorityColor(task.priority),
                          border: `1px solid ${getPriorityColor(task.priority)}30`,
                        }}
                      >
                        {task.priority || "MEDIUM"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid #333",
              paddingTop: "15px",
              marginTop: "15px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "8px 24px",
                backgroundColor: "transparent",
                border: "1px solid #555",
                borderRadius: "6px",
                color: "#aaa",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#fff";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#555";
                e.target.style.color = "#aaa";
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
}

export default TaskSelector;