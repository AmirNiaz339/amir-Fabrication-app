
import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Loader2, Plus } from 'lucide-react';

interface CreatorCardProps {
  onSave: (code: string, userName: string, imageUrl: string) => void;
  currentUser: string;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ onSave, currentUser }) => {
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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
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
      stopCamera();
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        setPreview(re.target?.result as string);
        setStep('STAGING');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!barcode.trim()) {
      alert("Please enter the Barcode number.");
      return;
    }
    if (!currentUser.trim()) {
      alert("CRITICAL: Set your 'User Name' in the top header first.");
      return;
    }
    if (preview) {
      onSave(barcode, currentUser, preview);
      reset();
    }
  };

  const reset = () => {
    stopCamera();
    setStep('IDLE');
    setPreview(null);
    setBarcode('');
  };

  return (
    <div className="bg-white border-2 border-dashed border-indigo-200 rounded-3xl overflow-hidden flex flex-col h-[480px] group transition-all hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50">
      {step === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <div className="bg-indigo-50 p-6 rounded-full text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <Plus className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Direct Capture</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manual Single Entry</p>
          </div>
          <div className="grid grid-cols-1 w-full gap-3">
            <button 
              onClick={startCamera}
              className="flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <Camera className="w-5 h-5" /> Take Photo
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              <Upload className="w-5 h-5" /> From File
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
          </div>
        </div>
      )}

      {step === 'CAPTURING' && (
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            <button onClick={reset} className="self-end p-3 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-all"><X className="w-6 h-6"/></button>
            <button 
              onClick={capture} 
              disabled={!isReady}
              className="self-center mb-8 w-20 h-20 border-8 border-white rounded-full flex items-center justify-center bg-red-600 shadow-2xl active:scale-90 transition-transform ring-4 ring-black/20"
            >
              {!isReady && <Loader2 className="w-8 h-8 animate-spin text-white" />}
            </button>
          </div>
        </div>
      )}

      {step === 'STAGING' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Constrained Image height so button stays visible */}
          <div className="h-[220px] relative overflow-hidden bg-slate-100 border-b border-slate-100">
            <img src={preview!} className="w-full h-full object-cover" />
            <button onClick={reset} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-all"><X className="w-4 h-4"/></button>
            <div className="absolute bottom-2 left-3">
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full tracking-widest">Image Staged</span>
            </div>
          </div>
          <div className="p-6 bg-white flex flex-col flex-1 justify-between">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Barcode / Identification</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:font-normal"
                placeholder="Type Barcode..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase px-1">
                <span>Saving As:</span>
                <span className="text-indigo-600 truncate max-w-[120px]">{currentUser || 'NO USER SET'}</span>
              </div>
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                <Check className="w-5 h-5" /> Save to Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCard;
