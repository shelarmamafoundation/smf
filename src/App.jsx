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
import SaapshidiRegistration from './components/common/SaapshidiRegistration';
import AboutPage from './pages/public/AboutPage';

// Global Form Access Guard
import FormAccessGuard from './components/common/FormAccessGuard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminInitiativesPage from './pages/admin/AdminInitiativesPage';
import AdminFinancePage from './pages/admin/AdminFinancePage';
import DandiyaDesk from './components/admin/DandiyaDesk';
import SaapshidiDesk from './components/admin/SaapshidiDesk';

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
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* दांडिया नोंदणी फॉर्म (ग्लोबल गार्डसह) */}
        <Route 
          path="/dandiya" 
          element={
            <FormAccessGuard formKey="dandiya" defaultTitle="आपला दांडिया २०२६">
              <DandiyaRegistration />
            </FormAccessGuard>
          } 
        />

        {/* सापशिडी नोंदणी फॉर्म (ग्लोबल गार्डसह) */}
        <Route 
          path="/saapshidi" 
          element={
            <FormAccessGuard formKey="saapshidi" defaultTitle="भव्य सापशिडी स्पर्धा २०२६">
              <SaapshidiRegistration />
            </FormAccessGuard>
          } 
        /> 

        {/* 2. Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Admin Panel Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="initiatives" element={<AdminInitiativesPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="dandiya-desk" element={<DandiyaDesk />} />
          <Route path="saapshidi-desk" element={<SaapshidiDesk />} />
        </Route>

        {/* 4. Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* Floating Admin Button */}
      <AdminFloatingButton />
    </HashRouter>
  );
}