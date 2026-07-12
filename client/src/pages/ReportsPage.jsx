/**
 * ReportsPage.jsx — owned by Satyam (feat/audit-reports)
 * Wrapped by DashboardLayout in App.jsx (Laxminarayan owns that).
 * Frozen API: /utilization, /maintenance-frequency, /due-soon
 * No Layout/Sidebar import.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, AlertTriangle, TrendingUp, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

// ── Recharts custom tooltip ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Client-side CSV export ─────────────────────────────────────────────────────
const exportCSV = (rows, filename) => {
  if (!rows?.length) return;
  const keys   = Object.keys(rows[0]);
  const header = keys.join(',');
  const body   = rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(',')).join('\n');
  const blob   = new Blob([`${header}\n${body}`], { type: 'text/csv' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, exportData, children }) {
  return (
    <div className="af-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Icon size={15} className="text-teal" />
          {title}
        </h2>
        {exportData && (
          <button
            onClick={() => exportCSV(exportData, title.toLowerCase().replace(/\s+/g, '_'))}
            className="btn-ghost text-xs py-1.5"
          >
            <Download size={12} /> Export CSV
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Fallback demo data (shown if API not yet running) ─────────────────────────
const DEMO_UTILIZATION = [
  { department: 'Engineering',     allocatedCount: 18, bookingCount: 34 },
  { department: 'Facilities',      allocatedCount: 7,  bookingCount: 21 },
  { department: 'Field Ops',       allocatedCount: 11, bookingCount: 8  },
  { department: 'Unassigned',      allocatedCount: 4,  bookingCount: 5  },
];
const DEMO_MAINTENANCE = [
  { assetTag: 'AF-9935', assetName: 'AF-9935 Monitor', maintenanceCount: 5 },
  { assetTag: 'AF-0112', assetName: 'Dell Laptop',     maintenanceCount: 4 },
  { assetTag: 'AF-0063', assetName: 'Projector',       maintenanceCount: 3 },
  { assetTag: 'AF-0114', assetName: 'Laptop Pro',      maintenanceCount: 2 },
];
const DEMO_DUE_SOON = {
  nearRetirement: [
    { tag: 'AF-0041', name: 'FumiPack-AF-0041', acquisitionDate: '2021-03-01', status: 'Available' },
    { tag: 'AF-0033', name: 'Laptop AF-0033',   acquisitionDate: '2019-08-15', status: 'Allocated' },
  ],
  overdueAllocations: [
    { asset: { tag: 'AF-0021', name: 'Office chair' }, employee: { name: 'Arjun Das' }, expectedReturnDate: new Date(Date.now() - 30 * 86400000) },
  ],
};
const DEMO_HEATMAP = [
  { day: 2, hour: 9, count: 2 },
  { day: 2, hour: 10, count: 5 },
  { day: 3, hour: 11, count: 3 },
  { day: 4, hour: 14, count: 8 },
  { day: 6, hour: 16, count: 4 },
];

const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [utilization, setUtilization] = useState(DEMO_UTILIZATION);
  const [maintenance, setMaintenance] = useState(DEMO_MAINTENANCE);
  const [dueSoon,     setDueSoon]     = useState(DEMO_DUE_SOON);
  const [heatmap,     setHeatmap]     = useState(DEMO_HEATMAP);
  const [loading,     setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [u, m, d, h] = await Promise.all([
        api.get('/reports/utilization'),
        api.get('/reports/maintenance-frequency'),
        api.get('/reports/due-soon'),
        api.get('/reports/heatmap'),
      ]);
      if (u.data?.success && u.data.data?.length)  setUtilization(u.data.data);
      if (m.data?.success && m.data.data?.length)  setMaintenance(m.data.data);
      if (d.data?.success && d.data.data)          setDueSoon(d.data.data);
      if (h.data?.success && h.data.data)          setHeatmap(h.data.data);
      setLastRefresh(new Date());
    } catch {
      // Keep demo data if API is not yet running
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-teal" />
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button className="btn-ghost text-sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5">
        <Section title="Utilization by Department" icon={BarChart3} exportData={utilization}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilization} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="department" tick={{ fill: '#ffffff50', fontSize: 10 }} />
              <YAxis tick={{ fill: '#ffffff50', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#ffffff60' }} />
              <Bar dataKey="allocatedCount" name="Allocated" fill="#2dd4bf" radius={[3, 3, 0, 0]} />
              <Bar dataKey="bookingCount"   name="Bookings"  fill="#14b8a6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Maintenance Frequency" icon={TrendingUp} exportData={maintenance}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={maintenance} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="assetTag" tick={{ fill: '#ffffff50', fontSize: 10 }} />
              <YAxis tick={{ fill: '#ffffff50', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone" dataKey="maintenanceCount" name="Requests"
                stroke="#2dd4bf" strokeWidth={2}
                dot={{ fill: '#2dd4bf', r: 3 }} activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Most-used / Idle */}
      <div className="grid grid-cols-2 gap-5">
        <Section title="Most Used Assets" icon={TrendingUp}>
          <ul className="space-y-2">
            {maintenance.slice(0, 5).map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs w-4">{i + 1}</span>
                  <span className="asset-tag">{item.assetTag}</span>
                  <span className="text-white/70">{item.assetName}</span>
                </div>
                <span className="badge badge-teal">{item.maintenanceCount} trips</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Idle Assets" icon={Clock}>
          <div className="space-y-1 text-xs text-white/40">
            <p>Copier AF-0041 — rotated 80+ days · still usable</p>
            <p>iPad AF-0077 — 0 trips this week · available</p>
          </div>
        </Section>
      </div>

      {/* Due soon */}
      <Section
        title="Assets Due for Maintenance / Nearing Retirement"
        icon={AlertTriangle}
        exportData={[
          ...(dueSoon.nearRetirement || []).map((a) => ({ assetTag: a.tag, name: a.name, reason: 'Near retirement', acquisitionDate: a.acquisitionDate })),
          ...(dueSoon.overdueAllocations || []).map((a) => ({ assetTag: a.asset?.tag, name: a.asset?.name, reason: 'Overdue return', holder: a.employee?.name, dueDate: a.expectedReturnDate })),
        ]}
      >
        <div className="space-y-3">
          {dueSoon.nearRetirement?.length > 0 && (
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Near Retirement (4+ years old)</p>
              <div className="space-y-1.5">
                {dueSoon.nearRetirement.map((a) => (
                  <div key={a.tag} className="flex items-center gap-3 p-2.5 rounded-lg bg-warning/5 border border-warning/20">
                    <AlertTriangle size={13} className="text-warning flex-none" />
                    <span className="asset-tag">{a.tag}</span>
                    <span className="text-sm text-white/70 flex-1">{a.name}</span>
                    <span className="text-xs text-white/40">acquired {fmtDate(a.acquisitionDate)}</span>
                    <span className="badge badge-amber">{daysSince(a.acquisitionDate)}d old</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dueSoon.overdueAllocations?.length > 0 && (
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Overdue Returns</p>
              <div className="space-y-1.5">
                {dueSoon.overdueAllocations.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-danger/5 border border-danger/20">
                    <Clock size={13} className="text-danger flex-none" />
                    <span className="asset-tag">{a.asset?.tag}</span>
                    <span className="text-sm text-white/70 flex-1">{a.asset?.name}</span>
                    <span className="text-xs text-white/50">held by {a.employee?.name}</span>
                    <span className="badge badge-red">{daysSince(a.expectedReturnDate)}d overdue</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!dueSoon.nearRetirement?.length && !dueSoon.overdueAllocations?.length && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 size={15} /> No assets due for maintenance or overdue for return.
            </div>
          )}
        </div>
      </Section>

      {/* Heatmap */}
      <Section title="Booking Heatmap" icon={Clock} exportData={heatmap}>
        <div className="overflow-x-auto pb-4">
          <div className="inline-grid grid-cols-[auto_repeat(24,1fr)] gap-1 text-[10px] text-white/50">
            <div className="col-span-1" />
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="text-center w-5">{i}</div>
            ))}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, dIndex) => (
              <React.Fragment key={dayName}>
                <div className="text-right pr-2">{dayName}</div>
                {Array.from({ length: 24 }).map((_, h) => {
                  const entry = heatmap.find((x) => x.day === dIndex + 1 && x.hour === h);
                  const count = entry?.count || 0;
                  const bg = count > 5 ? 'bg-teal' : count > 2 ? 'bg-teal/60' : count > 0 ? 'bg-teal/30' : 'bg-white/5';
                  return (
                    <div key={h} title={`${count} bookings`} className={`w-5 h-5 rounded ${bg} flex items-center justify-center text-white/80`}>
                      {count > 0 && count}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
