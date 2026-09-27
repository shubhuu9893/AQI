import React, { useState, useEffect, useContext } from 'react';
import {
  Heart, Wind, Users, Baby, UserCheck, HardHat,
  AlertCircle, CheckCircle, Info, ShieldAlert,
} from 'lucide-react';
import { getHealthImpacts, getAirQuality } from '../services/api';
import { AQI_CATEGORIES } from '../data/demoData';
import { AppContext } from '../context/AppContext';
import ProgressBar from '../components/common/ProgressBar';
import AQIStatusBadge from '../components/common/AQIStatusBadge';
import { SkeletonCard } from '../components/common/Skeleton';

const GROUP_ICONS = {
  'General Population':    Users,
  'Children':              Baby,
  'Older Adults':          UserCheck,
  'Respiratory Conditions':Wind,
  'Heart Conditions':      Heart,
  'Outdoor Workers':       HardHat,
};

const RISK_PALETTE = {
  low:      { bg: 'var(--aqi-good-bg)',           color: 'var(--aqi-good)',           text: 'var(--aqi-good-text)' },
  moderate: { bg: 'var(--aqi-moderate-bg)',       color: 'var(--aqi-moderate)',       text: 'var(--aqi-moderate-text)' },
  high:     { bg: 'var(--aqi-unhealthy-bg)',      color: 'var(--aqi-unhealthy)',      text: 'var(--aqi-unhealthy-text)' },
};

const POLLUTANT_HEALTH = [
  { id: 'PM2.5', icon: '', label: 'PM2.5 -- Fine Particles', effect: 'Penetrates deep into lungs; linked to respiratory and cardiovascular disease with prolonged exposure.', severity: 65 },
  { id: 'PM10',  icon: '', label: 'PM10 -- Coarse Particles', effect: 'Can irritate airways and eyes; risk higher for people with asthma or allergies.', severity: 45 },
  { id: 'NO2',   icon: '', label: 'NO2 -- Nitrogen Dioxide', effect: 'Inflames airways; prolonged exposure may reduce lung function. Generated mainly by traffic.', severity: 38 },
  { id: 'SO2',   icon: '', label: 'SO2 -- Sulphur Dioxide', effect: 'Causes bronchoconstriction; particularly harmful for those with asthma.', severity: 22 },
  { id: 'O3',    icon: '??', label: 'O3 -- Ground-level Ozone', effect: 'Can trigger chest pain, coughing, and airway inflammation; peaks on sunny days.', severity: 42 },
  { id: 'CO',    icon: '', label: 'CO -- Carbon Monoxide', effect: 'Reduces blood oxygen capacity; high concentrations can be life-threatening.', severity: 18 },
];

function GroupCard({ group }) {
  const Icon = GROUP_ICONS[group.group] ?? Users;
  const pal  = RISK_PALETTE[group.risk] ?? RISK_PALETTE.moderate;

  return (
    <div
      className="card card-pad"
      style={{ borderTop: `3px solid ${pal.color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: pal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={pal.color} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{group.group}</div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: pal.color, background: pal.bg, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            {group.riskLabel}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        {group.guidance}
      </p>
      {group.caution && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--warning-dark)', background: 'var(--warning-light)', padding: '6px 10px', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={12} />
          Take extra precautions
        </div>
      )}
    </div>
  );
}

export default function Health() {
  const { lat, lon } = useContext(AppContext);
  const [impacts, setImpacts] = useState([]);
  const [currentAQI, setAQI]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getHealthImpacts(),
      getAirQuality(lat, lon).catch(() => null),
    ]).then(([i, aq]) => {
      setImpacts(i);
      if (aq?.aqi != null) setAQI(aq.aqi);
      setLoading(false);
    });
  }, [lat, lon]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Health Impact</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Understanding how air quality affects health -- informational only, not medical advice.
        </p>
      </div>

      {/* Overview banner */}
      {loading ? <SkeletonCard lines={4} /> : currentAQI != null && (
        <div className="card" style={{ padding: 'var(--space-6)',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
          display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Current Air Quality
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <AQIStatusBadge aqi={currentAQI} size="lg" />
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>AQI {currentAQI}</span>
            </div>
            <ProgressBar value={currentAQI} max={500} color="var(--aqi-usg)" height={8} />
          </div>
          <div style={{ flex: 2, minWidth: 280 }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={14} color="var(--primary)" />
              General Guidance
            </div>
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--warning)', display: 'flex', gap: 8 }}>
              <AlertCircle size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--warning-dark)', margin: 0, lineHeight: 1.5 }}>
                Refer to the category table below for guidance specific to the current AQI level.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AQI Categories reference */}
      <div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>AQI Health Risk Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {AQI_CATEGORIES.map(cat => (
            <div
              key={cat.range}
              className="card"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
            >
              <div style={{ width: 16, height: 16, borderRadius: 4, background: cat.color, flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: cat.color, width: 72 }}>
                {cat.range}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', width: 240 }}>
                {cat.label}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', flex: 1 }}>
                {cat.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitive group cards */}
      <div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Impact by Population Group</h3>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} lines={4} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            {impacts.map(g => <GroupCard key={g.group} group={g} />)}
          </div>
        )}
      </div>

      {/* Pollutant health impacts */}
      <div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Pollutant Health Effects</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POLLUTANT_HEALTH.map(p => (
            <div key={p.id} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }} aria-hidden="true">{p.icon}</span>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: 1 }}>{p.label}</div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  Severity: {p.severity}/100
                </span>
              </div>
              <ProgressBar value={p.severity} max={100} color={p.severity > 60 ? 'var(--danger)' : p.severity > 35 ? 'var(--warning)' : 'var(--success)'} height={5} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.6 }}>
                {p.effect}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--info-light)',
          border: '1px solid var(--info)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
        role="note"
      >
        <ShieldAlert size={18} color="var(--info)" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--info-dark)', margin: 0, lineHeight: 1.6 }}>
          <strong>Important:</strong> This page provides general informational content about air quality and health. It does not constitute medical advice, diagnosis, or treatment recommendations. Consult a qualified healthcare professional for personal health guidance.
        </p>
      </div>
    </div>
  );
}
