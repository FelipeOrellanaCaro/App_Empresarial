import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/',             label: 'Stock Actual' },
  { to: '/productos',    label: 'Productos' },
  { to: '/movimientos',  label: 'Movimientos' },
];

export function Layout({ children }) {
  return (
    <>
      <header className="header">
        <span className="header-title">Control de Inventario</span>
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
      </header>
      <main className="main">{children}</main>
    </>
  );
}
