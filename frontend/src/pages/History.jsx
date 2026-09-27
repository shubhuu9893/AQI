import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Download, FileText, RotateCcw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getHistory, exportCSV, exportPDF } from '../services/api';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import AQIStatusBadge from '../components/common/AQIStatusBadge';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { formatDate } from '../utils/formatters';

const PAGE_SIZE = 15;

const LOCATIONS = ['all', 'Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];

const COLUMNS = [
  { key: 'date',     label: 'Date',     sortable: true, render: v => formatDate(v) },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'aqi',      label: 'AQI',      sortable: true,
    render: (v, row) => <span style={{ fontWeight: 700, color: `var(--aqi-${row.categoryClass})` }}>{v}</span> },
  { key: 'pm25', label: 'PM2.5', sortable: true, render: v => `${v} ug/m3` },
  { key: 'pm10', label: 'PM10',  sortable: true, render: v => `${v} ug/m3` },
  { key: 'no2',  label: 'NO2',   sortable: true, render: v => `${v} ug/m3` },
  { key: 'category', label: 'Status', render: (_, row) => <AQIStatusBadge aqi={row.aqi} /> },
];

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card card-pad" style={{ flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: color ?? 'var(--text-primary)', lineHeight: 1 }}>{value ?? '--'}</div>
      {sub && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function History() {
  const { selectedCity } = useContext(AppContext);

  const [allRows, setAllRows]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [location, setLocation]   = useState('all');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [aqiMin, setAqiMin]       = useState('');
  const [aqiMax, setAqiMax]       = useState('');
  const [sortBy, setSortBy]       = useState('date');
  const [sortDir, setSortDir]     = useState('desc');
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getHistory({
        location: location !== 'all' ? location : undefined,
        dateFrom: dateFrom || undefined,
        dateTo:   dateTo   || undefined,
        sortBy:   sortDir === 'desc' ? 'newest' : 'oldest',
      });
      setAllRows(rows);
    } catch (err) {
      setError(err.message ?? 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [location, dateFrom, dateTo, sortDir]);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side secondary filter (AQI range, search, sort by column)
  const filtered = useMemo(() => {
    let rows = [...allRows];
    if (search) rows = rows.filter(r => r.location.toLowerCase().includes(search.toLowerCase()));
    if (aqiMin)  rows = rows.filter(r => r.aqi >= Number(aqiMin));
    if (aqiMax)  rows = rows.filter(r => r.aqi <= Number(aqiMax));
    rows.sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      const d = sortDir === 'asc' ? 1 : -1;
      return av < bv ? -d : av > bv ? d : 0;
    });
    return rows;
  }, [allRows, search, aqiMin, aqiMax, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const aqis = filtered.map(r => r.aqi).filter(Boolean);
    if (!aqis.length) return null;
    return {
      avg: Math.round(aqis.reduce((a, b) => a + b, 0) / aqis.length),
      max: Math.max(...aqis),
      min: Math.min(...aqis),
      days: filtered.length,
    };
  }, [filtered]);

  const chartData = useMemo(() =>
    [...filtered].reverse().slice(0, 30).map(r => ({ time: r.date?.slice(5) ?? '', aqi: r.aqi })),
    [filtered]
  );

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setLocation('all');
    setDateFrom(''); setDateTo('');
    setAqiMin(''); setAqiMax('');
    setPage(1);
  };

  const currentCity = location !== 'all' ? location : 'Pune';

  const handleExportCSV = async () => { setExporting(true); await exportCSV(filtered, currentCity); setExporting(false); };
  const handleExportPDF = async () => { setExporting(true); await exportPDF(filtered, currentCity); setExporting(false); };

  if (error && !allRows.length) return <ErrorState title="Unable to load history" description={error} onRetry={loadData} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Historical Air Quality</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Browse and analyse past measurements</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} disabled={exporting || !filtered.length}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportPDF} disabled={exporting || !filtered.length}>
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="label" htmlFor="hist-search">Search Location</label>
            <SearchInput id="hist-search" value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Filter..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="label" htmlFor="hist-loc">Location</label>
            <select id="hist-loc" className="select" value={location} onChange={e => { setLocation(e.target.value); setPage(1); }}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l === 'all' ? 'All Locations' : l}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="label" htmlFor="hist-from">Date From</label>
            <input id="hist-from" type="date" className="input" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="label" htmlFor="hist-to">Date To</label>
            <input id="hist-to" type="date" className="input" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="label" htmlFor="hist-aqimin">Min AQI</label>
            <input id="hist-aqimin" type="number" className="input" placeholder="0"   value={aqiMin} onChange={e => { setAqiMin(e.target.value); setPage(1); }} min={0} max={500} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="label" htmlFor="hist-aqimax">Max AQI</label>
            <input id="hist-aqimax" type="number" className="input" placeholder="500" value={aqiMax} onChange={e => { setAqiMax(e.target.value); setPage(1); }} min={0} max={500} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}><RotateCcw size={14} /> Reset</button>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} records</span>
        </div>
      </div>

      {/* Stats */}
      {!loading && stats && (
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <StatCard label="Average AQI"     value={stats.avg}  sub="over period" />
          <StatCard label="Maximum AQI"     value={stats.max}  color="var(--danger)"  sub="highest" />
          <StatCard label="Minimum AQI"     value={stats.min}  color="var(--success)" sub="lowest" />
          <StatCard label="Days Monitored"  value={stats.days} sub="total records" />
        </div>
      )}

      {/* Trend chart */}
      {!loading && chartData.length > 0 && (
        <div className="card card-pad">
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>AQI Trend</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis  tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-muted)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="aqi" stroke="#6366f1" strokeWidth={2} fill="url(#histGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Historical Records</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Page {page} of {Math.max(totalPages, 1)}</span>
        </div>

        {loading
          ? <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} lines={1} />)}
            </div>
          : filtered.length === 0
            ? <EmptyState title="No records found" description="Try adjusting location or date filters." action={resetFilters} actionLabel="Clear filters" />
            : <DataTable columns={COLUMNS} data={pageRows} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
        }

        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
            <Pagination page={page} totalPages={totalPages} onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </div>
        )}
      </div>
    </div>
  );
}
