import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, AlertTriangle, TrendingUp, Clock, RefreshCw, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const getErrorMessage = (err) => {
  if (!err || !err.response) return 'Network connection lost. Please try again.';
  const status = err.response.status;
  if (status === 401) return 'Session expired.';
  if (status === 403) return 'Permission denied.';
  if (status >= 500) return 'Internal server error.';
  return err.response?.data?.message || 'Unexpected error.';
};

// ── Recharts custom tooltip ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1c23] border border-white/10 rounded-lg p-3 text-xs shadow-2xl">
      <p className="text-white/60 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-3 mb-1 last:mb-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white/80">{p.name}:</span>
          <span className="text-white font-bold ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Client-side CSV export ─────────────────────────────────────────────────────
const exportCSV = (rows, filename) => {
  if (!rows?.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(',');
  const body = rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(',')).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, exportData, children, className = '', error = null }) {
  return (
    <div className={`af-card bg-[#1a1c23] border border-white/10 shadow-lg flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-5 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <div className="p-1.5 bg-teal/10 rounded-lg">
              <Icon size={16} className="text-teal" />
            </div>
            {title}
          </h2>
          {subtitle && <p className="text-xs text-white/40 mt-1 ml-9">{subtitle}</p>}
        </div>
        {exportData && exportData.length > 0 && (
          <button
            onClick={() => exportCSV(exportData, title.toLowerCase().replace(/\s+/g, '_'))}
            className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-2 border border-transparent hover:border-white/10 transition-all bg-white/[0.02]"
          >
            <Download size={14} /> Export
          </button>
        )}
      </div>
      <div className="flex-1 relative">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-danger/70 bg-[#1a1c23]/80 rounded-b-xl z-10 p-4 text-center">
            <AlertCircle size={24} className="mb-2 opacity-50" />
            <p className="text-sm">{error}</p>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [utilization, setUtilization] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [dueSoon, setDueSoon] = useState({ nearRetirement: [], overdueAllocations: [] });
  const [heatmap, setHeatmap] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [errors, setErrors] = useState({ u: '', m: '', d: '', h: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors({ u: '', m: '', d: '', h: '' });
    
    // Fire all requests concurrently and wait for all to settle
    const [u, m, d, h] = await Promise.allSettled([
      api.get('/reports/utilization'),
      api.get('/reports/maintenance-frequency'),
      api.get('/reports/due-soon'),
      api.get('/reports/heatmap'),
    ]);
    
    // Safely update state without crashing the page if one fails
    if (u.status === 'fulfilled' && u.value.data?.success) setUtilization(u.value.data.data || []);
    else setErrors(prev => ({ ...prev, u: getErrorMessage(u.reason) }));

    if (m.status === 'fulfilled' && m.value.data?.success) setMaintenance(m.value.data.data || []);
    else setErrors(prev => ({ ...prev, m: getErrorMessage(m.reason) }));

    if (d.status === 'fulfilled' && d.value.data?.success) setDueSoon(d.value.data.data || { nearRetirement: [], overdueAllocations: [] });
    else setErrors(prev => ({ ...prev, d: getErrorMessage(d.reason) }));

    if (h.status === 'fulfilled' && h.value.data?.success) setHeatmap(h.value.data.data || []);
    else setErrors(prev => ({ ...prev, h: getErrorMessage(h.reason) }));
    
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Compute dynamic insights safely
  const maxMaintAsset = maintenance.length > 0 ? maintenance.reduce((prev, curr) => ((prev.maintenanceCount || 0) > (curr.maintenanceCount || 0)) ? prev : curr) : null;
  const highestUtilizedDept = utilization.length > 0 ? utilization.reduce((prev, curr) => ((prev.allocatedCount || 0) + (prev.bookingCount || 0) > (curr.allocatedCount || 0) + (curr.bookingCount || 0)) ? prev : curr) : null;
  const totalOverdue = (dueSoon.overdueAllocations || []).length;
  const totalRetiring = (dueSoon.nearRetirement || []).length;

  const hasAnyDataError = Object.values(errors).some(err => err !== '');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-teal/10 rounded-xl">
              <BarChart3 size={24} className="text-teal" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reports &amp; Analytics</h1>
          </div>
          <p className="text-sm text-white/50 max-w-xl leading-relaxed">
            Data-driven insights into asset utilization, maintenance patterns, and lifecycle management.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-white/40">Last updated: {lastRefresh.toLocaleTimeString()}</p>
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {hasAnyDataError && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3 mb-6 animate-in slide-in-from-top-2">
          <AlertTriangle size={18} className="text-warning flex-none mt-0.5" />
          <p className="text-sm text-warning/90">
            Some dashboard widgets failed to load data due to network issues. The available data is shown below.
          </p>
        </div>
      )}

      {loading && utilization.length === 0 && maintenance.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-white/40">
          <RefreshCw size={32} className="animate-spin text-teal/30 mb-4" />
          <p>Generating reports...</p>
        </div>
      ) : (
        <>
          {/* Key Observations Panel */}
          <div className="bg-gradient-to-r from-teal/10 to-transparent border-l-4 border-teal rounded-r-xl p-5 mb-6 flex items-start gap-4 shadow-md">
            <Info size={20} className="text-teal flex-none mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Key Observations</h3>
              <ul className="text-sm text-white/70 space-y-1.5 list-disc list-inside marker:text-teal/50">
                {highestUtilizedDept ? (
                  <li><strong>{highestUtilizedDept.department || 'Unassigned'}</strong> has the highest overall asset utilization ({highestUtilizedDept.allocatedCount || 0} allocated, {highestUtilizedDept.bookingCount || 0} bookings).</li>
                ) : <li>No utilization anomalies detected.</li>}
                
                {maxMaintAsset ? (
                  <li>Asset <strong>{maxMaintAsset.assetName || 'Unknown'} ({maxMaintAsset.assetTag || 'N/A'})</strong> requires the most maintenance ({maxMaintAsset.maintenanceCount || 0} requests).</li>
                ) : <li>No maintenance anomalies detected.</li>}
                
                {totalOverdue > 0 ? (
                  <li className="text-warning">Action required: <strong>{totalOverdue}</strong> assets are currently overdue for return.</li>
                ) : <li>All active allocations are within their expected return dates.</li>}
                
                {totalRetiring > 0 && (
                  <li><strong>{totalRetiring}</strong> assets are approaching the end of their 4-year lifecycle.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-6">
            <Section 
              title="Utilization by Department" 
              subtitle="Comparison of permanent allocations vs temporary bookings"
              icon={BarChart3} 
              exportData={utilization}
              error={errors.u}
            >
              {utilization.length === 0 && !errors.u ? (
                <div className="h-48 flex items-center justify-center text-sm text-white/30">No utilization data</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={utilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis dataKey="department" tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#ffffff05' }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} iconType="circle" />
                    <Bar dataKey="allocatedCount" name="Allocated" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="bookingCount" name="Bookings" fill="#115e59" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            <Section 
              title="Maintenance Frequency" 
              subtitle="Top assets by volume of maintenance requests"
              icon={TrendingUp} 
              exportData={maintenance}
              error={errors.m}
            >
              {maintenance.length === 0 && !errors.m ? (
                <div className="h-48 flex items-center justify-center text-sm text-white/30">No maintenance data</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={maintenance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis dataKey="assetTag" tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone" dataKey="maintenanceCount" name="Requests"
                      stroke="#2dd4bf" strokeWidth={3}
                      dot={{ fill: '#1a1c23', stroke: '#2dd4bf', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>

          {/* Actionable Lists */}
          <div className="grid grid-cols-2 gap-6">
            <Section title="Most Used Assets" subtitle="High maintenance volume" icon={TrendingUp} error={errors.m}>
              {maintenance.length === 0 && !errors.m ? (
                <div className="py-8 text-center text-sm text-white/30">No assets with maintenance history</div>
              ) : (
                <ul className="space-y-2">
                  {maintenance.slice(0, 5).map((item, i) => (
                    <li key={i} className="flex items-center justify-between text-sm p-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-white/20 text-xs w-4 font-mono">{i + 1}</span>
                        <span className="asset-tag font-mono">{item.assetTag || '—'}</span>
                        <span className="text-white/80 font-medium truncate max-w-[150px]">{item.assetName || 'Unknown'}</span>
                      </div>
                      <span className="badge badge-teal bg-teal/10">{item.maintenanceCount || 0} trips</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section
              title="Assets Due for Maintenance / Nearing Retirement"
              subtitle="Requires immediate attention"
              icon={AlertTriangle}
              error={errors.d}
              exportData={[
                ...(dueSoon.nearRetirement || []).map((a) => ({ assetTag: a.tag, name: a.name, reason: 'Near retirement', acquisitionDate: a.acquisitionDate })),
                ...(dueSoon.overdueAllocations || []).map((a) => ({ assetTag: a.asset?.tag, name: a.asset?.name, reason: 'Overdue return', holder: a.employee?.name, dueDate: a.expectedReturnDate })),
              ]}
            >
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {dueSoon.nearRetirement?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-2 uppercase tracking-wider font-semibold">Near Retirement (4+ years old)</p>
                    <div className="space-y-2">
                      {dueSoon.nearRetirement.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20 transition-all hover:bg-warning/20">
                          <AlertTriangle size={16} className="text-warning flex-none" />
                          <span className="asset-tag font-mono text-xs">{a.tag || '—'}</span>
                          <span className="text-sm text-white/90 flex-1 font-medium truncate">{a.name || 'Unknown'}</span>
                          <span className="badge badge-amber text-xs">{daysSince(a.acquisitionDate)}d old</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dueSoon.overdueAllocations?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-2 uppercase tracking-wider font-semibold">Overdue Returns</p>
                    <div className="space-y-2">
                      {dueSoon.overdueAllocations.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20 transition-all hover:bg-danger/20">
                          <Clock size={16} className="text-danger flex-none" />
                          <span className="asset-tag font-mono text-xs">{a.asset?.tag || '—'}</span>
                          <span className="text-sm text-white/90 flex-1 font-medium truncate">{a.asset?.name || 'Unknown'}</span>
                          <span className="text-xs text-white/50 truncate max-w-[100px]">held by {a.employee?.name || 'Unknown'}</span>
                          <span className="badge badge-red text-xs">{daysSince(a.expectedReturnDate)}d overdue</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!dueSoon.nearRetirement?.length && !dueSoon.overdueAllocations?.length && !errors.d && (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-sm text-success">
                    <CheckCircle2 size={32} className="text-success/50" /> 
                    <p className="font-medium text-success/80">No actionable assets</p>
                    <p className="text-white/40 text-xs">All assets are within their expected lifecycle.</p>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* Heatmap */}
          <Section title="Booking Heatmap" subtitle="Density of asset bookings by day and hour" icon={Clock} exportData={heatmap} error={errors.h}>
            {heatmap.length === 0 && !errors.h ? (
              <div className="py-12 text-center text-sm text-white/30">No booking heatmap data available</div>
            ) : (
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex items-center justify-end gap-3 mb-4 text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <span className="w-4 h-4 rounded-sm bg-white/5 border border-black/20" title="0 bookings" />
                    <span className="w-4 h-4 rounded-sm bg-teal/20 border border-black/20" title="1-2 bookings" />
                    <span className="w-4 h-4 rounded-sm bg-teal/50 border border-black/20" title="3-5 bookings" />
                    <span className="w-4 h-4 rounded-sm bg-teal/80 border border-black/20" title="6-8 bookings" />
                    <span className="w-4 h-4 rounded-sm bg-teal border border-black/20" title="9+ bookings" />
                  </div>
                  <span>More</span>
                </div>
                <div className="inline-grid grid-cols-[auto_repeat(24,1fr)] gap-1 text-xs text-white/50 font-mono">
                  <div className="col-span-1" />
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="text-center w-6">{i}</div>
                  ))}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, dIndex) => (
                    <React.Fragment key={dayName}>
                      <div className="text-right pr-3 font-medium text-white/60 self-center">{dayName}</div>
                      {Array.from({ length: 24 }).map((_, h) => {
                        const entry = heatmap.find((x) => x.day === dIndex + 1 && x.hour === h);
                        const count = entry?.count || 0;
                        const bg = count > 8 ? 'bg-teal' : count > 5 ? 'bg-teal/80' : count > 2 ? 'bg-teal/50' : count > 0 ? 'bg-teal/20' : 'bg-white/5';
                        return (
                          <div 
                            key={h} 
                            title={`${count} bookings`} 
                            className={`w-6 h-6 rounded-sm ${bg} flex items-center justify-center text-white/90 text-[10px] transition-transform hover:scale-110 hover:z-10 cursor-crosshair border border-black/20`}
                          >
                            {count > 0 && count}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
