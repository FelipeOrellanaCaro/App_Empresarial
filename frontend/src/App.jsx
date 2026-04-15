import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Stock from './pages/Stock';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';

function ProtectedRoute({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { autenticado } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={autenticado ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/"            element={<Stock />} />
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/productos"   element={<Productos />} />
              <Route path="/movimientos" element={<Movimientos />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
