
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus,
  Search,
  Layers,
  Upload,
  Loader2,
  User as UserIcon,
  LogOut,
  BarChart3,
  Palette,
  Users,
  X,
  UserPlus,
  Trash2,
  Database,
  FileSpreadsheet,
  AlertCircle,
  FileUp
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ArchiveEntry, PendingEntry, ThemeType, UserSession, UserAccount, ExcelRow } from './types';
import EntryCard from './components/EntryCard';
import CreatorCard from './components/CreatorCard';
import PendingCard from './components/PendingCard';
import ImagePreviewModal from './components/ImagePreviewModal';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
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
  
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('archive_theme') as ThemeType) || 'indigo');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [adminTab, setAdminTab] = useState<'USERS' | 'MASTER_DATA'>('USERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('visual_archive_entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('visual_archive_entries', JSON.stringify(entries));
    localStorage.setItem('archive_master_data', JSON.stringify(masterData));
  }, [entries, masterData]);

  useEffect(() => {
    localStorage.setItem('archive_theme', theme);
    if (session) localStorage.setItem('archive_session', JSON.stringify(session));
    else localStorage.removeItem('archive_session');
  }, [theme, session]);

  useEffect(() => {
    if (masterData.length > 0 && entries.length > 0) {
      setEntries(currentEntries => 
        currentEntries.map(entry => {
          const match = masterData.find(row => 
            row.barcode.toString().trim().toLowerCase() === entry.code.trim().toLowerCase()
          );
          if (match && JSON.stringify(match) !== JSON.stringify(entry.lookupData)) {
            return { ...entry, lookupData: match };
          }
          return entry;
        })
      );
    }
  }, [masterData]);

  const handleAddEntry = (code: string, userName: string, imageUrl: string) => {
    const barcodeTrimmed = code.trim();
    const lookup = masterData.find(row => 
      row.barcode.toString().trim().toLowerCase() === barcodeTrimmed.toLowerCase()
    );
    
    const newEntry: ArchiveEntry = {
      id: crypto.randomUUID(),
      code: barcodeTrimmed,
      userName,
      images: [{ id: crypto.randomUUID(), url: imageUrl, timestamp: Date.now() }],
      timestamp: Date.now(),
      lookupData: lookup
    };
    setEntries(prev => [newEntry, ...prev]);
    setShowCreatorModal(false);
  };

  const handleSavePending = (pendingId: string, code: string, userName: string, imageUrl: string) => {
    handleAddEntry(code, userName, imageUrl);
    setPendingEntries(prev => prev.filter(p => p.id !== pendingId));
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsBulkProcessing(true);
    const newPending: PendingEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = (re) => res(re.target?.result as string);
        reader.readAsDataURL(file);
      });
      newPending.push({ id: crypto.randomUUID(), url });
    }
    setPendingEntries(prev => [...newPending, ...prev]);
    setIsBulkProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      const actualRows = data.slice(1);
      
      const newMasterData: ExcelRow[] = actualRows.map(row => ({
        barcode: row[0]?.toString() || '',
        productId: row[1]?.toString() || '',
        productName: row[2]?.toString() || '',
        sizeId: row[3]?.toString() || '',
        colorId: row[4]?.toString() || '',
        vendorName: row[5]?.toString() || '',
        purchasePrice: row[6]?.toString() || '',
        uom: row[7]?.toString() || '',
        hir3: row[8]?.toString() || '',
        hir5: row[9]?.toString() || '',
        cvGroup: row[10]?.toString() || '',
        lastPurchaseYear: row[11]?.toString() || '',
        closingStock: row[12]?.toString() || '',
        qtyReserve: row[13]?.toString() || '0',
      })).filter(row => row.barcode !== '');

      setMasterData(newMasterData);
      alert(`Success! Imported ${newMasterData.length} entries.`);
    };
    reader.readAsBinaryString(file);
    if (excelFileInputRef.current) excelFileInputRef.current.value = '';
  };

  const stats = useMemo(() => {
    return {
      total: entries.length,
      subtotal: entries.filter(e => e.userName === session?.name).length,
      pending: pendingEntries.length
    };
  }, [entries, pendingEntries, session]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return entries;
    
    return entries.filter(e => {
      // Search in basic info
      if (e.code.toLowerCase().includes(q)) return true;
      if (e.userName.toLowerCase().includes(q)) return true;
      
      // Search in all lookup fields
      if (e.lookupData) {
        return Object.values(e.lookupData).some(val => 
          val?.toString().toLowerCase().includes(q)
        );
      }
      return false;
    });
  }, [entries, searchQuery]);

  if (!session) return <AuthModal theme={theme} accounts={accounts} onLogin={setSession} />;

  // Define themeClasses based on current theme to fix the 'Cannot find name' error
  const themeClasses = {
    indigo: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-950 text-slate-100',
    emerald: 'bg-emerald-50 text-emerald-950',
    cyber: 'bg-black text-amber-400'
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeClasses}`}>
      <header className="bg-white border-b sticky top-0 z-40 px-6 py-4 shadow-xl">
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg">
                <Layers className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black tracking-tighter">AMIR NIAZ <span className="text-blue-600">FABRICATION APPLICATION</span></h1>
            </div>

            <button 
              onClick={() => setShowCreatorModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Record
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase bg-slate-100 text-slate-900 border border-slate-200 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" /> Bulk Photos
            </button>
            <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-[500px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <input 
                type="text" 
                placeholder="Search anything (Barcode, Product, Vendor, Price...)"
                className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-bold outline-none border border-slate-200 bg-slate-50 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              {session.role === 'admin' && (
                <button onClick={() => setShowAdminPanel(true)} className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all"><Database className="w-5 h-5" /></button>
              )}
              <button onClick={() => setSession(null)} className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="bg-slate-100 border-b border-slate-200 py-3 px-6 overflow-x-auto shadow-inner">
        <div className="max-w-[1800px] mx-auto flex items-center justify-center gap-10 whitespace-nowrap">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black">{stats.total}</span>
              <span className="text-[9px] font-black uppercase opacity-60">Archived Cards</span>
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-blue-600">{masterData.length}</span>
              <span className="text-[9px] font-black uppercase opacity-60">Database Records</span>
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-orange-500">{stats.pending}</span>
              <span className="text-[9px] font-black uppercase opacity-60">Upload Queue</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {pendingEntries.map(pending => (
              <PendingCard 
                key={pending.id} 
                pending={pending} 
                currentUser={session.name}
                theme={theme}
                masterData={masterData}
                onSave={handleSavePending}
                onDiscard={(id) => setPendingEntries(prev => prev.filter(p => p.id !== id))}
                onPreview={setPreviewImageUrl}
              />
            ))}
            {filteredEntries.map(entry => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                isAdmin={session.role === 'admin'}
                theme={theme}
                onDelete={(id) => { if(window.confirm("Delete record?")) setEntries(prev => prev.filter(e => e.id !== id)) }}
                onPreview={setPreviewImageUrl}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex gap-6">
                <button onClick={() => setAdminTab('USERS')} className={`text-sm font-black uppercase tracking-widest ${adminTab === 'USERS' ? 'text-blue-600' : 'opacity-40'}`}>User Management</button>
                <button onClick={() => setAdminTab('MASTER_DATA')} className={`text-sm font-black uppercase tracking-widest ${adminTab === 'MASTER_DATA' ? 'text-blue-600' : 'opacity-40'}`}>Excel Database</button>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="p-2 bg-white rounded-full text-slate-900 shadow-sm border"><X /></button>
            </div>
            
            <div className="p-10">
              {adminTab === 'USERS' ? (
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <input type="text" placeholder="Username" className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none border" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                      <input type="password" placeholder="Key" className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none border" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} />
                      <button onClick={() => {
                        if(!newUserName || !newUserPass) return;
                        setAccounts([...accounts, { id: Date.now().toString(), name: newUserName, password: newUserPass, role: 'user' }]);
                        setNewUserName(''); setNewUserPass('');
                      }} className="px-8 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Add New</button>
                   </div>
                   <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                      {accounts.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-sm">{acc.name} <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full ml-2">{acc.role}</span></span>
                          {acc.name !== 'admin' && <button onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>}
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-10">
                  <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-[2rem] w-full bg-slate-50">
                    <FileSpreadsheet className="w-16 h-16 mx-auto mb-6 text-blue-600 opacity-40" />
                    <p className="text-sm font-bold mb-8">Import your master fabrication data (14 columns)</p>
                    <button onClick={() => excelFileInputRef.current?.click()} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 active:scale-95 transition-all">Select Excel File</button>
                    <input type="file" ref={excelFileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleExcelFileUpload} />
                  </div>
                  <div className="w-full flex justify-between items-center text-[10px] font-black uppercase opacity-40 border-t pt-6">
                    <span>Synchronized Rows: {masterData.length}</span>
                    <button onClick={() => {if(window.confirm("Purge database?")) setMasterData([])}} className="text-red-500 hover:underline">Reset Inventory Data</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creator Modal */}
      {showCreatorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg">
            <CreatorCard 
              onSave={handleAddEntry} 
              onClose={() => setShowCreatorModal(false)}
              currentUser={session.name} 
              theme={theme} 
              masterData={masterData} 
            />
          </div>
        </div>
      )}

      {previewImageUrl && <ImagePreviewModal url={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />}
    </div>
  );
};

export default App;
