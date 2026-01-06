// src/App.jsx

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import { store } from "./store/store";
import { getMe } from "./store/slices/authSlice";

import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";

import { USER_ROLES } from "./utils/constants";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

/* =====================
   Core Pages
===================== */
import { Cycles, UpsertCycle, ViewCycle } from "./pages/cycles";
import { Awards } from "./pages/awards";
import { UpsertUser, Users } from "./pages/users";

/* =====================
   Criteria (HR)
===================== */
import { CriteriaList, RenderCriteria, UpsertCriteria } from "./pages/criteria";

/* =====================
   Nominations
===================== */
import {
  Nominations,
  ViewNomination,
  UpsertNomination,
} from "./pages/nominations";

/* =====================
   Panels (HR)
===================== */
import { Panels, ViewPanel, UpsertPanel } from "./pages/panels";

/* =====================
   Reviews / Panel Assignments
===================== */
import {
  MyReviews,
  ReviewAssignment,
  AssignmentSummary,
  AssignmentReviews,
} from "./pages/reviews";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      store.dispatch(getMe());
    }
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* ========= AUTH ========= */}
          <Route path="/login" element={<Login />} />

          {/* ========= DASHBOARD ========= */}
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

          {/* ========= CRITERIA ========= */}
          <Route
            path="/criteria"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <CriteriaList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/criteria/new"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <UpsertCriteria />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/criteria/:criteriaId/edit"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <UpsertCriteria />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/criteria/:criteriaId/view"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <RenderCriteria />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ========= CYCLES ========= */}
          <Route
            path="/cycles"
            element={
              <ProtectedRoute
                allowedRoles={[USER_ROLES.HR, USER_ROLES.MANAGER]}
              >
                <DashboardLayout>
                  <Cycles />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycles/new"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <UpsertCycle />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycles/:cycleId/edit"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <UpsertCycle />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycles/:cycleId/view"
            element={
              <ProtectedRoute
                allowedRoles={[
                  USER_ROLES.HR,
                  USER_ROLES.MANAGER,
                  USER_ROLES.PANEL,
                ]}
              >
                <DashboardLayout>
                  <ViewCycle />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ========= NOMINATIONS ========= */}
          <Route
            path="/nominations"
            element={
              <ProtectedRoute
                allowedRoles={[
                  USER_ROLES.HR,
                  USER_ROLES.MANAGER,
                  USER_ROLES.PANEL,
                ]}
              >
                <DashboardLayout>
                  <Nominations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nominations/new"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.MANAGER]}>
                <DashboardLayout>
                  <UpsertNomination />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nominations/:nominationId/view"
            element={
              <ProtectedRoute
                allowedRoles={[
                  USER_ROLES.HR,
                  USER_ROLES.MANAGER,
                  USER_ROLES.PANEL,
                ]}
              >
                <DashboardLayout>
                  <ViewNomination />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nominations/:nominationId/edit"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.MANAGER]}>
                <DashboardLayout>
                  <UpsertNomination />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ========= PANELS (HR) ========= */}
          <Route
            path="/panels"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <Panels />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/panels/new"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <UpsertPanel />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/panels/:panelId/edit"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <UpsertPanel />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/panels/:panelId"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <ViewPanel />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ========= REVIEWS (Panel Assignments) ========= */}
          {/* PANEL MEMBER */}
          <Route
            path="/reviews"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.PANEL]}>
                <DashboardLayout>
                  <MyReviews />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews/:assignmentId"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.PANEL]}>
                <DashboardLayout>
                  <ReviewAssignment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* HR */}
          <Route
            path="/reviews/:assignmentId/summary"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <AssignmentSummary />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews/:assignmentId/all"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <AssignmentReviews />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ========= AWARDS ========= */}
          <Route
            path="/awards"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <Awards />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ========= USERS ========= */}
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

          <Route
            path="/users/new"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <Users />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/:userId/edit"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.HR]}>
                <DashboardLayout>
                  <UpsertUser />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ========= DEFAULT ========= */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
