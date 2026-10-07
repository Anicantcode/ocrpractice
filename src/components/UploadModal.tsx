import React, { useRef, useState } from 'react';
import { Camera, Upload, X, FileText, CheckCircle2, AlertCircle, RotateCw, RotateCcw } from 'lucide-react';
import { rotateImageFile } from '../lib/imageUtils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File, sourceFile?: File, rotation?: number) => void;
  isLoading: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
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
      onUploadFile(readyFile, selectedFile, rotation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B0B07]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#E8DEC9] morde-card-accent">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DEC9] bg-[#FDFBF7]">
          <div>
            <h3 className="text-base font-bold text-[#1B0B07]">Scan Quality Sheet</h3>
            <p className="text-xs text-[#7D5843] mt-0.5">Capture with phone camera or upload document photo</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close upload dialog"
            className="p-1.5 rounded-full text-[#7D5843] hover:text-[#1B0B07] hover:bg-[#F3EDE2] transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            name="file_upload"
            aria-label="Upload document image or PDF file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Mobile Camera Direct Input */}
          <input
            ref={cameraInputRef}
            type="file"
            name="camera_capture"
            aria-label="Capture document photo with device camera"
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
              <span className="text-xs font-bold text-[#1B0B07]">Camera Capture</span>
              <span className="text-[10px] text-[#7D5843]">Phone camera lens</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#D4A853]/40 bg-[#FAF3E3]/40 hover:bg-[#FAF3E3] hover:border-[#B8882C] transition group"
            >
              <Upload className="w-7 h-7 text-[#B8882C] mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#1B0B07]">Browse Photo</span>
              <span className="text-[10px] text-[#7D5843]">JPG, PNG, PDF</span>
            </button>
          </div>

          {/* Dropzone / Preview */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-4 text-center transition ${
              dragActive ? 'border-[#E4022D] bg-[#FFF0F2]' : 'border-[#E8DEC9] bg-[#FDFBF7]'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-[#1B0B07]">Preview &amp; Orientation</span>
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
                      aria-label="Rotate 90 degrees counter-clockwise"
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF3E3] text-[#1B0B07] text-xs border border-[#D4A853]/50 flex items-center space-x-1 shadow-sm transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
                      title="Rotate 90 degrees counter-clockwise"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#E4022D]" aria-hidden="true" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      aria-label="Rotate 90 degrees clockwise"
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF3E3] text-[#1B0B07] text-xs border border-[#D4A853]/50 flex items-center space-x-1 shadow-sm transition focus-visible:ring-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
                      title="Rotate 90 degrees clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#E4022D]" aria-hidden="true" />
                      <span>+90°</span>
                    </button>
                  </div>
                </div>

                <div className="relative max-h-52 overflow-hidden rounded-xl border border-[#3D2015] bg-[#1B0B07] flex items-center justify-center p-2">
                  <img
                    src={previewUrl}
                    alt="Document sheet preview"
                    width="400"
                    height="200"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="max-h-48 w-auto object-contain transition-transform duration-200"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#7D5843] px-1 font-medium">
                  <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                  <span className="text-[#E4022D] font-bold">Rotation: {rotation}°</span>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-1">
                <FileText className="w-8 h-8 text-[#D4A853]/70 mx-auto" aria-hidden="true" />
                <p className="text-xs text-[#1B0B07] font-semibold">Or drag &amp; drop physical test sheet photo here</p>
                <p className="text-[10px] text-[#7D5843]">Handwritten clipboard sheets or pre-printed lab logs</p>
              </div>
            )}
          </div>

          {/* Quality Tips */}
          <div className="rounded-xl bg-[#FAF3E3] border border-[#EACB85]/60 p-3 flex items-start space-x-2.5" role="status" aria-live="polite">
            <AlertCircle className="w-4 h-4 text-[#B8882C] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] text-[#7D5843] leading-tight">
              <strong>Tip:</strong> Ensure all batch rows and columns are clearly visible in the photo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FDFBF7] border-t border-[#E8DEC9] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-[#7D5843] hover:text-[#1B0B07] transition focus-visible:ring-2 focus-visible:ring-[#7D5843] focus-visible:outline-none"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="px-6 py-2.5 rounded-full bg-[#E4022D] hover:bg-[#C40226] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-950/30 disabled:opacity-50 transition flex items-center space-x-2 motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E4022D] focus-visible:outline-none"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
                <span>Scanning Document...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Scan Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
