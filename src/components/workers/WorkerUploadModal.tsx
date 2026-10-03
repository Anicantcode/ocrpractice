import React, { useRef, useState } from 'react';
import { Camera, Upload, X, FileText, CheckCircle2, AlertCircle, Sparkles, RotateCw, RotateCcw } from 'lucide-react';

interface WorkerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanFile: (file: File, rotation?: number) => Promise<void>;
  isLoading: boolean;
}

export const WorkerUploadModal: React.FC<WorkerUploadModalProps> = ({
  isOpen,
  onClose,
  onScanFile,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setRotation(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      await onScanFile(selectedFile, rotation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Scan Loader Working Sheet</h3>
            <p className="text-xs text-neutral-500 mt-0.5">PaddleOCR with mixed Marathi & English translation for Loader Daily Working Detail</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Action Choice Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white transition group"
            >
              <Camera className="w-6 h-6 text-neutral-700 mb-1 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-semibold text-neutral-900">Camera Capture</span>
              <span className="text-[10px] text-neutral-500">Take photo of sheet</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-white transition group"
            >
              <Upload className="w-6 h-6 text-neutral-700 mb-1 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-semibold text-neutral-900">Browse Image</span>
              <span className="text-[10px] text-neutral-500">JPG, PNG, WebP</span>
            </button>
          </div>

          {/* Dropzone / Preview */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border rounded-lg p-3 text-center transition-all ${
              dragActive
                ? 'border-neutral-900 bg-neutral-50'
                : 'border-neutral-200 bg-neutral-50/30'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative max-h-56 overflow-hidden rounded border border-neutral-200 bg-neutral-950/5 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="max-h-52 object-contain transition-transform duration-200 shadow-sm"
                  />
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <span className="font-mono text-neutral-700 truncate max-w-[200px]">
                      {selectedFile?.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center space-x-1 text-[11px]"
                      title="Rotate counter-clockwise"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-2 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center space-x-1 text-[11px]"
                      title="Rotate clockwise"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>+90°</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <p className="text-neutral-500">Drag and drop Loader Daily Working Detail sheet here</p>
                <p className="text-[10px] text-neutral-400 mt-1 font-mono">Accepts camera photos, carbon slips, scanned JPG/PNG</p>
              </div>
            )}
          </div>

          {/* Info pill */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 flex items-start space-x-2 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold">Bilingual Extraction:</span> Automatically translates handwritten Marathi terms (<span className="font-mono">गाड्यांमधी, परिसर, कंपनी, गोडाऊन, थापी</span>) and names into English, populating the 8 physical columns with zero mock data.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 px-5 py-3 border-t border-neutral-200 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="px-4 py-1.5 rounded-lg bg-[#E4022D] hover:bg-[#C40226] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing OCR & Translation...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Process Document</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
