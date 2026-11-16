import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import VolunteerDashboard from './pages/VolunteerDashboard';
import MaatramPassPage from './pages/MaatramPassPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import OfficeHomePage from './pages/OfficeHomePage';
import CreateOpportunityPage from './pages/CreateOpportunityPage';
import ManageOpportunityPage from './pages/ManageOpportunityPage';
import QRScannerPage from './pages/QRScannerPage';
import ApprovalQueuePage from './pages/ApprovalQueuePage';
import EngagementReportPage from './pages/EngagementReportPage';
import EmployerReportPage from './pages/EmployerReportPage';
import AdminHomePage from './pages/AdminHomePage';
import UserManagementPage from './pages/UserManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';
import PublicPassPage from './pages/PublicPassPage';
import NotFoundPage from './pages/NotFoundPage';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'PENDING') return <Navigate to="/pending" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'OFFICE_TEAM') return <Navigate to="/office" replace />;
  return <Navigate to="/dashboard" replace />;
}

function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.status === 'PENDING') return <Navigate to="/pending" replace />;
  if (user?.status === 'REJECTED' || user?.status === 'SUSPENDED') return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending" element={<PendingApprovalPage />} />
      <Route path="/pass/public/:userId" element={<PublicPassPage />} />

      {/* Volunteer routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['VOLUNTEER']}>
          <VolunteerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/pass" element={
        <ProtectedRoute roles={['VOLUNTEER']}>
          <MaatramPassPage />
        </ProtectedRoute>
      } />
      <Route path="/opportunities" element={
        <ProtectedRoute roles={['VOLUNTEER', 'OFFICE_TEAM', 'ADMIN']}>
          <OpportunitiesPage />
        </ProtectedRoute>
      } />
      <Route path="/opportunities/:id" element={
        <ProtectedRoute roles={['VOLUNTEER', 'OFFICE_TEAM', 'ADMIN']}>
          <OpportunityDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute roles={['VOLUNTEER', 'OFFICE_TEAM', 'ADMIN']}>
          <LeaderboardPage />
        </ProtectedRoute>
      } />

      {/* Office routes */}
      <Route path="/office" element={
        <ProtectedRoute roles={['OFFICE_TEAM', 'ADMIN']}>
          <OfficeHomePage />
        </ProtectedRoute>
      } />
      <Route path="/office/opportunities/new" element={
        <ProtectedRoute roles={['OFFICE_TEAM', 'ADMIN']}>
          <CreateOpportunityPage />
        </ProtectedRoute>
      } />
      <Route path="/office/opportunities/:id" element={
        <ProtectedRoute roles={['OFFICE_TEAM', 'ADMIN']}>
          <ManageOpportunityPage />
        </ProtectedRoute>
      } />
      <Route path="/office/scanner" element={
        <ProtectedRoute roles={['OFFICE_TEAM', 'ADMIN']}>
          <QRScannerPage />
        </ProtectedRoute>
      } />
      <Route path="/office/approval-queue" element={
        <ProtectedRoute roles={['OFFICE_TEAM', 'ADMIN']}>
          <ApprovalQueuePage />
        </ProtectedRoute>
      } />
      <Route path="/office/reports/engagement" element={
        <ProtectedRoute roles={['OFFICE_TEAM', 'ADMIN']}>
          <EngagementReportPage />
        </ProtectedRoute>
      } />
      <Route path="/office/reports/employer" element={
        <ProtectedRoute roles={['OFFICE_TEAM', 'ADMIN']}>
          <EmployerReportPage />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}>
          <AdminHomePage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['ADMIN']}>
          <UserManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/audit" element={
        <ProtectedRoute roles={['ADMIN']}>
          <AuditLogPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute roles={['ADMIN']}>
          <SettingsPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
