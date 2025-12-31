
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Search, Layers, Upload, Loader2, X, Trash2, Database, 
  FileSpreadsheet, Printer, Download, RefreshCw, Settings, 
  LogOut, Palette, ChevronDown, ChevronUp, FileText, CheckSquare, Square, 
  ArrowUpDown, Filter, User as UserIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ArchiveEntry, PendingEntry, ThemeType, UserSession, UserAccount, ExcelRow, SortOption } from './types';
import EntryCard from './components/EntryCard';
import CreatorCard from './components/CreatorCard';
import PendingCard from './components/PendingCard';
import ImagePreviewModal from './components/ImagePreviewModal';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [masterData, setMasterData] = useState<ExcelRow[]>(() => {
    const saved = localStorage.getItem('archive_master_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('archive_accounts');
    if (saved) return JSON.parse(saved);
    return [{ id: '1', name: 'admin', password: 'admin', role: 'admin' }];
  });
  
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('archive_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('archive_theme') as ThemeType) || 'indigo-light');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminTab, setAdminTab] = useState<'USERS' | 'MASTER_DATA'>('USERS');
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterOperator, setFilterOperator] = useState<string>('all');
  
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const themes: ThemeType[] = [
    'indigo-light', 'indigo-dark', 'emerald-light', 'emerald-dark', 
    'rose-light', 'rose-dark', 'amber-light', 'amber-dark', 
    'violet-light', 'violet-dark', 'cyan-light', 'cyan-dark',
    'orange-light', 'orange-dark', 'lime-light', 'lime-dark',
    'fuchsia-light', 'fuchsia-dark', 'sky-light', 'sky-dark',
    'zinc-light', 'zinc-dark', 'slate-light', 'slate-dark'
  ];

  useEffect(() => {
    const saved = localStorage.getItem('visual_archive_entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // Sync existing entries when masterData changes to ensure detail "showing" logic works instantly
  useEffect(() => {
    if (masterData.length > 0 && entries.length > 0) {
      setEntries(current => current.map(entry => {
        const match = masterData.find(m => m.barcode.toString().trim().toLowerCase() === entry.code.toString().trim().toLowerCase());
        return { ...entry, lookupData: match || entry.lookupData };
      }));
    }
  }, [masterData]);

  useEffect(() => {
    localStorage.setItem('visual_archive_entries', JSON.stringify(entries));
    localStorage.setItem('archive_master_data', JSON.stringify(masterData));
    localStorage.setItem('archive_theme', theme);
    if (session) localStorage.setItem('archive_session', JSON.stringify(session));
  }, [entries, masterData, theme, session]);

  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Skip header row and map to ExcelRow type with more robust type handling
        const mappedData: ExcelRow[] = rawData.slice(1).map(row => {
          const toStringSafe = (val: any) => (val === null || val === undefined) ? '' : val.toString().trim();
          return {
            barcode: toStringSafe(row[0]),
            productId: toStringSafe(row[1]),
            productName: toStringSafe(row[2]),
            sizeId: toStringSafe(row[3]),
            colorId: toStringSafe(row[4]),
            vendorName: toStringSafe(row[5]),
            purchasePrice: toStringSafe(row[6]),
            uom: toStringSafe(row[7]),
            hir3: toStringSafe(row[8]),
            hir5: toStringSafe(row[9]),
            cvGroup: toStringSafe(row[10]),
            lastPurchaseYear: toStringSafe(row[11]),
            closingStock: toStringSafe(row[12]) || '0',
            qtyReserve: toStringSafe(row[13]) || '0',
          };
        }).filter(r => r.barcode !== '');

        if (mappedData.length === 0) {
          alert("No data found in the Excel file. Please ensure barcodes are in the first column.");
        } else {
          setMasterData(mappedData);
          alert(`Successfully imported ${mappedData.length} records.`);
        }
        setIsProcessing(false);
        setShowAdminPanel(false);
      } catch (err) {
        console.error("Excel processing error:", err);
        setIsProcessing(false);
        alert("Excel parse error. Please check your file formatting.");
      }
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert("Error reading file.");
    };
    reader.readAsBinaryString(file);
    if (excelFileInputRef.current) excelFileInputRef.current.value = '';
  };

  const handleAddEntry = (code: string, userName: string, url: string) => {
    const lookup = masterData.find(d => d.barcode.toString().trim().toLowerCase() === code.toString().trim().toLowerCase());
    const newEntry: ArchiveEntry = {
      id: crypto.randomUUID(),
      code: code.trim(),
      userName,
      images: [{ id: crypto.randomUUID(), url, timestamp: Date.now() }],
      timestamp: Date.now(),
      lookupData: lookup,
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingEntries(prev => [
          ...prev,
          { id: Math.random().toString(36).substr(2, 9), url: event.target?.result as string }
        ]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSavePending = (id: string, code: string, userName: string, url: string) => {
    handleAddEntry(code, userName, url);
    setPendingEntries(prev => prev.filter(p => p.id !== id));
  };

  const handlePrint = (mode: 'all' | 'selected') => {
    const targets = mode === 'selected' ? entries.filter(e => selectedIds.has(e.id)) : entries;
    if (targets.length === 0) return alert("Nothing selected to print.");
    
    setShowMenu(false);
    // Print handled by @media print CSS and the hidden template in the JSX
    setTimeout(() => window.print(), 100);
  };

  const handleExportData = () => {
    const targets = selectedIds.size > 0 ? entries.filter(e => selectedIds.has(e.id)) : entries;
    const dataToExport = targets.map(e => ({
      Barcode: e.lookupData?.barcode || e.code,
      Product: e.lookupData?.productName || 'N/A',
      Vendor: e.lookupData?.vendorName || 'N/A',
      'Closing Stock': e.lookupData?.closingStock || '0',
      Operator: e.userName,
      Timestamp: new Date(e.timestamp).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `AmirNiaz_Inventory_${Date.now()}.xlsx`);
    setShowMenu(false);
  };

  const processedEntries = useMemo(() => {
    let result = [...entries];

    // Filter by search
    const q = searchQuery.toLowerCase();
    if (q) {
      result = result.filter(e => {
        const inMain = e.code.toLowerCase().includes(q) || e.userName.toLowerCase().includes(q);
        const inLookup = e.lookupData && Object.values(e.lookupData).some(v => v?.toString().toLowerCase().includes(q));
        return inMain || inLookup;
      });
    }

    // Filter by operator
    if (filterOperator !== 'all') {
      result = result.filter(e => e.userName === filterOperator);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return a.timestamp - b.timestamp;
        case 'barcode-asc': return a.code.localeCompare(b.code);
        case 'barcode-desc': return b.code.localeCompare(a.code);
        case 'vendor-asc': return (a.lookupData?.vendorName || '').localeCompare(b.lookupData?.vendorName || '');
        case 'product-asc': return (a.lookupData?.productName || '').localeCompare(b.lookupData?.productName || '');
        default: return b.timestamp - a.timestamp;
      }
    });

    return result;
  }, [entries, searchQuery, sortBy, filterOperator]);

  const operators = useMemo(() => Array.from(new Set(entries.map(e => e.userName))), [entries]);

  const brandColor = theme.split('-')[0];
  const isDark = theme.endsWith('-dark');
  const themeClass = isDark ? `bg-${brandColor}-950 text-${brandColor}-100` : `bg-${brandColor}-50 text-${brandColor}-950`;

  if (!session) return <AuthModal theme={theme} accounts={accounts} onLogin={setSession} />;

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${themeClass}`}>
      
      {/* PROFESSIONAL PDF/PRINT TEMPLATE (Hidden from UI) */}
      <div className="hidden print:block p-10 bg-white text-black min-h-screen">
        <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">AMIR NIAZ FABRICATION</h1>
            <p className="text-sm font-bold opacity-60">Visual Inventory Report • {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
             <p className="font-black text-2xl">TOTAL RECORDS: {(selectedIds.size > 0 ? selectedIds.size : processedEntries.length)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {(selectedIds.size > 0 ? entries.filter(e => selectedIds.has(e.id)) : processedEntries).map(e => (
            <div key={e.id} className="border-2 border-black rounded-xl p-4 flex gap-4 break-inside-avoid">
               <div className="w-1/3 aspect-square bg-slate-100 flex items-center justify-center">
                 <img src={e.images[0].url} className="w-full h-full object-contain" />
               </div>
               <div className="w-2/3 flex flex-col gap-1 text-[9px] font-bold">
                  <p className="text-xs font-black uppercase border-b mb-1 pb-1">BARCODE: {e.code}</p>
                  <p>PRODUCT: {e.lookupData?.productName || 'N/A'}</p>
                  <p>VENDOR: {e.lookupData?.vendorName || 'N/A'}</p>
                  <p>PRICE: {e.lookupData?.purchasePrice || 'N/A'}</p>
                  <p>STOCK: {e.lookupData?.closingStock || '0'}</p>
                  <p className="mt-auto opacity-40">Operator: {e.userName}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      <header className={`sticky top-0 z-40 px-6 py-4 shadow-2xl print:hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-b`}>
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-100 transition-all active:scale-95">
              <div className={`bg-${brandColor}-600 text-white p-3 rounded-2xl shadow-lg ring-4 ring-current/10 group-hover:rotate-12 transition-transform`}>
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <h1 className="text-lg font-black tracking-tighter uppercase whitespace-nowrap">AMIR NIAZ <span className={`text-${brandColor}-600`}>PRO</span></h1>
                <span className="text-[8px] font-black uppercase opacity-40 flex items-center gap-1 tracking-widest mt-1">Command Center <ChevronDown className="w-2 h-2"/></span>
              </div>
            </button>

            {showMenu && (
              <div className={`absolute top-full left-0 mt-4 w-72 rounded-3xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="p-3 bg-slate-500/5 border-b flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase opacity-40 px-2">Visual Styles</span>
                </div>
                <div className="p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                   <div className="px-2 py-2 grid grid-cols-1 gap-1">
                      {themes.map(t => (
                        <button key={t} onClick={() => { setTheme(t); setShowMenu(false); }} className={`text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-3 transition-all ${theme === t ? 'bg-blue-600 text-white' : 'hover:bg-slate-500/10'}`}>
                          <Palette className="w-3 h-3" /> {t.replace('-', ' ')}
                        </button>
                      ))}
                   </div>
                  <div className="h-px bg-slate-500/10 my-2 mx-2"></div>
                  <button onClick={() => handlePrint('selected')} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-500/10 text-xs font-black uppercase transition-all">
                    <Printer className="w-4 h-4 text-slate-500" /> Print Selected
                  </button>
                  <button onClick={() => handlePrint('all')} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-500/10 text-xs font-black uppercase transition-all">
                    <FileText className="w-4 h-4 text-orange-500" /> Save as PDF
                  </button>
                  <button onClick={handleExportData} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-500/10 text-xs font-black uppercase transition-all">
                    <Download className="w-4 h-4 text-emerald-500" /> Excel Export
                  </button>
                  {session.role === 'admin' && (
                    <button onClick={() => { setShowAdminPanel(true); setShowMenu(false); }} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-500/10 text-xs font-black uppercase transition-all">
                      <Settings className="w-4 h-4 text-blue-600" /> Admin Panel
                    </button>
                  )}
                  <div className="h-px bg-slate-500/10 my-2 mx-2"></div>
                  <button onClick={() => setSession(null)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-red-500/10 text-red-600 text-xs font-black uppercase transition-all">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 max-w-2xl px-4 w-full">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:text-blue-600 group-focus-within:opacity-100 transition-all" />
              <input 
                type="text" placeholder="Omni-Search Registry (Name, ID, Vendor...)"
                className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border transition-all shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => setShowCreatorModal(true)} className={`bg-${brandColor}-600 text-white flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all`}>
              <Plus className="w-5 h-5" /> <span>Add New</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className={`p-4 border rounded-2xl transition-all active:scale-95 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <Upload className="w-5 h-5 opacity-60" />
            </button>
            <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
          </div>
        </div>
      </header>

      {/* INTELLIGENCE BAR: ADVANCED FILTERS, SORTING & STATS */}
      <div className={`border-b shadow-inner py-3 px-6 print:hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full lg:w-auto">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60 whitespace-nowrap">
              <ArrowUpDown className="w-3 h-3"/> Sort
            </div>
            <select 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
            >
              <option value="newest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="barcode-asc">Barcode (A-Z)</option>
              <option value="barcode-desc">Barcode (Z-A)</option>
              <option value="vendor-asc">Vendor (A-Z)</option>
              <option value="product-asc">Product (A-Z)</option>
            </select>

            <div className="w-px h-4 bg-slate-300 mx-2"></div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60 whitespace-nowrap">
              <Filter className="w-3 h-3"/> Operator
            </div>
            <select 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              value={filterOperator} onChange={e => setFilterOperator(e.target.value)}
            >
              <option value="all">All Operators</option>
              {operators.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
              <div className="flex flex-col items-center"><span className="opacity-40 mb-1">Total</span><span>{entries.length}</span></div>
              <div className="flex flex-col items-center"><span className="opacity-40 mb-1">Database</span><span className="text-blue-600">{masterData.length}</span></div>
              <div className="flex flex-col items-center"><span className="opacity-40 mb-1">Staging</span><span className="text-orange-500">{pendingEntries.length}</span></div>
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedIds(new Set(processedEntries.map(e => e.id)))} className="p-2 hover:bg-slate-400/10 rounded-lg text-blue-600"><CheckSquare className="w-5 h-5"/></button>
              <button onClick={() => setSelectedIds(new Set())} className="p-2 hover:bg-slate-400/10 rounded-lg text-slate-400"><Square className="w-5 h-5"/></button>
              <span className="text-[10px] font-black uppercase text-blue-600">{selectedIds.size} Ready</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {pendingEntries.map(pending => (
              <PendingCard key={pending.id} pending={pending} currentUser={session.name} theme={theme} masterData={masterData}
                onSave={handleSavePending} onDiscard={id => setPendingEntries(prev => prev.filter(p => p.id !== id))} onPreview={setPreviewImageUrl}
              />
            ))}
            {processedEntries.map(entry => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                isAdmin={session.role === 'admin'} 
                theme={theme}
                selected={selectedIds.has(entry.id)}
                onToggleSelect={() => setSelectedIds(prev => {
                  const n = new Set(prev);
                  if (n.has(entry.id)) n.delete(entry.id);
                  else n.add(entry.id);
                  return n;
                })}
                onDelete={id => { if(window.confirm("Delete record?")) setEntries(prev => prev.filter(e => e.id !== id)) }}
                onPreview={setPreviewImageUrl}
              />
            ))}
          </div>
          {processedEntries.length === 0 && pendingEntries.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center text-center opacity-10">
               <Database className="w-24 h-24 mb-6" />
               <p className="text-3xl font-black uppercase tracking-widest">Archive Empty</p>
            </div>
          )}
        </div>
      </main>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className={`rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl border relative ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
            {isProcessing && (
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                 <Loader2 className="w-16 h-16 animate-spin mb-4" />
                 <p className="font-black uppercase tracking-widest text-sm">Parsing Master Database...</p>
              </div>
            )}
            <div className="p-8 border-b flex justify-between items-center bg-slate-500/5">
              <div className="flex gap-6">
                <button onClick={() => setAdminTab('USERS')} className={`text-sm font-black uppercase tracking-widest ${adminTab === 'USERS' ? 'text-blue-600' : 'opacity-40'}`}>Personnel</button>
                <button onClick={() => setAdminTab('MASTER_DATA')} className={`text-sm font-black uppercase tracking-widest ${adminTab === 'MASTER_DATA' ? 'text-blue-600' : 'opacity-40'}`}>System Database</button>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className={`p-2 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><X /></button>
            </div>
            
            <div className="p-10">
              {adminTab === 'USERS' ? (
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <input type="text" placeholder="Operator Name" className={`flex-1 p-4 rounded-2xl border outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'}`} value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                      <input type="password" placeholder="Key" className={`flex-1 p-4 rounded-2xl border outline-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'}`} value={newUserPass} onChange={e => setNewUserPass(e.target.value)} />
                      <button onClick={() => {
                        if(!newUserName || !newUserPass) return;
                        setAccounts([...accounts, { id: Date.now().toString(), name: newUserName, password: newUserPass, role: 'user' }]);
                        setNewUserName(''); setNewUserPass('');
                      }} className="px-10 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Auth</button>
                   </div>
                   <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {accounts.map(acc => (
                        <div key={acc.id} className={`flex justify-between items-center p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                          <span className="font-bold text-sm uppercase">{acc.name} <span className="text-[9px] bg-slate-500/10 px-3 py-1 rounded-full ml-3">{acc.role}</span></span>
                          {acc.name !== 'admin' && <button onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>}
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-10 text-center">
                  <div className={`p-16 border-2 border-dashed rounded-[2.5rem] w-full transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <FileSpreadsheet className="w-20 h-20 mx-auto mb-6 text-blue-600 opacity-20" />
                    <p className="text-sm font-bold mb-8">Import 14-Column Master Data Sheet (.xlsx)</p>
                    <button onClick={() => excelFileInputRef.current?.click()} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Select Master File</button>
                    <input type="file" ref={excelFileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleExcelFileUpload} />
                  </div>
                  <div className="w-full flex justify-between items-center text-[10px] font-black uppercase opacity-40 border-t pt-6">
                    <span>Active Rows: {masterData.length}</span>
                    <button onClick={() => {if(window.confirm("Wipe?")) setMasterData([])}} className="text-red-500 hover:underline">Clear Registry</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreatorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg">
            <CreatorCard 
              onSave={(code, user, url) => { handleAddEntry(code, user, url); setShowCreatorModal(false); }}
              onClose={() => setShowCreatorModal(false)}
              currentUser={session.name} theme={theme} masterData={masterData}
            />
          </div>
        </div>
      )}

      {previewImageUrl && <ImagePreviewModal url={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />}
    </div>
  );
};

export default App;
