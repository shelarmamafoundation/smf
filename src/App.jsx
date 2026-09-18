import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    // basename={import.meta.env.BASE_URL} मुळे local असो किंवा github pages (/smf/), routes आपोआप मॅच होतात
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* 1. Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* 2. Management PWA (Admin Panel) Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* 404 Fallback - जर चुकीचा URL टाकला तर होमवर नेईल */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}