import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { statsApi } from '../api/client';

const AZUL   = '#1a56db';
const VERDE  = '#059669';
const ROJO   = '#dc2626';
const NARANJA = '#d97706';

function KpiCard({ label, value, color, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div>
        <div className="kpi-value" style={{ color }}>{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    statsApi.get()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-msg">Cargando estadísticas...</div>;
  if (error)   return <div className="error-msg" style={{ padding: 20 }}>{error}</div>;

  const { kpis, stock_por_categoria, movimientos_por_mes } = stats;

  return (
    <section>
      <div className="section-header">
        <h2>Dashboard</h2>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard label="Total productos"    value={kpis.total_productos}    color={AZUL}    icon="📦" />
        <KpiCard label="Productos críticos" value={kpis.productos_criticos} color={NARANJA} icon="⚠️" />
        <KpiCard label="Agotados"           value={kpis.productos_agotados} color={ROJO}    icon="🚫" />
        <KpiCard label="Entradas este mes"  value={kpis.entradas_mes}       color={VERDE}   icon="📥" />
        <KpiCard label="Salidas este mes"   value={kpis.salidas_mes}        color={ROJO}    icon="📤" />
      </div>

      <div className="charts-grid">
        {/* Stock por categoría */}
        <div className="chart-card">
          <h3 className="chart-titulo">Stock por categoría</h3>
          {stock_por_categoria.length === 0 ? (
            <p className="empty-msg">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stock_por_categoria} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="stock_total" name="Stock" fill={AZUL} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Movimientos por mes */}
        <div className="chart-card">
          <h3 className="chart-titulo">Movimientos últimos 6 meses</h3>
          {movimientos_por_mes.length === 0 ? (
            <p className="empty-msg">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={movimientos_por_mes} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entradas" name="Entradas" stroke={VERDE}  strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="salidas"  name="Salidas"  stroke={ROJO}   strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
