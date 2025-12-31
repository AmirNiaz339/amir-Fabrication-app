
import React, { useState, useRef, useMemo } from 'react';
import { Camera, Upload, X, Loader2, Plus, ArrowRight, Check, Search } from 'lucide-react';
import { ThemeType, ExcelRow } from '../types';

interface CreatorCardProps {
  onSave: (code: string, userName: string, imageUrl: string) => void;
  currentUser: string;
  theme: ThemeType;
  masterData: ExcelRow[];
}

const CreatorCard: React.FC<CreatorCardProps> = ({ onSave, currentUser, theme, masterData }) => {
  const [step, setStep] = useState<'IDLE' | 'CAPTURING' | 'STAGING'>('IDLE');
  const [preview, setPreview] = useState<string | null>(null);
  const [barcode, setBarcode] = useState('');
  const [isReady, setIsReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const matchedProduct = useMemo(() => {
    if (!barcode.trim()) return null;
    // Direct match check
    return masterData.find(row => row.barcode.trim() === barcode.trim());
  }, [barcode, masterData]);

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

  // Specific layout styling matching user screenshot
  const headerStyle = "bg-[#337ab7] text-white py-1 px-3 text-center text-[10px] font-bold uppercase border-b border-[#2e6da4]";
  const fullRowLabelStyle = "bg-black text-white px-2 py-1 text-[8px] font-bold uppercase flex items-center min-w-[100px] border-b border-white/10";
  const fullRowValueStyle = "bg-[#fff9e6] text-black px-2 py-1 text-[9px] font-semibold border-b border-slate-200 flex-1 min-h-[22px]";
  const gridLabelStyle = "bg-black text-white px-2 py-1 text-[7px] font-bold uppercase flex items-center min-w-[90px] border-b border-white/10";
  const gridValueStyle = "bg-white text-black px-2 py-1 text-[8px] font-semibold border-b border-slate-200 flex-1 italic truncate min-h-[20px]";

  return (
    <div className={`border-2 border-dashed rounded-[2rem] overflow-hidden flex flex-col h-[920px] transition-all group ${theme === 'cyber' ? 'border-amber-500/40 bg-black' : 'border-indigo-200'}`}>
      {step === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 gap-10">
          <div className={`p-10 rounded-full transition-all duration-700 group-hover:scale-110 shadow-2xl ${theme === 'cyber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
            <Plus className="w-14 h-14" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black tracking-tight mb-2">New Entry</h3>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${subLabelColor}`}>Live File Lookup Active</p>
          </div>
          <div className="grid grid-cols-1 w-full gap-4">
            <button onClick={startCamera} className={`flex items-center justify-center gap-3 py-6 rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${btnClass}`}>
              <Camera className="w-6 h-6" /> Take Photo
            </button>
            <button onClick={() => fileInputRef.current?.click()} className={`flex items-center justify-center gap-3 py-6 rounded-3xl text-xs font-black uppercase tracking-[0.2em] border border-current/20 active:scale-95 transition-all ${theme === 'cyber' ? 'bg-amber-500/5 text-amber-500' : 'bg-slate-50 dark:bg-slate-800'}`}>
              <Upload className="w-6 h-6" /> Upload Single
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
          <div className="h-64 relative flex-shrink-0">
            <img src={preview!} className="w-full h-full object-cover" alt="Captured preview" />
            <button onClick={reset} className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full backdrop-blur-md shadow-2xl border border-white/20 hover:bg-black"><X className="w-5 h-5"/></button>
          </div>
          <div className={`p-6 flex flex-col flex-1 gap-6 ${cardBg}`}>
            <div className="space-y-4">
              <div className="relative">
                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${subLabelColor}`}>Barcode Identity</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className={`w-full px-5 py-4 rounded-2xl text-xl font-mono font-black outline-none border transition-all shadow-inner ${theme === 'cyber' ? 'bg-black border-amber-900 focus:border-amber-500 text-amber-400' : 'bg-slate-50 dark:bg-slate-800 border-current/10 focus:border-indigo-600'}`}
                    placeholder="SCAN BARCODE..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    autoFocus
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    {matchedProduct ? <Check className="text-emerald-500 w-6 h-6" /> : <Search className="opacity-20 w-6 h-6" />}
                  </div>
                </div>
              </div>

              {/* Real-time Lookup Display - Matching User Layout Precisely */}
              <div className={`border border-slate-400 rounded-sm overflow-hidden flex flex-col transition-all duration-300 shadow-sm ${matchedProduct ? 'opacity-100 scale-100' : 'opacity-30 scale-[0.98]'}`}>
                <div className={headerStyle}>
                  {matchedProduct ? 'Excel Record Identified' : 'Awaiting Barcode Match'}
                </div>
                
                <div className="flex">
                  <div className={fullRowLabelStyle}>ProductID</div>
                  <div className={fullRowValueStyle}>{matchedProduct?.productId || '-'}</div>
                </div>
                <div className="flex">
                  <div className={fullRowLabelStyle}>ProductName</div>
                  <div className={fullRowValueStyle}>{matchedProduct?.productName || 'N/A'}</div>
                </div>
                <div className="flex">
                  <div className={fullRowLabelStyle}>VendorName</div>
                  <div className={fullRowValueStyle}>{matchedProduct?.vendorName || '-'}</div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="flex border-r border-slate-300">
                    <div className={gridLabelStyle}>Size</div>
                    <div className={gridValueStyle}>{matchedProduct?.sizeId || '-'}</div>
                  </div>
                  <div className="flex">
                    <div className={gridLabelStyle}>Color</div>
                    <div className={gridValueStyle}>{matchedProduct?.colorId || '-'}</div>
                  </div>
                  <div className="flex border-r border-slate-300">
                    <div className={gridLabelStyle}>Price</div>
                    <div className={gridValueStyle}>{matchedProduct?.purchasePrice || '-'}</div>
                  </div>
                  <div className="flex">
                    <div className={gridLabelStyle}>Stock</div>
                    <div className={`${gridValueStyle} text-[#22c55e] font-black`}>{matchedProduct?.closingStock || '0'}</div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 mt-auto ${btnClass}`}>
              Archive Entry <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCard;
