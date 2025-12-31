
import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Loader2, Plus, ArrowRight } from 'lucide-react';
import { ThemeType } from '../types';

interface CreatorCardProps {
  onSave: (code: string, userName: string, imageUrl: string) => void;
  currentUser: string;
  theme: ThemeType;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ onSave, currentUser, theme }) => {
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(dataUrl);
      setStep('STAGING');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleSave = () => {
    if (!barcode.trim()) return alert("Enter Barcode");
    if (preview) {
      onSave(barcode, currentUser, preview);
      reset();
    }
  };

  const reset = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStep('IDLE');
    setPreview(null);
    setBarcode('');
  };

  const btnClass = theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white';
  const cardBg = theme === 'dark' || theme === 'cyber' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`border-2 border-dashed rounded-[2.5rem] overflow-hidden flex flex-col h-[520px] transition-all group ${theme === 'cyber' ? 'border-amber-500/30' : 'border-indigo-100'}`}>
      {step === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 gap-8">
          <div className={`p-8 rounded-full transition-all duration-500 group-hover:scale-110 ${theme === 'cyber' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-50 text-indigo-600'}`}>
            <Plus className="w-12 h-12" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black tracking-tight">Direct Entry</h3>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mt-1">Single Asset Acquisition</p>
          </div>
          <div className="grid grid-cols-1 w-full gap-4">
            <button onClick={startCamera} className={`flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all ${btnClass}`}>
              <Camera className="w-5 h-5" /> Take Snapshot
            </button>
            <button onClick={() => fileInputRef.current?.click()} className={`flex items-center justify-center gap-3 py-5 rounded-2xl text-xs font-black uppercase tracking-widest border border-current/10 active:scale-95 transition-all ${theme === 'cyber' ? 'bg-amber-500/5' : 'bg-slate-50'}`}>
              <Upload className="w-5 h-5" /> From Drive
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (re) => { setPreview(re.target?.result as string); setStep('STAGING'); };
                reader.readAsDataURL(file);
              }
            }} />
          </div>
        </div>
      )}

      {step === 'CAPTURING' && (
        <div className="flex-1 relative bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <button onClick={reset} className="self-end p-3 bg-black/50 text-white rounded-full"><X className="w-6 h-6"/></button>
            <button onClick={capture} disabled={!isReady} className="self-center mb-8 w-20 h-20 border-8 border-white rounded-full bg-red-600 shadow-2xl active:scale-90 transition-all flex items-center justify-center">
              {!isReady && <Loader2 className="w-8 h-8 animate-spin text-white" />}
            </button>
          </div>
        </div>
      )}

      {step === 'STAGING' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-64 relative flex-shrink-0">
            <img src={preview!} className="w-full h-full object-cover" />
            <button onClick={reset} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full"><X className="w-4 h-4"/></button>
          </div>
          <div className={`p-8 flex flex-col flex-1 justify-between ${cardBg}`}>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-40">Identify Barcode</label>
              <input 
                type="text" 
                className={`w-full px-5 py-4 rounded-2xl text-lg font-mono font-black outline-none border ${theme === 'cyber' ? 'bg-slate-800 border-amber-500/30' : 'bg-slate-50 border-slate-100 focus:border-indigo-600'}`}
                placeholder="000-000-000"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
              />
            </div>
            <button onClick={handleSave} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${btnClass}`}>
              Confirm & Save <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCard;
