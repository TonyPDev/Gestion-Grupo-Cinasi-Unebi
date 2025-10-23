import react from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/admin/UserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ActivityLogViewer from "./pages/admin/ActivityLogViewer";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import ClinicaDashboard from "./pages/modules/ClinicaDashboard";
import ComercialDashboard from "./pages/modules/ComercialDashboard";
import TIDashboard from "./pages/modules/TIDashboard";
import UnebiKeyManagement from "./pages/unebi/UnebiKeyManagement";
import AdministracionDashboard from "./pages/modules/AdministracionDashboard";
import Requisiciones from "./pages/administracion/Requisiciones";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gestion-usuarios"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/administracion/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRACION", "ADMIN"]}>
              <MainLayout>
                <AdministracionDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta para el Módulo de Requisiciones */}
        <Route
          path="/administracion/requisiciones"
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRACION", "ADMIN"]}>
              <MainLayout>
                <Requisiciones />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinica/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CLINICA", "ADMIN"]}>
              <MainLayout>
                <ClinicaDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comercial/dashboard"
          element={
            <ProtectedRoute allowedRoles={["COMERCIAL", "ADMIN"]}>
              <MainLayout>
                <ComercialDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ti/dashboard"
          element={
            <ProtectedRoute allowedRoles={["TI", "ADMIN"]}>
              <MainLayout>
                <TIDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/unebi/gestion-claves"
          element={
            <ProtectedRoute
              allowedRoles={["CLINICA", "COMERCIAL", "TI", "ADMIN"]}
            >
              <MainLayout>
                <UnebiKeyManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-log"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MainLayout>
                <ActivityLogViewer />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/logout" element={<Logout />}></Route>
        <Route
          path="/register"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
