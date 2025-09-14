import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";

import LandingPage from "./pages/LandingPage";
import Impact from "./pages/Impact";
import Help from "./pages/Help";

import Dashboard from "./components/citizen/Dashboard";
import Report from "./components/citizen/Report";
import Map from "./components/citizen/Map";
import Leaderboard from "./components/citizen/Leaderboard";
import Rewards from "./components/citizen/Rewards";
import Community from "./components/citizen/Community";
import CitizenSettings from "./components/citizen/Settings";

import RagpickerTasks from "./components/ragpicker/Tasks";
import RagpickerMap from "./components/ragpicker/Map";
import RagpickerEarnings from "./components/ragpicker/Earnings";
import RagpickerProfile from "./components/ragpicker/Profile";

import AdminDashboard from "./components/admin/Dashboard";
import AdminModeration from "./components/admin/Moderation";
import AdminAssignment from "./components/admin/Assignment";
import AdminHeatmap from "./components/admin/Heatmap";
import AdminUsers from "./components/admin/Users";
import AdminPartners from "./components/admin/Partners";
import AdminSettings from "./components/admin/Settings";

import InstitutionDashboard from "./components/instituitions/Dashboard";
import InstitutionReports from "./components/instituitions/Reports";
import InstitutionMembers from "./components/instituitions/Members";
import InstitutionAnalytics from "./components/instituitions/Analytics";
import InstitutionSettings from "./components/instituitions/Settings";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AddressOnboarding from "./components/auth/AddressOnboarding";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import NotFound from "./components/NotFound";
import { ROUTES } from '@/lib/routes';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
              <Route path={ROUTES.ROOT} element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } />
              <Route path={ROUTES.IMPACT} element={
                <PublicRoute>
                  <Impact />
                </PublicRoute>
              } />
              <Route path={ROUTES.HELP} element={
                <PublicRoute>
                  <Help />
                </PublicRoute>
              } />
              
              <Route path={ROUTES.LOGIN} element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path={ROUTES.REGISTER} element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path={ROUTES.ONBOARDING_ADDRESS} element={
                <ProtectedRoute allowedRoles={['citizen','ragpicker','institution','admin']}>
                  <AddressOnboarding />
                </ProtectedRoute>
              } />
              
              <Route path={ROUTES.CITIZEN_DASHBOARD} element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.CITIZEN_REPORT} element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Report />
                </ProtectedRoute>
              } />
              {/* Alias /report/new -> /report (same component) */}
              <Route path={ROUTES.CITIZEN_REPORT_NEW} element={<Navigate to={ROUTES.CITIZEN_REPORT} replace />} />
              <Route path={ROUTES.CITIZEN_MAP} element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Map />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.CITIZEN_LEADERBOARD} element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.CITIZEN_REWARDS} element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Rewards />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.CITIZEN_COMMUNITY} element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.CITIZEN_SETTINGS} element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenSettings />
                </ProtectedRoute>
              } />
              
              {/* Ragpicker Routes - Protected */}
              <Route path={ROUTES.RAGPICKER_TASKS} element={
                <ProtectedRoute allowedRoles={['ragpicker']}>
                  <RagpickerTasks />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.RAGPICKER_MAP} element={
                <ProtectedRoute allowedRoles={['ragpicker']}>
                  <RagpickerMap />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.RAGPICKER_EARNINGS} element={
                <ProtectedRoute allowedRoles={['ragpicker']}>
                  <RagpickerEarnings />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.RAGPICKER_PROFILE} element={
                <ProtectedRoute allowedRoles={['ragpicker']}>
                  <RagpickerProfile />
                </ProtectedRoute>
              } />
              
              {/* Institution Routes - Protected */}
              <Route path={ROUTES.ORG_DASHBOARD} element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ORG_REPORTS} element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionReports />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ORG_MEMBERS} element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionMembers />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ORG_ANALYTICS} element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionAnalytics />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ORG_SETTINGS} element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionSettings />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - Protected */}
              <Route path={ROUTES.ADMIN_OVERVIEW} element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ADMIN_MODERATION} element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminModeration />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ADMIN_ASSIGN} element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAssignment />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ADMIN_HEATMAP} element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminHeatmap />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ADMIN_USERS} element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ADMIN_PARTNERS} element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPartners />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ADMIN_SETTINGS} element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              
              <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
);

export default App;
