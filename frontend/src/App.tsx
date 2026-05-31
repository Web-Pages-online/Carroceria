import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agencias from './pages/Agencias';
import Pedidos from './pages/Pedidos';
import Login from './pages/Login';
import Users from './pages/settings/Users';
import Roles from './pages/settings/Roles';
import Permisos from './pages/settings/Permisos';
import Perfil from './pages/Perfil';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, usuario } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAdmin = usuario?.rol_nombre === 'ADMINISTRADOR' || usuario?.rol_nombre === 'Super-Admin' || usuario?.rol?.nombre === 'Super-Admin' || usuario?.rol?.nombre === 'ADMINISTRADOR';
  if (!isAdmin) return <Navigate to="/tablero" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/tablero" replace /> : <Login />} />
        
        {/* Rutas Protegidas */}
        <Route path="/" element={<Navigate to="/tablero" replace />} />
        <Route path="/tablero" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
        <Route path="/agencias" element={<ProtectedRoute><Agencias /></ProtectedRoute>} />
        
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

        {/* Settings Routes - Solo Admin */}
        <Route path="/settings/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/settings/roles" element={<AdminRoute><Roles /></AdminRoute>} />
        <Route path="/settings/permisos" element={<AdminRoute><Permisos /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
