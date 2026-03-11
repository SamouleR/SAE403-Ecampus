import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';

function App() {
  return (
    <Router>
      <div className="App" style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
        <Navbar />
        <main>
          <Routes>
            {/* Si on est à la racine, on affiche l'étudiant par défaut */}
            <Route path="/" element={<StudentDashboard />} />
            {/* Si on tape /etudiant, on affiche aussi l'étudiant */}
            <Route path="/etudiant" element={<StudentDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;