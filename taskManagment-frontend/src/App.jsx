// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import BoardPage from './pages/board';
import TaskPage from './pages/Task';  // Importing from Task.jsx
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path='/Task' element={<TaskPage />} />  {/* Changed from '/TaskPage' to '/Task' */}
      </Routes>
    </Router>
  );
}

export default App;