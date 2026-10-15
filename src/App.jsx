// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import InitiativeDetailPage from './pages/public/InitiativeDetailPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminInitiativesPage from './pages/admin/AdminInitiativesPage';
import AdminFinancePage from './pages/admin/AdminFinancePage';

// Quick Admin Floating Button
import AdminFloatingButton from './components/common/AdminFloatingButton';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      
            <Routes>
        
        {/* 1. Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="initiatives/:id" element={<InitiativeDetailPage lang="mr" />} />
        </Route>

        {/* 2. Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Admin Panel Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="initiatives" element={<AdminInitiativesPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
        </Route>

        {/* 4. Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}