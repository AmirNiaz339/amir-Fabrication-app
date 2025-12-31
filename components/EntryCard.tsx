
import React from 'react';
import { Trash2, Calendar, User, Maximize2, CheckCircle2, Circle } from 'lucide-react';
import { ArchiveEntry, ThemeType } from '../types';

interface EntryCardProps {
  entry: ArchiveEntry;
  isAdmin: boolean;
  theme: ThemeType;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, isAdmin, theme, selected, onToggleSelect, onDelete, onPreview }) => {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(entry.timestamp));

  const isDark = theme.endsWith('-dark');

  const roundVal = (val: string | undefined) => {
    if (!val || val === '0') return '0';
    const parsed = parseFloat(val);
    return isNaN(parsed) ? val : Math.round(parsed).toLocaleString();
  };

  const Row = ({ label, value, isFull = true, isYellow = true }: { label: string, value: any, isFull?: boolean, isYellow?: boolean }) => (
    <div className={`flex border-b border-slate-300 last:border-b-0 ${isFull ? 'w-full' : 'w-1/2'}`}>
      <div className="bg-zinc-950 text-white px-2.5 py-2 text-[7px] font-black uppercase shrink-0 w-[100px] flex items-center border-r border-white/5 tracking-wider leading-tight">
        {label}
      </div>
      <div className={`px-4 py-2 text-[11px] font-bold flex-1 whitespace-nowrap overflow-hidden text-ellipsis min-h-[36px] flex items-center leading-none ${isYellow ? (isDark ? 'bg-yellow-900/10 text-yellow-500' : 'bg-[#fffcf0] text-slate-900') : (isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800')}`}>
        {value || '-'}
      </div>
    </div>
  );

  return (
    <div className={`rounded-[2.5rem] overflow-hidden transition-all duration-300 group flex flex-col shadow-xl relative border-2 ${selected ? 'border-blue-600 ring-4 ring-blue-600/10 scale-95' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}>
      
      {/* Selection Control */}
      <button onClick={onToggleSelect} className="absolute top-5 left-5 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-2xl transition-all active:scale-90 border border-slate-100 print:hidden">
         {selected ? <CheckCircle2 className="w-6 h-6 text-blue-600" /> : <Circle className="w-6 h-6 text-slate-300" />}
      </button>

      <div className="relative h-64 bg-black/5 overflow-hidden cursor-pointer" onClick={() => onPreview(entry.images[0].url)}>
        <img src={entry.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={entry.code} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <Maximize2 className="text-white w-10 h-10 drop-shadow-2xl" />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Professional Metadata Grid */}
        <div className="border border-slate-400 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-zinc-950 text-white py-2 text-center text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/10">Archive Identity</div>
          
          <Row label="Barcode" value={entry.lookupData?.barcode || entry.code} />
          <Row label="ProductID" value={entry.lookupData?.productId} />
          <Row label="ProductName" value={entry.lookupData?.productName} />
          <Row label="VendorName" value={entry.lookupData?.vendorName} />
          <Row label="Hierarchy 3" value={entry.lookupData?.hir3} />
          <Row label="Hierarchy 5" value={entry.lookupData?.hir5} />
          
          <div className="flex">
            <Row label="Size" value={entry.lookupData?.sizeId} isFull={false} isYellow={false} />
            <Row label="Color" value={entry.lookupData?.colorId} isFull={false} isYellow={false} />
          </div>
          <div className="flex">
            <Row label="Price" value={entry.lookupData?.purchasePrice} isFull={false} isYellow={false} />
            <Row label="UOM" value={entry.lookupData?.uom} isFull={false} isYellow={false} />
          </div>
          <div className="flex">
            <Row label="CV Group" value={entry.lookupData?.cvGroup} isFull={false} isYellow={false} />
            <Row label="Last Yr" value={entry.lookupData?.lastPurchaseYear} isFull={false} isYellow={false} />
          </div>
          <div className="flex">
            <Row label="Stock" value={roundVal(entry.lookupData?.closingStock)} isFull={false} isYellow={false} />
            <Row label="Reserve" value={roundVal(entry.lookupData?.qtyReserve)} isFull={false} isYellow={false} />
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          <button onClick={() => onPreview(entry.images[0].url)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
             Inspect
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(entry.id)} className="p-3 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-500/20 transition-all">
              <Trash2 className="w-4 h-4"/>
            </button>
          )}
        </div>

        <div className="pt-3 border-t border-slate-500/10 flex justify-between items-center text-[8px] font-black uppercase opacity-40">
           <span className="flex items-center gap-1.5"><User className="w-3 h-3"/> {entry.userName}</span>
           <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3"/> {formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
