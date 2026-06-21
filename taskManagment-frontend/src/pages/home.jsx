// src/Home.js
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import "../assets/CSS/taskList.css";

function Home() {
    const typingRef = useRef(null);

    useEffect(() => {
        const el = typingRef.current;
        if (!el) return;

        const words = [" Natnael "];
        const typingDelayMs = 100;
        const deletingDelayMs = 45;
        const pauseMs = 1200;

        let wordIdx = 0;
        let charIdx = 0;
        let deleting = false;
        let timeoutId = null;

        const tick = () => {
            const word = words[wordIdx] ?? "";

            if (!deleting) {
                charIdx = Math.min(charIdx + 1, word.length);
                el.textContent = word.slice(0, charIdx);
                if (charIdx === word.length) {
                    deleting = true;
                    timeoutId = window.setTimeout(tick, pauseMs);
                    return;
                }
                timeoutId = window.setTimeout(tick, typingDelayMs);
                return;
            }

            charIdx = Math.max(charIdx - 1, 0);
            el.textContent = word.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                wordIdx = (wordIdx + 1) % words.length;
                timeoutId = window.setTimeout(tick, typingDelayMs);
                return;
            }
            timeoutId = window.setTimeout(tick, deletingDelayMs);
        };

        tick();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    return (
        <div className="container-fluid d-flex px-0 mx-0" style={{background: '#0f0c29' }}>
            {/* Main Content */}
            <div className="container-fluid px-4 p-5">
                {/* Hero Section */}
                <div className="hero-section text-center" style={{
                    padding: '40px 20px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '40px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)'
                        }}>
                            <i className="fa-solid fa-tasks" style={{ fontSize: '32px', color: '#fff' }}></i>
                        </div>
                        <h1 style={{
                            color: '#ffffff',
                            fontSize: '3rem',
                            fontWeight: '700',
                            margin: '0 0 12px 0',
                            letterSpacing: '-1px'
                        }}>
                            Welcome to <span style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaskFlow</span>
                            <h1 ref={typingRef} className='mt-3 fw-bold' style={{ letterSpacing: '5px' }}></h1>
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '1.2rem',
                            maxWidth: '600px',
                            margin: '0 auto 30px',
                            lineHeight: '1.8'
                        }}>
                            Your all-in-one task management solution. Stay organized, track progress, and achieve more.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/board">
                                <button style={{
                                    padding: '12px 32px',
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 30px rgba(99, 102, 241, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.3)';
                                }}>
                                    <i className="fa-solid fa-rocket" style={{ marginRight: '8px' }}></i>
                                    Get Started
                                </button>
                            </Link>
                            <Link to="/Task">
                                <button style={{
                                    padding: '12px 32px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '10px',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                    e.target.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                                    e.target.style.color = 'rgba(255,255,255,0.7)';
                                }}>
                                    <i className="fa-regular fa-eye" style={{ marginRight: '8px' }}></i>
                                    View Tasks
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blink {
                    0%, 50% { border-color: #8B5CF6; }
                    51%, 100% { border-color: transparent; }
                }
            `}</style>
        </div>
    );
}

export default Home;