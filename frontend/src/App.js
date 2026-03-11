import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import { authService } from './services/authService';

// Composants simples pour éviter les erreurs de compilation
const TeacherDashboard = () => <div style={{padding: '20px'}}><h1>Espace Enseignant</h1></div>;
const AdminDashboard = () => <div style={{padding: '20px'}}><h1>Espace Administration</h1></div>;

function App() {
  const user = authService.getCurrentUser();

  return (
    <Router>
      <div className="App">
        {/* La Navbar s'affiche partout sauf sur le Login (optionnel) */}
        {user && <Navbar />}
        
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/etudiant" element={
            user?.roles?.includes('ROLE_STUDENT') ? <StudentDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/enseignant" element={
            user?.roles?.includes('ROLE_TEACHER') ? <TeacherDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/admin" element={
            user?.roles?.includes('ROLE_ADMIN') ? <AdminDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;