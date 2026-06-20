import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

import LoginForm from '../features/auth/components/LoginForm';
import Dashboard from '../features/dashboard/components/Dashboard';

import AdminLayout from '../layouts/AdminLayout';
import PaymentView from '../features/admin-views/payments/PaymentView';
import InventoryView from '../features/admin-views/inventory/InventoryView';
import UsersView from '../features/admin-views/users/UsersView';

import ClientLayout from '../layouts/ClientLayout';
import PerfilClient from '../features/users/client-views/PerfilClient';
import RoutinesClient from '../features/routines/client-views/RoutinesClient';
import ProgressClient from '../features/progress/ProgressClient';

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          
          {/* Rutas de Administrador */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="payments" element={<PaymentView />} />
            <Route path="inventory" element={<InventoryView />} />
            <Route path="users" element={<UsersView />} />
          </Route>

          {/* Rutas de Cliente */}
          <Route path="/client" element={
            <ProtectedRoute allowedRole="client">
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/client/perfil" replace />} />
            <Route path="perfil" element={<PerfilClient />} />
            <Route path="routines" element={<RoutinesClient />} />
            <Route path="progress" element={<ProgressClient />} />
          </Route>

          {/* Ruta por defecto en caso de acceder a una URL que no existe */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
