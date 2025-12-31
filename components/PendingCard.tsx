
import React, { useState, useMemo } from 'react';
import { X, Hash, User, Trash2, Maximize2, Loader2, Save, Package, Check, Search } from 'lucide-react';
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

const PendingCard: React.FC<PendingCardProps> = ({ pending, currentUser, theme, masterData, onSave, onDiscard, onPreview }) => {
  const [code, setCode] = useState('');

  const matchedProduct = useMemo(() => {
    if (!code.trim()) return null;
    return masterData.find(row => row.barcode.trim() === code.trim());
  }, [code, masterData]);

  const handleSave = () => {
    if (!code.trim()) return alert("Barcode Identity Required");
    onSave(pending.id, code, currentUser, pending.url);
  };

  const cardBg = {
    indigo: 'bg-white border-orange-200',
    dark: 'bg-slate-900 border-orange-900/50',
    emerald: 'bg-white border-orange-100',
    cyber: 'bg-black border-orange-900'
  }[theme];

  const subLabelColor = theme === 'cyber' ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400';

  // Styling matching user screenshot theme
  const headerStyle = "bg-[#337ab7] text-white py-1 px-3 text-center text-[10px] font-bold uppercase border-b border-[#2e6da4]";
  const fullRowLabelStyle = "bg-black text-white px-2 py-1 text-[8px] font-bold uppercase flex items-center min-w-[100px] border-b border-white/10";
  const fullRowValueStyle = "bg-[#fff9e6] text-black px-2 py-1 text-[9px] font-semibold border-b border-slate-200 flex-1 min-h-[22px]";
  const gridLabelStyle = "bg-black text-white px-2 py-1 text-[7px] font-bold uppercase flex items-center min-w-[90px] border-b border-white/10";
  const gridValueStyle = "bg-white text-black px-2 py-1 text-[8px] font-semibold border-b border-slate-200 flex-1 italic truncate min-h-[20px]";

  return (
    <div className={`rounded-[2rem] overflow-hidden border-2 flex flex-col h-[920px] group transition-all duration-500 shadow-2xl relative ${cardBg}`}>
      <div className="relative h-64 flex-shrink-0 bg-slate-100 overflow-hidden border-b border-orange-100">
        <img src={pending.url} className="w-full h-full object-cover" alt="Pending upload" />
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 px-8 backdrop-blur-md">
           <button onClick={() => onPreview(pending.url)} className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-white/20 flex items-center justify-center gap-2 shadow-2xl">
            <Maximize2 className="w-4 h-4" />
            Full View
          </button>
        </div>
        <button 
          onClick={() => onDiscard(pending.id)}
          className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-2xl border border-red-500/20 active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/95 to-transparent flex items-end p-4">
          <div className="flex items-center gap-2 text-white">
             <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em]">Awaiting Identity</span>
          </div>
        </div>
      </div>

      <div className={`p-6 flex flex-col flex-1 gap-6`}>
        <div className="space-y-4">
          <div className="relative">
            <label className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">
              <Hash className="w-3.5 h-3.5" /> Barcode Input
            </label>
            <div className="relative">
              <input 
                type="text" 
                className={`w-full px-5 py-4 rounded-2xl text-xl font-mono font-black outline-none border transition-all shadow-inner ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-orange-900/50 text-white placeholder:text-slate-600' : 'bg-orange-50/50 border-orange-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-slate-900'}`}
                placeholder="TYPE BARCODE..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {matchedProduct ? <Check className="text-emerald-500 w-6 h-6" /> : <Search className="opacity-10 w-6 h-6" />}
              </div>
            </div>
          </div>

          {/* Table Preview Exactly Matching User Reference */}
          <div className={`border border-slate-400 rounded-sm overflow-hidden flex flex-col transition-all duration-300 shadow-sm ${matchedProduct ? 'opacity-100' : 'opacity-30 grayscale'}`}>
            <div className={headerStyle}>
              {matchedProduct ? 'Product Found' : 'Lookup Pending...'}
            </div>
            
            <div className="flex">
              <div className={fullRowLabelStyle}>ProductID</div>
              <div className={fullRowValueStyle}>{matchedProduct?.productId || '-'}</div>
            </div>
            <div className="flex">
              <div className={fullRowLabelStyle}>ProductName</div>
              <div className={fullRowValueStyle}>{matchedProduct?.productName || 'N/A'}</div>
            </div>
            <div className="flex">
              <div className={fullRowLabelStyle}>VendorName</div>
              <div className={fullRowValueStyle}>{matchedProduct?.vendorName || '-'}</div>
            </div>

            <div className="grid grid-cols-2">
              <div className="flex border-r border-slate-300">
                <div className={gridLabelStyle}>Size</div>
                <div className={gridValueStyle}>{matchedProduct?.sizeId || '-'}</div>
              </div>
              <div className="flex">
                <div className={gridLabelStyle}>Color</div>
                <div className={gridValueStyle}>{matchedProduct?.colorId || '-'}</div>
              </div>

              <div className="flex border-r border-slate-300">
                <div className={gridLabelStyle}>Price</div>
                <div className={gridValueStyle}>{matchedProduct?.purchasePrice || '-'}</div>
              </div>
              <div className="flex">
                <div className={gridLabelStyle}>Stock</div>
                <div className={`${gridValueStyle} text-[#337ab7] font-black`}>{matchedProduct?.closingStock || '0'}</div>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border ${theme === 'cyber' ? 'bg-amber-500/5 border-amber-900/50' : 'bg-orange-500/5 border-orange-500/10'}`}>
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[8px] font-black uppercase tracking-widest ${subLabelColor}`}>Operator</span>
              <p className="text-xs font-black truncate max-w-[140px] leading-tight">{currentUser}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-xl active:scale-95 mt-auto"
        >
          <Save className="w-5 h-5" /> Save Record
        </button>
      </div>
    </div>
  );
};

export default PendingCard;
