
import React from 'react';
import { Trash2, Calendar, User, Maximize2 } from 'lucide-react';
import { ArchiveEntry, ThemeType } from '../types';

interface EntryCardProps {
  entry: ArchiveEntry;
  isAdmin: boolean;
  theme: ThemeType;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, isAdmin, theme, onDelete, onPreview }) => {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(entry.timestamp));

  const cardBg = theme === 'cyber' ? 'bg-black border-amber-900 text-amber-400' : 'bg-white border-slate-200 text-slate-900 shadow-md';
  
  // Smart Table Component logic
  const Row = ({ label, value, isFull = true, isYellow = true }: { label: string, value: any, isFull?: boolean, isYellow?: boolean }) => (
    <div className={`flex border-b border-slate-300 last:border-b-0 ${isFull ? 'w-full' : 'w-1/2'}`}>
      <div className="bg-black text-white px-2 py-1.5 text-[10px] font-bold uppercase shrink-0 w-[100px] flex items-center border-r border-white/10">
        {label}
      </div>
      <div className={`px-2 py-1.5 text-[10px] font-semibold flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-h-[28px] flex items-center ${isYellow ? 'bg-[#fff9e6]' : 'bg-white'}`}>
        {value || '-'}
      </div>
    </div>
  );

  return (
    <div className={`rounded-3xl overflow-hidden border transition-all duration-300 group flex flex-col ${cardBg}`}>
      {/* Image Area */}
      <div className="relative h-64 bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onPreview(entry.images[0].url)}>
        <img src={entry.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={entry.code} />
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Product Detail - Smart Table */}
        <div className="border border-slate-400 rounded overflow-hidden shadow-sm bg-slate-100">
          <div className="bg-[#337ab7] text-white py-1.5 text-center text-[10px] font-bold uppercase tracking-wider">Product Detail</div>
          
          <Row label="Barcode" value={entry.lookupData?.barcode || entry.code} />
          <Row label="ProductID" value={entry.lookupData?.productId} />
          <Row label="ProductName" value={entry.lookupData?.productName} />
          <Row label="Vendor" value={entry.lookupData?.vendorName} />
          
          <div className="flex">
            <Row label="SizeID" value={entry.lookupData?.sizeId} isFull={false} isYellow={false} />
            <Row label="ColorID" value={entry.lookupData?.colorId} isFull={false} isYellow={false} />
          </div>
          <div className="flex">
            <Row label="Price" value={entry.lookupData?.purchasePrice} isFull={false} isYellow={false} />
            <Row label="UOM" value={entry.lookupData?.uom} isFull={false} isYellow={false} />
          </div>
          <div className="flex">
            <Row label="Hir3" value={entry.lookupData?.hir3} isFull={false} isYellow={false} />
            <Row label="Hir5" value={entry.lookupData?.hir5} isFull={false} isYellow={false} />
          </div>
          <div className="flex">
            <Row label="CV Group" value={entry.lookupData?.cvGroup} isFull={false} isYellow={false} />
            <Row label="Last Yr" value={entry.lookupData?.lastPurchaseYear} isFull={false} isYellow={false} />
          </div>
          <div className="flex">
            <Row label="Stock" value={entry.lookupData?.closingStock} isFull={false} isYellow={false} />
            <Row label="Reserve" value={entry.lookupData?.qtyReserve} isFull={false} isYellow={false} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => onPreview(entry.images[0].url)} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Maximize2 className="w-3.5 h-3.5"/> Inspect
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(entry.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl">
              <Trash2 className="w-4 h-4"/>
            </button>
          )}
        </div>

        {/* Tiny Footer */}
        <div className="pt-3 border-t border-current/5 flex justify-between items-center text-[8px] font-black uppercase opacity-40">
           <span className="flex items-center gap-1"><User className="w-2.5 h-2.5"/> {entry.userName}</span>
           <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5"/> {formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
