
import React from 'react';
import { Trash2, Calendar, Hash, User, Maximize2, ShieldCheck } from 'lucide-react';
import { ArchiveEntry } from '../types';

interface EntryCardProps {
  entry: ArchiveEntry;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, isAdmin, onDelete, onPreview }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(entry.timestamp));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-[480px] group">
      {/* Visual Area */}
      <div className="relative h-56 bg-slate-100 flex-shrink-0 overflow-hidden">
        <img 
          src={entry.images[0].url} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
          alt={entry.code} 
        />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={() => onPreview(entry.images[0].url)}
            className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-2xl scale-90 group-hover:scale-100 duration-300 flex flex-col items-center gap-1"
          >
            <Maximize2 className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase">Inspect HD</span>
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => onDelete(entry.id)}
              className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-2xl scale-90 group-hover:scale-100 duration-300 flex flex-col items-center gap-1"
            >
              <Trash2 className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase">Delete</span>
            </button>
          )}
        </div>

        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Archived Item
          </span>
        </div>
      </div>

      {/* Detail Area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Hash className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Barcode Reference</span>
            </div>
            <h3 className="font-mono font-bold text-slate-900 text-xl break-all line-clamp-1 leading-none bg-slate-50 p-2 rounded-lg border border-slate-100">
              {entry.code}
            </h3>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Entry Operator</span>
              <span className="text-sm font-bold text-slate-700 truncate">{entry.userName}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secured Archive</span>
             </div>
             <button 
              onClick={() => onPreview(entry.images[0].url)}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
             >
               Open HD View
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
