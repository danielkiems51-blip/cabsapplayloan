import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import OffersPage from './pages/OffersPage';
import LoginPage from './pages/LoginPage';
import StatusPage from './pages/StatusPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/bl" replace />} />
          <Route path="/:userId" element={<OffersPage />} />
          <Route path="/:userId/login" element={<LoginPage />} />
          <Route path="/:userId/status" element={<StatusPage />} />
          <Route path="*" element={<Navigate to="/bl" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
