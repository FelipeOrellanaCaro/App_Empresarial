import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Stock from './pages/Stock';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"            element={<Stock />} />
          <Route path="/productos"   element={<Productos />} />
          <Route path="/movimientos" element={<Movimientos />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
