import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import EscalatedComplaintsScreen from './screens/EscalatedComplaintsScreen/EscalatedComplaints';
import ComplaintDetailsScreen from './screens/ComplaintsDetailsScreen/ComplaintDetails';
import Login from './screens/Login/Login';
import ProtectedRoute from './ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login screen */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<App />} />}
        />
        <Route
          path="/another-screen"
          element={<ProtectedRoute element={<EscalatedComplaintsScreen />} />}
        />
        <Route
          path="/complaint-details/:id"
          element={<ProtectedRoute element={<ComplaintDetailsScreen />} />}
        />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
