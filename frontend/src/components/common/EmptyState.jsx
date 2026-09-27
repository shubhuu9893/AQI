import React from 'react';
import { SearchX, Database } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon,
  title = 'No data found',
  description = 'Try adjusting your filters or search terms.',
  action,
  actionLabel = 'Clear filters',
}) {
  const Icon = icon ?? SearchX;
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <div>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 'var(--text-sm)' }}>{description}</p>
      </div>
      {action && (
        <Button variant="secondary" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
