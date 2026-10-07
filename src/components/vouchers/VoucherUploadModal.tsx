import React, { useRef, useState } from 'react';
import { Camera, Upload, X, FileText, CheckCircle2, AlertCircle, RotateCw, RotateCcw } from 'lucide-react';
import { rotateImageFile } from '../../lib/imageUtils';

interface VoucherUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanFile: (file: File, sourceFile?: File, rotation?: number) => Promise<void>;
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

    // Check if smartphone photo is portrait (height > width)
    const img = new Image();
    img.onload = () => {
      if (img.naturalHeight > img.naturalWidth) {
        setRotation(90);
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
      const readyFile = await rotateImageFile(selectedFile, rotation);
      await onScanFile(readyFile, selectedFile, rotation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Scan Voucher Document</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Capture with phone camera or upload voucher photo</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
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
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#E4022D]/30 bg-[#FFF0F2]/50 hover:bg-[#FFF0F2] hover:border-[#E4022D] transition group"
            >
              <Camera className="w-7 h-7 text-[#E4022D] mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-neutral-900">Camera Capture</span>
              <span className="text-[10px] text-neutral-500">Take photo of voucher</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-300/50 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-500 transition group"
            >
              <Upload className="w-7 h-7 text-amber-700 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-neutral-900">Browse Image</span>
              <span className="text-[10px] text-neutral-500">JPG, PNG, PDF</span>
            </button>
          </div>

          {/* Dropzone / Preview */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-4 text-center transition ${
              dragActive ? 'border-[#E4022D] bg-[#FFF0F2]' : 'border-neutral-200 bg-neutral-50/60'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-neutral-900">Preview &amp; Orientation</span>
                    {isAutoOriented && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
                        Auto-oriented to landscape
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 270) % 360)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 text-xs border border-neutral-300 flex items-center space-x-1 shadow-sm transition"
                      title="Rotate 90 degrees counter-clockwise"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#E4022D]" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 text-xs border border-neutral-300 flex items-center space-x-1 shadow-sm transition"
                      title="Rotate 90 degrees clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#E4022D]" />
                      <span>+90°</span>
                    </button>
                  </div>
                </div>

                <div className="relative max-h-52 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center p-2">
                  <img
                    src={previewUrl}
                    alt="Voucher Document preview"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="max-h-48 w-auto object-contain transition-transform duration-200"
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
                <p className="text-xs text-neutral-800 font-semibold">Or drag &amp; drop physical voucher slip here</p>
                <p className="text-[10px] text-neutral-400">Supports photos of handwritten or printed Morde vouchers</p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-tight">
              <strong>Tip:</strong> Ensure voucher number, amounts, payee, and account particulars are clearly visible.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="px-6 py-2.5 rounded-full bg-[#E4022D] hover:bg-[#C40226] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-950/20 disabled:opacity-50 transition flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Scanning Document...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Scan Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
