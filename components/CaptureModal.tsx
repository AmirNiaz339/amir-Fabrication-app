
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, Check, Trash2, CameraIcon, Play, Square, Loader2 } from 'lucide-react';

interface CaptureModalProps {
  onClose: () => void;
  onSave: (code: string, images: string[]) => void;
}

const CaptureModal: React.FC<CaptureModalProps> = ({ onClose, onSave }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Camera access denied", err);
        alert("Could not access camera. Please check permissions.");
        onClose();
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImages(prev => [dataUrl, ...prev]);
      }
    }
  };

  const handleSave = () => {
    if (!code.trim()) {
      alert("Please enter a code for this record.");
      return;
    }
    if (capturedImages.length === 0) {
      alert("Capture at least one photo.");
      return;
    }
    setIsProcessing(true);
    onSave(code, capturedImages);
    onClose();
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 overflow-hidden md:p-8">
      <div className="bg-white w-full h-full md:rounded-3xl flex flex-col md:max-w-6xl shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CameraIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Asset Capture Engine</h3>
              <p className="text-xs text-slate-500">Archive live visual data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Viewport */}
          <div className="flex-[3] relative bg-slate-950 flex items-center justify-center overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="border border-white"></div>
              <div className="border border-white"></div>
              <div className="border border-white"></div>
              <div className="border border-white"></div>
              <div className="border border-white"></div>
              <div className="border border-white"></div>
              <div className="border border-white"></div>
              <div className="border border-white"></div>
              <div className="border border-white"></div>
            </div>

            {/* Shutter Button Container */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
               <button 
                onClick={captureFrame}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20 active:scale-90 transition-transform group"
              >
                <div className="w-14 h-14 border-4 border-slate-900 rounded-full flex items-center justify-center group-hover:bg-slate-50">
                  <div className="w-8 h-8 bg-red-600 rounded-full"></div>
                </div>
              </button>
              <p className="text-white text-xs font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Tap to Capture</p>
            </div>
          </div>

          {/* Right Panel: Staging Area */}
          <div className="flex-[1.5] flex flex-col border-l border-slate-100 bg-slate-50 max-h-[40vh] lg:max-h-full">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Record Code</label>
                <input 
                  type="text"
                  placeholder="e.g., SHIP-990-2024"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Staging Area</label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{capturedImages.length} images</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {capturedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {capturedImages.length === 0 && (
                    <div className="col-span-3 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-center px-4">
                      <p className="text-xs font-medium">Ready for capture</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-white border-t border-slate-100">
              <button 
                onClick={handleSave}
                disabled={capturedImages.length === 0 || !code.trim() || isProcessing}
                className={`w-full py-4 flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-xl shadow-blue-100 ${
                  capturedImages.length > 0 && code.trim() && !isProcessing
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Archive Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;
