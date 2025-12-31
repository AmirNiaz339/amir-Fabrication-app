
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
    if (!barcode.trim()) return alert("Barcode Identity Required");
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

  const btnClass = theme === 'cyber' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-indigo-600 text-white';
  const cardBg = theme === 'dark' || theme === 'cyber' ? 'bg-slate-900 border-current/20' : 'bg-white border-slate-200';
  const subLabelColor = theme === 'cyber' ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400';

  return (
    <div className={`border-2 border-dashed rounded-[2.5rem] overflow-hidden flex flex-col h-[540px] transition-all group ${theme === 'cyber' ? 'border-amber-500/40 bg-black' : 'border-indigo-200'}`}>
      {step === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 gap-10">
          <div className={`p-10 rounded-full transition-all duration-700 group-hover:scale-110 shadow-2xl ${theme === 'cyber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
            <Plus className="w-14 h-14" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black tracking-tight mb-2">Manual Entry</h3>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${subLabelColor}`}>Capture Single Record</p>
          </div>
          <div className="grid grid-cols-1 w-full gap-4">
            <button onClick={startCamera} className={`flex items-center justify-center gap-3 py-6 rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${btnClass}`}>
              <Camera className="w-6 h-6" /> Take Snapshot
            </button>
            <button onClick={() => fileInputRef.current?.click()} className={`flex items-center justify-center gap-3 py-6 rounded-3xl text-xs font-black uppercase tracking-[0.2em] border border-current/20 active:scale-95 transition-all ${theme === 'cyber' ? 'bg-amber-500/5 text-amber-500' : 'bg-slate-50 dark:bg-slate-800'}`}>
              <Upload className="w-6 h-6" /> From Storage
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
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <button onClick={reset} className="self-end p-4 bg-black/60 text-white rounded-full backdrop-blur-md hover:bg-black transition-all shadow-2xl border border-white/10"><X className="w-8 h-8"/></button>
            <button onClick={capture} disabled={!isReady} className="self-center mb-10 w-24 h-24 border-[10px] border-white rounded-full bg-red-600 shadow-[0_0_50px_rgba(0,0,0,0.5)] active:scale-90 transition-all flex items-center justify-center group ring-8 ring-white/20">
              {!isReady && <Loader2 className="w-10 h-10 animate-spin text-white" />}
            </button>
          </div>
        </div>
      )}

      {step === 'STAGING' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-72 relative flex-shrink-0">
            <img src={preview!} className="w-full h-full object-cover" alt="Captured preview" />
            <button onClick={reset} className="absolute top-6 right-6 p-3 bg-black/70 text-white rounded-full backdrop-blur-md shadow-2xl border border-white/20 hover:bg-black"><X className="w-6 h-6"/></button>
          </div>
          <div className={`p-10 flex flex-col flex-1 justify-between ${cardBg}`}>
            <div className="space-y-6">
              <label className={`block text-[11px] font-black uppercase tracking-[0.2em] ${subLabelColor}`}>Barcode Identity</label>
              <input 
                type="text" 
                className={`w-full px-6 py-5 rounded-3xl text-xl font-mono font-black outline-none border transition-all shadow-inner ${theme === 'cyber' ? 'bg-black border-amber-900 focus:border-amber-500 text-amber-400 placeholder:text-amber-900' : 'bg-slate-50 dark:bg-slate-800 border-current/10 focus:border-indigo-600'}`}
                placeholder="ID-000-000"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
              />
            </div>
            <button onClick={handleSave} className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 ${btnClass}`}>
              Archive Entry <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCard;
