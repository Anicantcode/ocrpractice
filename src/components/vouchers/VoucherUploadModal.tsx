import React, { useRef, useState } from 'react';
import { Camera, Upload, X, FileText, CheckCircle2, AlertCircle, Sparkles, RotateCw, RotateCcw } from 'lucide-react';

interface VoucherUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanFile: (file: File, rotation?: number) => Promise<void>;
  isLoading: boolean;
}

export const VoucherUploadModal: React.FC<VoucherUploadModalProps> = ({
  isOpen,
  onClose,
  onScanFile,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isAutoOriented, setIsAutoOriented] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Landscape slip taken in portrait: default to 270 deg
    const img = new Image();
    img.onload = () => {
      if (img.naturalHeight > img.naturalWidth) {
        setRotation(270);
        setIsAutoOriented(true);
      } else {
        setRotation(0);
        setIsAutoOriented(false);
      }
    };
    img.src = url;
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
            <h3 className="text-sm font-bold text-neutral-900">Scan Voucher Document</h3>
            <p className="text-xs text-neutral-500 mt-0.5">PaddleOCR (PP-OCRv4) text extraction for Morde Voucher slips</p>
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
              <span className="text-[10px] text-neutral-500">Take photo of voucher</span>
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
            className={`relative rounded-lg border-2 border-dashed p-4 text-center transition ${
              dragActive ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 bg-neutral-50/60'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-semibold text-neutral-900">Document Preview</span>
                    {isAutoOriented && (
                      <span className="text-[10px] bg-neutral-200/80 text-neutral-800 px-2 py-0.5 rounded font-mono">
                        Auto-oriented (270°)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 270) % 360)}
                      className="px-2 py-1 rounded bg-white hover:bg-neutral-100 text-neutral-700 text-xs border border-neutral-200 flex items-center space-x-1 transition"
                      title="Rotate -90 deg"
                    >
                      <RotateCcw className="w-3 h-3 text-neutral-600" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-2 py-1 rounded bg-white hover:bg-neutral-100 text-neutral-700 text-xs border border-neutral-200 flex items-center space-x-1 transition"
                      title="Rotate +90 deg"
                    >
                      <RotateCw className="w-3 h-3 text-neutral-600" />
                      <span>+90°</span>
                    </button>
                  </div>
                </div>

                <div className="relative max-h-48 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 flex items-center justify-center p-2">
                  <img
                    src={previewUrl}
                    alt="Voucher Document preview"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="max-h-44 w-auto object-contain transition-transform duration-200"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 px-1 font-mono">
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                  <span className="font-semibold text-neutral-700">Rotation: {rotation}°</span>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-1">
                <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-xs text-neutral-800 font-medium">Or drag &amp; drop physical voucher slip here</p>
                <p className="text-[10px] text-neutral-400">Supports photos of handwritten or printed Morde vouchers</p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-2.5 flex items-start space-x-2">
            <AlertCircle className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-neutral-600 leading-tight">
              PaddleOCR will automatically detect company header, voucher #, G/L code, debit account, payee, particulars, and amount.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-50/50 border-t border-neutral-200 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="px-4 py-2 rounded-lg bg-[#E4022D] hover:bg-[#C40226] text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition flex items-center space-x-1.5"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Reading with PaddleOCR…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Scan Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
