
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';

interface ImagePreviewModalProps {
  url: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ url, onClose }) => {
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `archive-export-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
            <Maximize2 className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest">HD Visual Inspector</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">High-Resolution Reference</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/10 rounded-2xl p-1 backdrop-blur-md border border-white/10">
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="px-4 text-white font-mono font-bold text-sm min-w-[80px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={handleDownload}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center gap-2 px-6"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Export</span>
          </button>

          <button 
            onClick={onClose}
            className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full h-full flex items-center justify-center p-12 overflow-hidden">
        <div 
          className="transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoom})` }}
        >
          <img 
            src={url} 
            className="max-w-[90vw] max-h-[85vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg" 
            alt="Magnified View" 
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Visual Archive Precision Engine</p>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
