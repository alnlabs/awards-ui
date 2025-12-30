import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { getMe } from './store/slices/authSlice';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import { USER_ROLES } from './utils/constants';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Cycles from './pages/Cycles';
import Nominations from './pages/Nominations';
import Awards from './pages/Awards';
import Users from './pages/Users';

function App() {
  useEffect(() => {
    // Load user on app start if token exists
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(getMe());
    }
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycles"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR, USER_ROLES.MANAGER]}>
                <DashboardLayout>
                  <Cycles />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nominations"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR, USER_ROLES.MANAGER, USER_ROLES.PANEL]}>
                <DashboardLayout>
                  <Nominations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/awards"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR, USER_ROLES.EMPLOYEE]}>
                <DashboardLayout>
                  <Awards />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <Users />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
