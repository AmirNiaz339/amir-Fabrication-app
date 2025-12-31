
import React from 'react';
import { Trash2, Calendar, User, Maximize2, CheckCircle2 } from 'lucide-react';
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

  // Specific layout styling matching user screenshot
  const headerStyle = "bg-[#337ab7] text-white py-1.5 px-4 text-center text-xs font-bold uppercase border-b border-[#2e6da4]";
  const fullRowLabelStyle = "bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase flex items-center min-w-[120px] border-b border-white/20";
  const fullRowValueStyle = "bg-[#fff9e6] text-black px-3 py-1.5 text-[11px] font-semibold border-b border-slate-300 flex-1 min-h-[30px]";
  const gridLabelStyle = "bg-black text-white px-3 py-1.5 text-[9px] font-bold uppercase flex items-center min-w-[110px] border-b border-white/20";
  const gridValueStyle = "bg-white text-black px-3 py-1.5 text-[10px] font-semibold border-b border-slate-300 flex-1 italic truncate min-h-[28px]";

  return (
    <div className={`rounded-[1.5rem] overflow-hidden border transition-all duration-500 flex flex-col h-[940px] group ${cardBg} hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)]`}>
      <div className="relative h-64 bg-slate-100 flex-shrink-0 overflow-hidden">
        <img src={entry.images[0].url} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" alt={entry.code} />
        
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 px-8 backdrop-blur-md">
          <button 
            onClick={() => onPreview(entry.images[0].url)}
            className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex flex-col items-center gap-2 active:scale-95 shadow-2xl"
          >
            <Maximize2 className="w-5 h-5" />
            Full Screen
          </button>
          {isAdmin && (
            <button 
              onClick={() => onDelete(entry.id)}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex flex-col items-center gap-2 active:scale-95 shadow-2xl"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          )}
        </div>

        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/20">
            <CheckCircle2 className={`w-3.5 h-3.5 ${brandText}`} />
            <span className="text-[9px] font-black uppercase text-slate-900">Archived Registry</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-6 overflow-hidden">
        {/* Product Detail Layout Exactly Matching User's Screenshot */}
        <div className="border border-slate-400 rounded shadow-md overflow-hidden flex flex-col bg-slate-200">
          <div className={headerStyle}>
            Product Detail
          </div>
          
          <div className="flex">
            <div className={fullRowLabelStyle}>Bararcode</div>
            <div className={fullRowValueStyle}>{entry.lookupData?.barcode || entry.code}</div>
          </div>
          <div className="flex">
            <div className={fullRowLabelStyle}>ProductID</div>
            <div className={fullRowValueStyle}>{entry.lookupData?.productId || 'N/A'}</div>
          </div>
          <div className="flex">
            <div className={fullRowLabelStyle}>ProductName</div>
            <div className={fullRowValueStyle}>{entry.lookupData?.productName || 'N/A'}</div>
          </div>
          <div className="flex">
            <div className={fullRowLabelStyle}>VendorName</div>
            <div className={fullRowValueStyle}>{entry.lookupData?.vendorName || 'N/A'}</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="flex border-r border-slate-300">
              <div className={gridLabelStyle}>SizeID</div>
              <div className={gridValueStyle}>{entry.lookupData?.sizeId || '-'}</div>
            </div>
            <div className="flex">
              <div className={gridLabelStyle}>ColorID</div>
              <div className={gridValueStyle}>{entry.lookupData?.colorId || '-'}</div>
            </div>

            <div className="flex border-r border-slate-300">
              <div className={gridLabelStyle}>PurchasePrice</div>
              <div className={gridValueStyle}>{entry.lookupData?.purchasePrice || '0.00'}</div>
            </div>
            <div className="flex">
              <div className={gridLabelStyle}>UOM</div>
              <div className={gridValueStyle}>{entry.lookupData?.uom || '-'}</div>
            </div>

            <div className="flex border-r border-slate-300">
              <div className={gridLabelStyle}>Hir3</div>
              <div className={gridValueStyle}>{entry.lookupData?.hir3 || '-'}</div>
            </div>
            <div className="flex">
              <div className={gridLabelStyle}>Hir5</div>
              <div className={gridValueStyle}>{entry.lookupData?.hir5 || '-'}</div>
            </div>

            <div className="flex border-r border-slate-300">
              <div className={gridLabelStyle}>CV Group</div>
              <div className={gridValueStyle}>{entry.lookupData?.cvGroup || '-'}</div>
            </div>
            <div className="flex">
              <div className={gridLabelStyle}>L.Purchase Year</div>
              <div className={gridValueStyle}>{entry.lookupData?.lastPurchaseYear || '-'}</div>
            </div>

            <div className="flex border-r border-slate-300">
              <div className={gridLabelStyle}>Closing Stock</div>
              <div className={`${gridValueStyle} font-black text-[#22c55e]`}>{entry.lookupData?.closingStock || '0'}</div>
            </div>
            <div className="flex">
              <div className={gridLabelStyle}>Qty Resrve</div>
              <div className={`${gridValueStyle} font-black text-[#ef4444]`}>{entry.lookupData?.qtyReserve || '0'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border ${theme === 'cyber' ? 'bg-amber-500/5 border-amber-900/50' : 'bg-slate-50 dark:bg-slate-800/40 border-current/5'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white'}`}>
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-[9px] font-black uppercase tracking-widest ${subLabelColor}`}>Operator</span>
              <span className="text-sm font-black truncate">{entry.userName}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-current/10 flex items-center justify-between">
            <div className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider ${subLabelColor}`}>
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest opacity-20`}>ID: {entry.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
