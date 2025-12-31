
import React, { useState } from 'react';
import { X, Hash, User, Trash2, Maximize2, Loader2, Save } from 'lucide-react';
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
    if (!code.trim()) return alert("Identification Number Required");
    onSave(pending.id, code, currentUser, pending.url);
  };

  const cardBg = {
    indigo: 'bg-white border-orange-200',
    dark: 'bg-slate-900 border-orange-900/50',
    emerald: 'bg-white border-orange-100',
    cyber: 'bg-black border-orange-900'
  }[theme];

  const subLabelColor = theme === 'cyber' ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400';

  return (
    <div className={`rounded-[2.5rem] overflow-hidden border-2 flex flex-col h-[540px] group transition-all duration-500 shadow-2xl relative ${cardBg}`}>
      <div className="relative h-64 flex-shrink-0 bg-slate-100 overflow-hidden border-b border-orange-100">
        <img src={pending.url} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-125" alt="Pending upload" />
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 px-8 backdrop-blur-md">
           <button onClick={() => onPreview(pending.url)} className="flex-1 py-5 bg-white text-slate-900 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-white/20 flex items-center justify-center gap-3 shadow-2xl">
            <Maximize2 className="w-6 h-6" />
            HD View
          </button>
        </div>
        <button 
          onClick={() => onDiscard(pending.id)}
          className="absolute top-6 right-6 p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-2xl border border-red-500/20 active:scale-95"
        >
          <Trash2 className="w-6 h-6" />
        </button>
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/95 to-transparent flex items-end p-6">
          <div className="flex items-center gap-3 text-white">
             <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
             <span className="text-[11px] font-black uppercase tracking-[0.3em]">Processing Queue</span>
          </div>
        </div>
      </div>

      <div className={`p-10 flex flex-col flex-1 justify-between`}>
        <div className="space-y-6">
          <div className="relative">
            <label className="flex items-center gap-2 text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] mb-3">
              <Hash className="w-4 h-4" /> Identity Verification
            </label>
            <input 
              type="text" 
              className={`w-full px-6 py-5 rounded-3xl text-2xl font-mono font-black outline-none border transition-all shadow-inner ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-orange-900/50 text-white placeholder:text-slate-600' : 'bg-orange-50/50 border-orange-200 focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 text-slate-900'}`}
              placeholder="SCAN NOW..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>

          <div className={`flex items-center gap-5 px-6 py-4 rounded-3xl border ${theme === 'cyber' ? 'bg-amber-500/5 border-amber-900/50' : 'bg-orange-500/5 border-orange-500/10'}`}>
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <User className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-widest ${subLabelColor}`}>Operator</span>
              <p className="text-base font-black truncate max-w-[140px] leading-tight">{currentUser}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-6 bg-orange-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-orange-700 transition-all shadow-[0_15px_40px_rgba(234,88,12,0.4)] active:scale-95 mt-8"
        >
          <Save className="w-6 h-6" /> Save Record
        </button>
      </div>
    </div>
  );
};

export default PendingCard;
