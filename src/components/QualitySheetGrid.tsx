import React, { useState } from 'react';
import { 
  Plus, Trash2, Copy, Download, Search, Send, Calculator, AlertCircle 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { QualityRow, ColumnKey, QaSheetType } from '../types';

interface QualitySheetGridProps {
  rows: QualityRow[];
  sheetType: QaSheetType;
  onChangeRows: (newRows: QualityRow[]) => void;
  onSelectCellCrop: (rowIndex: number, column: ColumnKey) => void;
  onOpenSapSync: () => void;
  hasOriginalImage: boolean;
  reportId?: string;
}

export { SHEET_COLUMNS } from '../lib/constants';
import { SHEET_COLUMNS } from '../lib/constants';

export const QualitySheetGrid: React.FC<QualitySheetGridProps> = ({
  rows,
  sheetType,
  onChangeRows,
  onSelectCellCrop,
  onOpenSapSync,
  hasOriginalImage,
  reportId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const activeColumns = SHEET_COLUMNS[sheetType] || SHEET_COLUMNS['in_process'];

  const handleCellChange = (rowIndex: number, colKey: string, value: string) => {
    const updated = [...rows];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [colKey]: value,
    };
    onChangeRows(updated);
  };

  const handleAddRow = () => {
    const newRow: QualityRow = {};
    for (const c of activeColumns) {
      if (c.key === 'Sr. No.' || c.key === 'sr no') {
        newRow[c.key] = rows.length + 1;
      } else {
        newRow[c.key] = '';
      }
    }
    onChangeRows([...rows, newRow]);
  };

  const handleDuplicateRow = (idx: number) => {
    const target = rows[idx];
    const duplicated: QualityRow = { ...target };
    if ('Batch Number' in duplicated) {
      duplicated['Batch Number'] = `${duplicated['Batch Number'] || ''}-DUP`;
    } else if ('B.NO' in duplicated) {
      duplicated['B.NO'] = `${duplicated['B.NO'] || ''}-DUP`;
    } else if ('Batch No.' in duplicated) {
      duplicated['Batch No.'] = `${duplicated['Batch No.'] || ''}-DUP`;
    }
    const nextRows = [...rows];
    nextRows.splice(idx + 1, 0, duplicated);
    onChangeRows(nextRows);
  };

  const handleDeleteRow = (idx: number) => {
    const filtered = rows.filter((_, i) => i !== idx);
    onChangeRows(filtered);
  };

  const handleExportExcel = () => {
    if (rows.length === 0) return;
    const cleanData = rows.map((r) => {
      const rowObj: Record<string, any> = {};
      for (const c of activeColumns) {
        rowObj[c.label] = r[c.key] !== undefined ? r[c.key] : '';
      }
      return rowObj;
    });
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quality_Report');
    XLSX.writeFile(workbook, `Morde_${sheetType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredRows = rows.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(r).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col transition-all">
      
      {/* Supabase-style Toolbar */}
      <div className="px-4 py-3 border-b border-neutral-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
        
        {/* Search */}
        <div className="flex items-center space-x-2.5">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Filter batch, product, or readings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white rounded-lg border border-neutral-200/90 focus:border-neutral-900 focus:outline-none transition text-neutral-900 placeholder:text-neutral-400 font-sans"
            />
          </div>
          <span className="text-[11px] font-mono text-neutral-400 px-2 py-1 rounded bg-neutral-100/70 hidden sm:inline-block">
            {filteredRows.length} {filteredRows.length === 1 ? 'row' : 'rows'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddRow}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-sm transition"
            title="Add new row"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-500" />
            <span>Add Row</span>
          </button>
        </div>

      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto max-h-[650px] relative">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-sm border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px] tracking-wider font-mono">
            <tr>
              <th className="py-2.5 px-2 text-center w-10">#</th>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2.5 px-3 ${col.minWidth || 'min-w-[90px]'}`}
                >
                  {col.label}
                </th>
              ))}
              <th className="py-2.5 px-2 text-center w-14"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-neutral-50/70 transition-colors group"
              >
                <td className="py-2 px-2 text-center text-neutral-400 font-mono text-[11px]">
                  {rowIdx + 1}
                </td>

                {activeColumns.map((col) => {
                  const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';
                  const isBatchOrCode = col.key.toLowerCase().includes('batch') || col.key.toLowerCase().includes('code') || col.key === 'B.NO';
                  const needsReview = Array.isArray(row._review_flags) && row._review_flags.includes(col.key);

                  return (
                    <td key={col.key} className="py-1 px-1.5">
                      <input
                        type="text"
                        value={val}
                        placeholder="—"
                        onChange={(e) => handleCellChange(rowIdx, col.key, e.target.value)}
                        title={needsReview ? 'This value needs review: invalid or out of range for this field' : undefined}
                        className={`w-full px-2 py-1 text-xs rounded border ${needsReview ? 'border-amber-400 bg-amber-50' : 'border-transparent'} hover:border-neutral-200 focus:border-neutral-900 focus:bg-white focus:outline-none transition ${
                          isBatchOrCode ? 'font-mono font-semibold text-neutral-900' : 'text-neutral-700'
                        } ${!val ? 'placeholder:text-neutral-300' : ''}`}
                      />
                    </td>
                  );
                })}

                <td className="py-2 px-2 text-center">
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDuplicateRow(rowIdx)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                      title="Duplicate row"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteRow(rowIdx)}
                      className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredRows.length === 0 && (
          <div className="py-14 text-center text-neutral-400 text-xs">
            No quality records loaded. Click &quot;Scan Document&quot; above to scan a lab quality sheet.
          </div>
        )}
      </div>

    </div>
  );
};
