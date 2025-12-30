
import React, { useState } from 'react';
import { Check, X, Hash, User, Trash2, Maximize2 } from 'lucide-react';
import { PendingEntry } from '../types';

interface PendingCardProps {
  pending: PendingEntry;
  currentUser: string;
  onSave: (id: string, code: string, userName: string, url: string) => void;
  onDiscard: (id: string) => void;
  onPreview: (url: string) => void;
}

const PendingCard: React.FC<PendingCardProps> = ({ pending, currentUser, onSave, onDiscard, onPreview }) => {
  const [code, setCode] = useState('');

  const handleSave = () => {
    if (!code.trim()) {
      alert("A Barcode number is required to save.");
      return;
    }
    if (!currentUser.trim()) {
      alert("CRITICAL: Please set your User Name in the header before saving.");
      return;
    }
    onSave(pending.id, code, currentUser, pending.url);
  };

  return (
    <div className="bg-white border-2 border-orange-200 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[480px] animate-in slide-in-from-top-6 duration-500 group">
      <div className="relative h-[220px] flex-shrink-0 bg-slate-100 overflow-hidden border-b border-orange-100">
        <img src={pending.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Pending" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
           <button 
            onClick={() => onPreview(pending.url)}
            className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/40 transition-all"
            title="Inspect HD"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => onDiscard(pending.id)}
          className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          title="Discard"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
          <span className="text-[9px] text-white font-black uppercase tracking-widest">Bulk Uploaded Item</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 bg-orange-50/20 justify-between">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">
              <Hash className="w-3.5 h-3.5" /> Enter Barcode
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-white border border-orange-100 rounded-2xl text-base font-mono font-bold focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-inner"
              placeholder="00000000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="bg-orange-100/40 p-3 rounded-2xl border border-orange-200/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Logging As</span>
              <p className="text-xs font-bold text-orange-900 truncate max-w-[150px]">{currentUser || 'No User Set'}</p>
            </div>
            <User className="w-4 h-4 text-orange-400" />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={!code.trim() || !currentUser.trim()}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-95 disabled:opacity-50 mt-4"
        >
          <Check className="w-5 h-5" /> Archive Now
        </button>
      </div>
    </div>
  );
};

export default PendingCard;
