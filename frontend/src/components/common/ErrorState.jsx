import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Unable to load data',
  description = 'Something went wrong while loading the data.',
  onRetry,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ background: 'var(--danger-light)' }}>
        <AlertTriangle size={28} color="var(--danger)" />
      </div>
      <div>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 'var(--text-sm)' }}>{description}</p>
      </div>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
