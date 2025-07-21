import React from "react";

/**
 * Custom Table component for displaying tabular data.
 * @param {Array} columns - Array of { key, label } objects.
 * @param {Array} data - Array of row objects.
 * @param {string} [className] - Optional additional class names.
 */
export default function Table({ columns, data, className = "" }) {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 border-b font-medium text-left bg-muted/50"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-muted-foreground"
              >
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row._id || row.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
                    {row[col.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
