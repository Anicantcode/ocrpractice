import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Crosshair, Check, Sparkles } from 'lucide-react';
import { ColumnKey, QualityRow } from '../types';

interface InspectionCropViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  selectedRow: QualityRow | null;
  selectedCol: ColumnKey | null;
}

export const InspectionCropViewer: React.FC<InspectionCropViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  selectedRow,
  selectedCol,
}) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !imageUrl) return null;

  const cropInfo = selectedCol && selectedRow?._crop_boxes?.[selectedCol];
  const currentValue = selectedCol && selectedRow ? selectedRow[selectedCol] : null;
  const currentConf = selectedCol && selectedRow?._confidence?.[selectedCol];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[500px] bg-white shadow-2xl border-l border-[#E8DEC9] flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#3D2015] flex items-center justify-between bg-[#1B0B07] text-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E4022D] flex items-center justify-center">
            <Crosshair className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white">Original Document Crop</h3>
            <p className="text-[11px] text-[#EACB85]/80">
              Verify extracted text against original handwritten paper
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close document inspection panel"
          className="p-1.5 rounded-full text-[#EACB85]/70 hover:text-white hover:bg-[#2F150C] transition focus-visible:ring-2 focus-visible:ring-[#EACB85] focus-visible:outline-none"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Selected Cell Banner */}
      {selectedCol && selectedRow && (
        <div className="px-5 py-3.5 bg-[#FAF3E3] border-b border-[#E8DEC9] flex items-center justify-between" role="region" aria-label="Selected cell extraction info">
          <div>
            <div className="text-[10px] text-[#7D5843] font-bold uppercase tracking-wider">
              {selectedCol === 'fat %' ? 'COCO %' : selectedCol === 'moisture %' ? 'SUGAR %' : selectedCol} • Batch Row #{selectedRow['sr no']}
            </div>
            <div className="text-sm font-bold text-[#1B0B07] mt-0.5">
              Extracted: <span className="font-mono text-[#E4022D] font-bold">{String(currentValue)}</span>
            </div>
          </div>
          {currentConf !== undefined && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                currentConf >= 0.85
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              Confidence: {Math.round(currentConf * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Interactive Image Container */}
      <div className="flex-1 bg-[#140703] overflow-auto relative p-4 flex items-center justify-center select-none">
        <div
          className="relative transition-transform duration-150 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={imageUrl}
            alt="Quality Lab Sheet original document"
            width="600"
            height="800"
            className="max-w-none max-h-[75vh] rounded-lg shadow-2xl border border-[#3D2015] object-contain"
          />

          {/* Highlight Bounding Box overlay in Morde Gold & Red glow */}
          {cropInfo && cropInfo.x_min !== undefined && (
            <div
              className="absolute border-2 border-[#E4022D] bg-[#E4022D]/20 rounded pointer-events-none transition-all shadow-[0_0_20px_rgba(228,2,45,0.6)]"
              style={{
                left: `${cropInfo.x_min}px`,
                top: `${cropInfo.y_min}px`,
                width: `${Math.max(40, (cropInfo.x_max || 0) - cropInfo.x_min)}px`,
                height: `${Math.max(25, (cropInfo.y_max || 0) - cropInfo.y_min)}px`,
              }}
            />
          )}
        </div>
      </div>

      {/* Zoom Toolbar & Verification button */}
      <div className="px-5 py-3.5 border-t border-[#E8DEC9] bg-[#FDFBF7] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            aria-label="Zoom out"
            className="p-2 rounded-full bg-white border border-[#D4A853]/40 hover:bg-[#FAF3E3] text-[#1B0B07] transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="text-xs font-mono font-bold text-[#7D5843] w-12 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            aria-label="Zoom in"
            className="p-2 rounded-full bg-white border border-[#D4A853]/40 hover:bg-[#FAF3E3] text-[#1B0B07] transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setZoom(1)}
            aria-label="Reset zoom to 100%"
            className="p-2 rounded-full bg-white border border-[#D4A853]/40 hover:bg-[#FAF3E3] text-[#7D5843] transition ml-1 focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 px-5 py-2 bg-[#E4022D] hover:bg-[#C40226] text-white rounded-full text-xs font-bold shadow-md shadow-red-950/20 transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          <span>Verified &amp; Accept</span>
        </button>
      </div>
    </div>
  );
};
