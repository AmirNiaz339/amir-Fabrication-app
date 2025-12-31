
import React, { useState } from 'react';
import { X, Hash, User, Trash2, Maximize2, Save, Check } from 'lucide-react';
import { PendingEntry, ThemeType, ExcelRow } from '../types';

interface PendingCardProps {
  pending: PendingEntry;
  currentUser: string;
  theme: ThemeType;
  masterData: ExcelRow[];
  onSave: (id: string, code: string, userName: string, url: string) => void;
  onDiscard: (id: string) => void;
  onPreview: (url: string) => void;
}

const PendingCard: React.FC<PendingCardProps> = ({ pending, currentUser, onSave, onDiscard, onPreview }) => {
  const [code, setCode] = useState('');

  const handleSave = () => {
    if (!code.trim()) return alert("Barcode ID Required");
    onSave(pending.id, code.trim(), currentUser, pending.url);
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border-2 border-orange-200 flex flex-col group transition-all duration-300 shadow-xl relative animate-in zoom-in-95">
      <div className="relative h-60 bg-slate-100 overflow-hidden border-b">
        <img src={pending.url} className="w-full h-full object-cover" alt="Pending" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
           <button onClick={() => onPreview(pending.url)} className="p-4 bg-white rounded-full text-slate-900 shadow-2xl active:scale-90 transition-all">
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>
        <button 
          onClick={() => onDiscard(pending.id)}
          className="absolute top-4 right-4 p-2.5 bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-lg active:scale-95 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-8 flex flex-col gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Archival Staging</span>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              className="w-full px-6 py-5 rounded-2xl text-xl font-mono font-black outline-none border border-orange-200 bg-orange-50/20 focus:bg-white focus:border-orange-500 transition-all shadow-inner"
              placeholder="SCAN BARCODE..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              {code.length > 0 ? <Check className="text-emerald-500 w-6 h-6" /> : <Hash className="opacity-10 w-6 h-6" />}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={!code.trim()}
          className="w-full py-5 bg-orange-600 text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 active:scale-95 disabled:opacity-40 disabled:grayscale"
        >
          <Save className="w-5 h-5" /> Finalize Record
        </button>

        <div className="flex items-center justify-center text-[9px] font-black uppercase opacity-30 tracking-widest border-t pt-4">
           Operator: {currentUser}
        </div>
      </div>
    </div>
  );
};

export default PendingCard;
