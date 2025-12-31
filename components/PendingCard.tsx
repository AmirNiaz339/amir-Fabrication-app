
import React, { useState } from 'react';
import { Check, X, Hash, User, Trash2, Maximize2, Loader2, Save } from 'lucide-react';
import { PendingEntry, ThemeType } from '../types';

interface PendingCardProps {
  pending: PendingEntry;
  currentUser: string;
  theme: ThemeType;
  onSave: (id: string, code: string, userName: string, url: string) => void;
  onDiscard: (id: string) => void;
  onPreview: (url: string) => void;
}

const PendingCard: React.FC<PendingCardProps> = ({ pending, currentUser, theme, onSave, onDiscard, onPreview }) => {
  const [code, setCode] = useState('');

  const handleSave = () => {
    if (!code.trim()) return alert("Enter Barcode");
    onSave(pending.id, code, currentUser, pending.url);
  };

  const cardBg = theme === 'dark' || theme === 'cyber' ? 'bg-slate-900 border-orange-500/20' : 'bg-white border-orange-200';

  return (
    <div className={`rounded-[2.5rem] overflow-hidden border-2 flex flex-col h-[520px] group transition-all duration-500 shadow-2xl relative`}>
      <div className="relative h-64 flex-shrink-0 bg-slate-100 overflow-hidden border-b border-orange-100">
        <img src={pending.url} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-125" alt="Pending" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
           <button onClick={() => onPreview(pending.url)} className="p-4 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/40 transition-all border border-white/20 flex items-center gap-2">
            <Maximize2 className="w-6 h-6" />
            Open Viewer
          </button>
        </div>
        <button 
          onClick={() => onDiscard(pending.id)}
          className="absolute top-5 right-5 p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-2xl"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/90 to-transparent flex items-end p-5">
          <div className="flex items-center gap-2 text-white">
             <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Queue Identification</span>
          </div>
        </div>
      </div>

      <div className={`p-8 flex flex-col flex-1 justify-between ${cardBg}`}>
        <div className="space-y-6">
          <div className="relative">
            <label className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">
              <Hash className="w-4 h-4" /> Identification
            </label>
            <input 
              type="text" 
              className={`w-full px-5 py-4 rounded-2xl text-xl font-mono font-black outline-none border transition-all ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-orange-500/30 text-white' : 'bg-orange-50/50 border-orange-100 focus:ring-4 focus:ring-orange-500/10'}`}
              placeholder="SCAN NOW..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-orange-500/5 border border-orange-500/10">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest">Active Session</span>
              <p className="text-sm font-bold truncate max-w-[140px]">{currentUser}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/30 active:scale-95 mt-6"
        >
          <Save className="w-5 h-5" /> Finalize Record
        </button>
      </div>
    </div>
  );
};

export default PendingCard;
