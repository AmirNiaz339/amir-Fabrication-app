
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

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem('visual_archive_entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('visual_archive_entries', JSON.stringify(entries));
    localStorage.setItem('archive_master_data', JSON.stringify(masterData));
  }, [entries, masterData]);

  // Sync session and theme
  useEffect(() => {
    localStorage.setItem('archive_theme', theme);
    if (session) localStorage.setItem('archive_session', JSON.stringify(session));
    else localStorage.removeItem('archive_session');
  }, [theme, session]);

  // IMPORTANT: Auto-Lookup logic when Excel data changes
  useEffect(() => {
    if (masterData.length > 0 && entries.length > 0) {
      setEntries(currentEntries => 
        currentEntries.map(entry => {
          const match = masterData.find(row => 
            row.barcode.toString().trim().toLowerCase() === entry.code.trim().toLowerCase()
          );
          // Only update if lookup data is found or changed
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
      alert(`Success! Imported ${newMasterData.length} entries. Data lookup will auto-sync.`);
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

  const filteredEntries = entries.filter(e => 
    e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.lookupData?.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const themeClasses = {
    indigo: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-950 text-slate-50',
    emerald: 'bg-emerald-50 text-emerald-950',
    cyber: 'bg-black text-amber-400'
  }[theme];

  const headerBg = theme === 'cyber' ? 'bg-black border-amber-900' : 'bg-white border-slate-200';
  const brandColors = theme === 'cyber' ? 'text-amber-500 bg-amber-500 border-amber-900' : 'text-blue-600 bg-blue-600 border-blue-200';

  if (!session) return <AuthModal theme={theme} accounts={accounts} onLogin={setSession} />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeClasses}`}>
      <header className={`${headerBg} border-b sticky top-0 z-40 px-6 py-4 shadow-xl`}>
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
              Add New Record
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
            <div className="relative flex-1 xl:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <input 
                type="text" 
                placeholder="Search database..."
                className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-bold outline-none border transition-all ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-current/10">
              {session.role === 'admin' && (
                <button onClick={() => setShowAdminPanel(true)} className="p-3 rounded-2xl bg-current/5 hover:bg-current/10"><Database className="w-5 h-5" /></button>
              )}
              <button onClick={() => setSession(null)} className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar - Data Summary */}
      <div className={`${theme === 'dark' || theme === 'cyber' ? 'bg-slate-900' : 'bg-slate-100'} border-b border-current/5 py-3 px-6 overflow-x-auto`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-center gap-10 whitespace-nowrap">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black">{stats.total}</span>
              <span className="text-[9px] font-black uppercase opacity-60">Total Cards</span>
            </div>
            <div className="w-px h-6 bg-current/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-blue-600">{masterData.length}</span>
              <span className="text-[9px] font-black uppercase opacity-60">Excel Records</span>
            </div>
            <div className="w-px h-6 bg-current/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-orange-500">{stats.pending}</span>
              <span className="text-[9px] font-black uppercase opacity-60">In Queue</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-[1800px] mx-auto">
          {pendingEntries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mb-20">
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
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
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

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className={`${theme === 'dark' || theme === 'cyber' ? 'bg-slate-900' : 'bg-white'} rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-current/10`}>
            <div className="p-8 border-b border-current/10 flex justify-between items-center">
              <div className="flex gap-6">
                <button onClick={() => setAdminTab('USERS')} className={`text-sm font-black uppercase tracking-widest ${adminTab === 'USERS' ? 'text-blue-600' : 'opacity-40'}`}>Users</button>
                <button onClick={() => setAdminTab('MASTER_DATA')} className={`text-sm font-black uppercase tracking-widest ${adminTab === 'MASTER_DATA' ? 'text-blue-600' : 'opacity-40'}`}>Excel Data</button>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="p-2 bg-slate-100 rounded-full text-slate-900"><X /></button>
            </div>
            
            <div className="p-10">
              {adminTab === 'USERS' ? (
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <input type="text" placeholder="Username" className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                      <input type="password" placeholder="Pass" className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} />
                      <button onClick={() => {
                        if(!newUserName || !newUserPass) return;
                        setAccounts([...accounts, { id: Date.now().toString(), name: newUserName, password: newUserPass, role: 'user' }]);
                        setNewUserName(''); setNewUserPass('');
                      }} className="px-8 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Add User</button>
                   </div>
                   <div className="max-h-60 overflow-y-auto space-y-2">
                      {accounts.map(acc => (
                        <div key={acc.id} className="flex justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="font-bold">{acc.name} ({acc.role})</span>
                          {acc.name !== 'admin' && <button onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} className="text-red-500"><Trash2 className="w-4 h-4"/></button>}
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-10">
                  <div className="text-center p-10 border-2 border-dashed border-slate-200 rounded-3xl w-full">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <p className="text-sm font-bold mb-6">Upload your 14-Column Master Excel File</p>
                    <button onClick={() => excelFileInputRef.current?.click()} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Select Excel File</button>
                    <input type="file" ref={excelFileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleExcelFileUpload} />
                  </div>
                  <div className="w-full flex justify-between items-center text-xs font-black uppercase opacity-40">
                    <span>Loaded Rows: {masterData.length}</span>
                    <button onClick={() => setMasterData([])} className="text-red-500 underline">Clear Database</button>
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
