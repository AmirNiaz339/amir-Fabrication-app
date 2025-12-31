
import React from 'react';
import { Trash2, Calendar, Hash, User, Maximize2, ShieldCheck, CheckCircle2 } from 'lucide-react';
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

  const cardBg = theme === 'dark' || theme === 'cyber' ? 'bg-slate-900 border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200 shadow-sm';
  const brandText = theme === 'cyber' ? 'text-amber-500' : 'text-indigo-600';

  return (
    <div className={`rounded-[2.5rem] overflow-hidden border transition-all duration-500 flex flex-col h-[520px] group ${cardBg} hover:shadow-2xl hover:-translate-y-1`}>
      <div className="relative h-64 bg-slate-100 flex-shrink-0 overflow-hidden">
        <img src={entry.images[0].url} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-125" />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 px-6 backdrop-blur-sm">
          <button 
            onClick={() => onPreview(entry.images[0].url)}
            className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex flex-col items-center gap-2"
          >
            <Maximize2 className="w-6 h-6" />
            Inspect HD
          </button>
          {isAdmin && (
            <button 
              onClick={() => onDelete(entry.id)}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex flex-col items-center gap-2 shadow-xl shadow-red-900/30"
            >
              <Trash2 className="w-6 h-6" />
              Delete
            </button>
          )}
        </div>

        <div className="absolute top-5 left-5">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-white/20">
            <CheckCircle2 className={`w-4 h-4 ${brandText}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Archived Record</span>
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 justify-between">
        <div className="space-y-6">
          <div>
            <div className={`flex items-center gap-2 mb-2 opacity-50`}>
              <Hash className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Reference</span>
            </div>
            <h3 className={`font-mono font-black text-2xl truncate p-3 rounded-2xl border border-current/10 ${theme === 'cyber' ? 'bg-amber-500/5' : 'bg-slate-50'}`}>
              {entry.code}
            </h3>
          </div>

          <div className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] border border-current/5 ${theme === 'cyber' ? 'bg-amber-500/5' : 'bg-slate-100/50'}`}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white'}`}>
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Captured By</span>
              <span className="text-base font-bold truncate">{entry.userName}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-current/5 flex flex-col gap-4">
          <div className="flex items-center gap-2 opacity-40 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${theme === 'cyber' ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Permanent Storage</span>
             </div>
             <button onClick={() => onPreview(entry.images[0].url)} className={`text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 ${brandText}`}>
               Open Viewer
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
