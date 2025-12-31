
import React from 'react';
import { Trash2, Calendar, Hash, User, Maximize2, CheckCircle2 } from 'lucide-react';
import { ArchiveEntry, ThemeType } from '../types';

interface EntryCardProps {
  entry: ArchiveEntry;
  isAdmin: boolean;
  theme: ThemeType;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, isAdmin, theme, onDelete, onPreview }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(entry.timestamp));

  const cardBg = {
    indigo: 'bg-white border-slate-200 text-slate-900',
    dark: 'bg-slate-900 border-slate-800 text-slate-50',
    emerald: 'bg-white border-emerald-100 text-emerald-950',
    cyber: 'bg-black border-amber-900 text-amber-400'
  }[theme];

  const subLabelColor = theme === 'cyber' ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400';
  const brandText = theme === 'cyber' ? 'text-amber-500' : 'text-indigo-600';
  const iconBg = theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white';

  return (
    <div className={`rounded-[2.5rem] overflow-hidden border transition-all duration-500 flex flex-col h-[540px] group ${cardBg} hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-2`}>
      <div className="relative h-64 bg-slate-100 flex-shrink-0 overflow-hidden">
        <img src={entry.images[0].url} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-125" alt={entry.code} />
        
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 px-8 backdrop-blur-md">
          <button 
            onClick={() => onPreview(entry.images[0].url)}
            className="flex-1 py-5 bg-white text-slate-900 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex flex-col items-center gap-3 active:scale-95 shadow-2xl"
          >
            <Maximize2 className="w-6 h-6" />
            Open Viewer
          </button>
          {isAdmin && (
            <button 
              onClick={() => onDelete(entry.id)}
              className="flex-1 py-5 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex flex-col items-center gap-3 active:scale-95 shadow-2xl"
            >
              <Trash2 className="w-6 h-6" />
              Delete
            </button>
          )}
        </div>

        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-white/20">
            <CheckCircle2 className={`w-4 h-4 ${brandText}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Verified Item</span>
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 justify-between">
        <div className="space-y-6">
          <div>
            <div className={`flex items-center gap-2 mb-2 ${subLabelColor}`}>
              <Hash className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Barcode Identification</span>
            </div>
            <h3 className={`font-mono font-black text-2xl truncate px-4 py-3 rounded-2xl border ${theme === 'cyber' ? 'bg-amber-500/10 border-amber-900' : 'bg-slate-50 dark:bg-slate-800 border-current/10'}`}>
              {entry.code}
            </h3>
          </div>

          <div className={`flex items-center gap-5 px-6 py-4 rounded-[1.5rem] border ${theme === 'cyber' ? 'bg-amber-500/5 border-amber-900/50' : 'bg-slate-50 dark:bg-slate-800/40 border-current/5'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${iconBg}`}>
              <User className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-[10px] font-black uppercase tracking-widest ${subLabelColor}`}>Logged By</span>
              <span className="text-lg font-black truncate">{entry.userName}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-current/10 flex flex-col gap-5">
          <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${subLabelColor}`}>
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${theme === 'cyber' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'}`}></div>
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${subLabelColor}`}>Secured Archive</span>
             </div>
             <button onClick={() => onPreview(entry.images[0].url)} className={`text-[11px] font-black uppercase tracking-[0.2em] border-b-2 ${brandText} border-current/30 hover:border-current transition-all`}>
               HD View
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
