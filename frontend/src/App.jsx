import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RecentlyViewedPage from './pages/RecentlyViewedPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import SavedPapersPage from './pages/SavedPapersPage';
import SearchPage from './pages/SearchPage';
import MyUploadsPage from './pages/MyUploadsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/saved-papers" element={<SavedPapersPage />} />
        <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/my-uploads" element={<MyUploadsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
