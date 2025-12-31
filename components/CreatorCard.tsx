
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Save } from 'lucide-react';
import { ThemeType, ExcelRow } from '../types';

interface CreatorCardProps {
  onSave: (code: string, userName: string, imageUrl: string) => void;
  onClose: () => void;
  currentUser: string;
  theme: ThemeType;
  masterData: ExcelRow[];
}

const CreatorCard: React.FC<CreatorCardProps> = ({ onSave, onClose, currentUser }) => {
  const [step, setStep] = useState<'IDLE' | 'CAPTURING' | 'STAGING'>('IDLE');
  const [preview, setPreview] = useState<string | null>(null);
  const [barcode, setBarcode] = useState('');
  const [isReady, setIsReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setStep('CAPTURING');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
    } catch (err) {
      alert("Camera error: " + err);
      setStep('IDLE');
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      setPreview(canvas.toDataURL('image/jpeg', 0.8));
      setStep('STAGING');
      stream?.getTracks().forEach(t => t.stop());
    }
  };

  const reset = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStep('IDLE'); setPreview(null); setBarcode('');
  };

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-slate-200">
      {step === 'IDLE' && (
        <div className="p-10 flex flex-col items-center gap-10">
          <div className="flex justify-between w-full items-center mb-2">
             <h3 className="text-xl font-black uppercase tracking-widest text-blue-600">Entry Creator</h3>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X/></button>
          </div>
          <div className="flex gap-6 w-full">
            <button onClick={startCamera} className="flex-1 py-12 bg-blue-600 text-white rounded-[2rem] flex flex-col items-center gap-4 transition-transform active:scale-95 shadow-xl shadow-blue-100">
              <Camera className="w-12 h-12" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Capture</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-12 bg-slate-50 text-slate-900 border border-slate-200 rounded-[2rem] flex flex-col items-center gap-4 transition-transform active:scale-95">
              <Upload className="w-12 h-12 opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest">Import File</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = re => { setPreview(re.target?.result as string); setStep('STAGING'); };
                reader.readAsDataURL(file);
              }
            }} />
          </div>
        </div>
      )}

      {step === 'CAPTURING' && (
        <div className="relative bg-black aspect-square max-h-[70vh]">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-x-0 bottom-10 flex justify-center items-center gap-8">
            <button onClick={reset} className="p-5 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-all"><X className="w-6 h-6"/></button>
            <button onClick={capture} disabled={!isReady} className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
               <div className="w-20 h-20 border-4 border-slate-900 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-600 rounded-sm" />
               </div>
            </button>
          </div>
        </div>
      )}

      {step === 'STAGING' && (
        <div className="flex flex-col">
          <div className="h-72 relative bg-slate-50">
            <img src={preview!} className="w-full h-full object-contain" />
            <button onClick={reset} className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black transition-all"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-10 flex flex-col gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Scan or Type Barcode Identity</label>
              <input 
                type="text" 
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 text-xl font-mono font-black outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                placeholder="BARCODE_ID..."
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                autoFocus
              />
            </div>
            <button onClick={() => {
              if(!barcode.trim()) return alert("Enter Barcode");
              onSave(barcode, currentUser, preview!);
            }} className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-100">
              <Save className="w-5 h-5" /> Archive Final Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCard;
