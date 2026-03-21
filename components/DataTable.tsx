import React from 'react';

interface DataTableProps {
    data: any[];
}

export default function DataTable({ data }: DataTableProps) {
    if (!data || data.length === 0) return <p className="no-data">No results found.</p>;

    const columns = Object.keys(data[0]);

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {columns.map((col) => (
                                <td key={col}>{row[col] ?? 'NULL'}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
