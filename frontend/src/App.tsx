import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agencias from './pages/Agencias';
import Inventario from './pages/Inventario';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/tablero" replace />} />
          <Route path="/tablero" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/agencias" element={<Agencias />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
