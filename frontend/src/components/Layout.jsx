import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/',             label: 'Stock' },
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/productos',    label: 'Productos' },
  { to: '/movimientos',  label: 'Movimientos' },
];

export function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="header">
        <span className="header-title">📦 Inventario</span>
        <nav className="nav">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => 'tab-btn' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-usuario">
          <span className="usuario-nombre">{usuario?.nombre}</span>
          <span className={`rol-badge ${usuario?.rol}`}>{usuario?.rol}</span>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </header>
      <main className="main">{children}</main>
    </>
  );
}
