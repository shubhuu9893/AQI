import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data,
  sortBy,
  sortDir,
  onSort,
  rowKey = 'id',
  onRowClick,
  mobileCards = true,
}) {
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  const SortIcon = ({ col }) => {
    if (!onSort || !col.sortable) return null;
    if (sortBy !== col.key) return <ChevronsUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={14} color="var(--primary)" />
      : <ChevronDown size={14} color="var(--primary)" />;
  };

  return (
    <div className="table-wrapper">
      <table className={`data-table ${mobileCards ? 'table-mobile-cards' : ''}`}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                style={{ cursor: col.sortable ? 'pointer' : 'default', textAlign: col.align ?? 'left' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.label}
                  <SortIcon col={col} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr
              key={row[rowKey]}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : undefined }}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  data-label={col.label}
                  style={{ textAlign: col.align ?? 'left' }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
