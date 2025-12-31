
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, 
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
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('archive_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (session) localStorage.setItem('archive_session', JSON.stringify(session));
    else localStorage.removeItem('archive_session');
  }, [session]);

  const handleAddEntry = (code: string, userName: string, imageUrl: string) => {
    const barcodeTrimmed = code.trim();
    // Case-insensitive lookup
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
      
      // Convert to array of arrays to handle column order strictly
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      // Assume Row 0 is header, actual data starts from Row 1
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
      alert(`Success! Imported ${newMasterData.length} entries from Excel.`);
    };
    reader.readAsBinaryString(file);
    if (excelFileInputRef.current) excelFileInputRef.current.value = '';
  };

  const handleDeleteEntry = (id: string) => {
    if (session?.role !== 'admin') return;
    if (window.confirm("ADMIN ACTION: Delete this permanent record?")) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPass.trim()) return;
    const exists = accounts.find(a => a.name.toLowerCase() === newUserName.toLowerCase());
    if (exists) return alert("User already exists");

    const newAcc: UserAccount = {
      id: crypto.randomUUID(),
      name: newUserName.trim(),
      password: newUserPass.trim(),
      role: 'user'
    };
    setAccounts(prev => [...prev, newAcc]);
    setNewUserName('');
    setNewUserPass('');
  };

  const handleDeleteAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (acc?.name === 'admin') return alert("Cannot delete master admin");
    if (window.confirm(`Remove access for ${acc?.name}?`)) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
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

  const brandColors = {
    indigo: 'text-indigo-600 bg-indigo-600 border-indigo-200',
    dark: 'text-blue-400 bg-blue-500 border-blue-900',
    emerald: 'text-emerald-700 bg-emerald-600 border-emerald-200',
    cyber: 'text-amber-500 bg-amber-500 border-amber-900'
  }[theme];

  const headerBg = {
    indigo: 'bg-white border-slate-200',
    dark: 'bg-slate-900 border-slate-800',
    emerald: 'bg-white border-emerald-100',
    cyber: 'bg-black border-amber-900'
  }[theme];

  const modalInnerBg = {
    indigo: 'bg-white text-slate-900',
    dark: 'bg-slate-900 text-slate-50',
    emerald: 'bg-white text-emerald-950',
    cyber: 'bg-zinc-950 text-amber-400'
  }[theme];

  const inputStyle = {
    indigo: 'bg-slate-50 border-slate-200 text-slate-900',
    dark: 'bg-slate-800 border-slate-700 text-white',
    emerald: 'bg-emerald-50/50 border-emerald-100 text-emerald-900',
    cyber: 'bg-black border-amber-900 text-amber-400'
  }[theme];

  if (!session) {
    return <AuthModal theme={theme} accounts={accounts} onLogin={setSession} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeClasses}`}>
      <header className={`${headerBg} border-b sticky top-0 z-40 px-6 py-4 shadow-xl`}>
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`${brandColors.split(' ')[1]} p-2.5 rounded-2xl shadow-lg ring-4 ring-current/20`}>
                <Layers className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">ARCHIVE<span className={brandColors.split(' ')[0]}>MAX</span></h1>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${theme === 'cyber' ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-500/10 border-current/10'}`}>
               <Palette className="w-4 h-4 opacity-70" />
               <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as ThemeType)}
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none border-none cursor-pointer focus:ring-0"
               >
                 <option value="indigo" className="text-slate-900">Classic Indigo</option>
                 <option value="dark" className="text-slate-900">Midnight Dark</option>
                 <option value="emerald" className="text-slate-900">Emerald Forest</option>
                 <option value="cyber" className="text-slate-900">Cyber Amber</option>
               </select>
            </div>

            {session.role === 'admin' && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${theme === 'cyber' ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-current/20'}`}
              >
                <Database className="w-4 h-4" /> Admin Panel
              </button>
            )}

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isBulkProcessing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${theme === 'cyber' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}
            >
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Bulk Upload
            </button>
            <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'cyber' ? 'text-amber-500' : 'opacity-60'}`} />
              <input 
                type="text" 
                placeholder="Search database or product..."
                className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-bold outline-none border transition-all ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-current/20 text-white placeholder:text-slate-500' : 'bg-slate-100 border-slate-200 focus:ring-4 focus:ring-indigo-100'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className={`flex items-center gap-3 pl-4 border-l ${theme === 'cyber' ? 'border-amber-900' : 'border-current/10'}`}>
              <div className="text-right hidden sm:block">
                <p className={`text-[9px] font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-600' : 'opacity-60'}`}>Session</p>
                <p className="text-sm font-black">{session.name}</p>
              </div>
              <button 
                onClick={() => setSession(null)}
                className={`p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-sm`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className={`${theme === 'dark' || theme === 'cyber' ? 'bg-slate-900/50' : 'bg-slate-100/50'} border-b border-current/10 py-4 px-6 shadow-inner overflow-x-auto`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-center gap-12 whitespace-nowrap">
          <div className="flex items-center gap-3">
             <BarChart3 className={`w-5 h-5 ${brandColors.split(' ')[0]}`} />
             <span className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'cyber' ? 'text-amber-600' : 'opacity-60'}`}>Data Summary</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">{stats.total}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-700' : 'opacity-60'}`}>Total</span>
            </div>
            <div className="w-px h-8 bg-current/20"></div>
            <div className="flex flex-col items-center">
              <span className={`text-xl font-black ${brandColors.split(' ')[0]}`}>{stats.subtotal}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-700' : 'opacity-60'}`}>Personal</span>
            </div>
            <div className="w-px h-8 bg-current/20"></div>
            <div className="flex flex-col items-center">
              <span className={`text-xl font-black ${stats.pending > 0 ? 'text-orange-500' : ''}`}>{stats.pending}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-700' : 'opacity-60'}`}>In Queue</span>
            </div>
            <div className="w-px h-8 bg-current/20"></div>
            <div className="flex flex-col items-center">
              <span className={`text-xl font-black text-emerald-500`}>{masterData.length}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-700' : 'opacity-60'}`}>Master Excel</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-[1800px] mx-auto">
          {pendingEntries.length > 0 && (
            <section className="mb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-xl shadow-orange-500/20">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Queue Sorting</h2>
                  <p className={`text-xs font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-600' : 'opacity-70'}`}>Assign identities with Live Excel Lookup</p>
                </div>
              </div>
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
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className={`${brandColors.split(' ')[1]} p-2.5 rounded-2xl text-white shadow-xl shadow-current/20`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Secured Archive</h2>
                <p className={`text-xs font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-600' : 'opacity-70'}`}>Verified records with full Matrix Data</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              <CreatorCard onSave={handleAddEntry} currentUser={session.name} theme={theme} masterData={masterData} />
              {filteredEntries.map(entry => (
                <EntryCard 
                  key={entry.id} 
                  entry={entry} 
                  isAdmin={session.role === 'admin'}
                  theme={theme}
                  onDelete={handleDeleteEntry}
                  onPreview={setPreviewImageUrl}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className={`${modalInnerBg} rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-current/20`}>
            <div className="p-10 border-b border-current/10 flex justify-between items-center bg-current/5">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setAdminTab('USERS')}
                  className={`flex items-center gap-3 text-xl font-black uppercase tracking-tight transition-all ${adminTab === 'USERS' ? brandColors.split(' ')[0] : 'opacity-40'}`}
                >
                  <Users className="w-6 h-6" /> User Access
                </button>
                <div className="w-px h-8 bg-current/20"></div>
                <button 
                  onClick={() => setAdminTab('MASTER_DATA')}
                  className={`flex items-center gap-3 text-xl font-black uppercase tracking-tight transition-all ${adminTab === 'MASTER_DATA' ? brandColors.split(' ')[0] : 'opacity-40'}`}
                >
                  <FileSpreadsheet className="w-6 h-6" /> Master Excel Data
                </button>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className={`p-3 rounded-full transition-all ${theme === 'cyber' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-10">
              {adminTab === 'USERS' ? (
                <>
                  <form onSubmit={handleCreateAccount} className="flex flex-col md:flex-row gap-4 mb-10">
                    <input 
                      type="text" 
                      placeholder="Username" 
                      className={`flex-1 px-6 py-4 rounded-2xl outline-none border font-bold ${inputStyle}`}
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                    <input 
                      type="password" 
                      placeholder="Security Key" 
                      className={`flex-1 px-6 py-4 rounded-2xl outline-none border font-bold ${inputStyle}`}
                      value={newUserPass}
                      onChange={(e) => setNewUserPass(e.target.value)}
                    />
                    <button type="submit" className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${theme === 'cyber' ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                      <UserPlus className="w-5 h-5" /> Add
                    </button>
                  </form>

                  <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {accounts.map(acc => (
                      <div key={acc.id} className={`flex items-center justify-between p-5 rounded-3xl border ${theme === 'cyber' ? 'bg-amber-500/5 border-amber-900/50' : 'bg-current/5 border-current/10'}`}>
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl shadow-sm ${acc.role === 'admin' ? (theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white') : 'bg-current/10'}`}>
                            <UserIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-lg leading-none mb-1">{acc.name}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-amber-600' : 'opacity-70'}`}>Role: {acc.role}</p>
                          </div>
                        </div>
                        {acc.name !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteAccount(acc.id)}
                            className={`p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 active:scale-90`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className={`p-6 rounded-3xl border border-dashed ${theme === 'cyber' ? 'border-amber-500/30 bg-amber-500/5' : 'border-indigo-200 bg-indigo-50/30'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className={brandColors.split(' ')[0]} />
                      <div className="text-sm font-bold opacity-80">
                        <p>Upload your Excel file (.xlsx) or (.xls) directly. The system will look up data based on the Barcode in the first column.</p>
                        <p className="mt-2 text-[10px] font-mono opacity-60">System enforced column order:</p>
                        <ol className="mt-1 list-decimal list-inside text-[9px] grid grid-cols-2 gap-x-4">
                          <li>barcode</li><li>ProductID</li><li>ProductName</li><li>SizeID</li>
                          <li>ColorID</li><li>VendorName</li><li>PurchasePrice</li><li>UOM</li>
                          <li>Hir3</li><li>Hir5</li><li>CV Group</li><li>Last Purchase Year</li>
                          <li>Qty - Closing Stock</li><li>Qty Resrve</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                         <button 
                          onClick={() => excelFileInputRef.current?.click()}
                          className={`flex-1 py-12 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${theme === 'cyber' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                        >
                          <FileUp className="w-12 h-12" />
                          <div className="text-center">
                            <span className="font-black uppercase tracking-widest text-sm block">Select Excel File</span>
                            <span className="text-[10px] opacity-50">.xlsx / .xls files supported</span>
                          </div>
                        </button>
                        <input type="file" ref={excelFileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleExcelFileUpload} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-black opacity-60 uppercase tracking-widest">Active Records: {masterData.length} entries</p>
                     <button onClick={() => { if(window.confirm("Clear all master data?")) setMasterData([]); }} className="text-red-500 text-[10px] font-black uppercase tracking-widest underline underline-offset-4">Reset Database</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImageUrl && (
        <ImagePreviewModal 
          url={previewImageUrl} 
          onClose={() => setPreviewImageUrl(null)} 
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--current-color), 0.2);
          border-radius: 10px;
        }
        ${theme === 'cyber' ? '.custom-scrollbar::-webkit-scrollbar-thumb { background: #f59e0b; }' : ''}
      `}</style>
    </div>
  );
};

export default App;
