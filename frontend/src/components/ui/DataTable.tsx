import React from 'react';
import { cn } from '../../utils/cn';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ data, columns, keyExtractor, className, emptyMessage = "No data available", onRowClick }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return <EmptyState title="No items found" description={emptyMessage} />;
  }

  return (
    <div className={cn("w-full overflow-auto border border-slate-200 rounded-md", className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={cn("px-6 py-3 font-semibold", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr 
              key={keyExtractor(item) || idx} 
              className={cn(
                "bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col, i) => {
                let rendered: React.ReactNode = null;
                if (col.cell) {
                  // Build a hybrid object that satisfies both `item` and `info` (row.original, getValue)
                  const hybrid: any = {
                    ...item,
                    row: { original: item },
                    getValue: () => (col.accessorKey ? (item as any)[col.accessorKey] : undefined),
                  };
                  try {
                    rendered = (col.cell as any)(hybrid);
                  } catch {
                    rendered = (col.cell as any)(item);
                  }
                } else if (col.accessorKey) {
                  const val = (item as any)[col.accessorKey];
                  rendered = val !== undefined && val !== null ? String(val) : null;
                }

                return (
                  <td key={i} className={cn("px-6 py-4 whitespace-nowrap", col.className)}>
                    {rendered}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
