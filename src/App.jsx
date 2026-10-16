// src/App.jsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import InitiativeDetailPage from './pages/public/InitiativeDetailPage';
import DandiyaRegistration from './components/common/DandiyaRegistration';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminInitiativesPage from './pages/admin/AdminInitiativesPage';
import AdminFinancePage from './pages/admin/AdminFinancePage';
import DandiyaDesk from './components/admin/DandiyaDesk';

// Quick Admin Floating Button
import AdminFloatingButton from './components/common/AdminFloatingButton';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        
        {/* 1. Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="initiatives/:id" element={<InitiativeDetailPage lang="mr" />} />
        </Route>

        <Route path="/dandiya" element={<DandiyaRegistration />} />

        {/* 2. Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Admin Panel Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="initiatives" element={<AdminInitiativesPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="dandiya-desk" element={<DandiyaDesk />} />
        </Route>

        {/* 4. Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </HashRouter>
  );
}