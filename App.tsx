
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search,
  Plus,
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
  Trash2
} from 'lucide-react';
import { ArchiveEntry, ArchiveImage, PendingEntry, ThemeType, UserSession, UserAccount } from './types';
import EntryCard from './components/EntryCard';
import CreatorCard from './components/CreatorCard';
import PendingCard from './components/PendingCard';
import ImagePreviewModal from './components/ImagePreviewModal';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
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
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Mgmt State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('visual_archive_entries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('visual_archive_entries', JSON.stringify(entries));
  }, [entries]);

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
    const newEntry: ArchiveEntry = {
      id: crypto.randomUUID(),
      code,
      userName,
      images: [{ id: crypto.randomUUID(), url: imageUrl, timestamp: Date.now() }],
      timestamp: Date.now(),
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

  const handleDeleteEntry = (id: string) => {
    if (session?.role !== 'admin') return;
    if (window.confirm("ADMIN ACTION: Delete this permanent record?")) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPass) return;
    const exists = accounts.find(a => a.name.toLowerCase() === newUserName.toLowerCase());
    if (exists) return alert("User already exists");

    const newAcc: UserAccount = {
      id: crypto.randomUUID(),
      name: newUserName,
      password: newUserPass,
      role: 'user'
    };
    setAccounts(prev => [...prev, newAcc]);
    setNewUserName('');
    setNewUserPass('');
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.find(a => a.id === id)?.name === 'admin') return alert("Cannot delete master admin");
    setAccounts(prev => prev.filter(a => a.id !== id));
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
    e.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const themeClasses = {
    indigo: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-950 text-slate-100',
    emerald: 'bg-emerald-50 text-slate-900',
    cyber: 'bg-black text-amber-400'
  }[theme];

  const brandColors = {
    indigo: 'text-indigo-600 bg-indigo-600',
    dark: 'text-blue-400 bg-blue-500',
    emerald: 'text-emerald-600 bg-emerald-600',
    cyber: 'text-amber-500 bg-amber-500'
  }[theme];

  if (!session) {
    return <AuthModal theme={theme} accounts={accounts} onLogin={setSession} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeClasses}`}>
      <header className={`${theme === 'dark' || theme === 'cyber' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b sticky top-0 z-40 px-6 py-4 shadow-xl`}>
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`${brandColors.split(' ')[1]} p-2.5 rounded-2xl shadow-lg ring-4 ring-current/10`}>
                <Layers className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">ARCHIVE<span className={brandColors.split(' ')[0]}>MAX</span></h1>
            </div>

            <div className="flex items-center gap-2 bg-slate-500/10 px-4 py-2 rounded-2xl border border-current/5">
               <Palette className="w-4 h-4 opacity-50" />
               <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as ThemeType)}
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none border-none cursor-pointer"
               >
                 <option value="indigo">Classic Indigo</option>
                 <option value="dark">Midnight Dark</option>
                 <option value="emerald">Emerald Forest</option>
                 <option value="cyber">Cyber Amber</option>
               </select>
            </div>

            {session.role === 'admin' && (
              <button 
                onClick={() => setShowUserMgmt(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                <Users className="w-4 h-4" /> Manage Users
              </button>
            )}

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isBulkProcessing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}
            >
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Bulk Upload
            </button>
            <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search archive..."
                className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm outline-none transition-all ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 focus:ring-4 focus:ring-indigo-100'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className={`flex items-center gap-3 pl-4 border-l border-current/10`}>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">User Logged</p>
                <p className="text-sm font-bold">{session.name} <span className="text-[10px] opacity-50">({session.role})</span></p>
              </div>
              <button 
                onClick={() => setSession(null)}
                className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className={`${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800' : 'bg-white'} border-b border-current/5 py-3 px-6 shadow-sm overflow-x-auto`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-center gap-12 whitespace-nowrap">
          <div className="flex items-center gap-3">
             <BarChart3 className={`w-5 h-5 ${brandColors.split(' ')[0]}`} />
             <span className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Analytics</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black">{stats.total}</span>
              <span className="text-[9px] font-bold uppercase opacity-40">Total</span>
            </div>
            <div className="w-px h-6 bg-current/10"></div>
            <div className="flex flex-col items-center">
              <span className={`text-lg font-black ${brandColors.split(' ')[0]}`}>{stats.subtotal}</span>
              <span className="text-[9px] font-bold uppercase opacity-40">Personal</span>
            </div>
            <div className="w-px h-6 bg-current/10"></div>
            <div className="flex flex-col items-center">
              <span className={`text-lg font-black ${stats.pending > 0 ? 'text-orange-500' : ''}`}>{stats.pending}</span>
              <span className="text-[9px] font-bold uppercase opacity-40">Queue</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-[1800px] mx-auto">
          {pendingEntries.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tighter">Queue Processing</h2>
                  <p className="text-xs opacity-50 font-bold uppercase tracking-widest">Assigning Barcodes</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {pendingEntries.map(pending => (
                  <PendingCard 
                    key={pending.id} 
                    pending={pending} 
                    currentUser={session.name}
                    theme={theme}
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
              <div className={`${brandColors.split(' ')[1]} p-2 rounded-xl text-white shadow-lg`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tighter">Secured Archive</h2>
                <p className="text-xs opacity-50 font-bold uppercase tracking-widest">Permanent Registry</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              <CreatorCard onSave={handleAddEntry} currentUser={session.name} theme={theme} />
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

      {/* User Management Modal */}
      {showUserMgmt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="p-8 border-b border-current/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">System User Rights</h3>
                <p className="text-xs opacity-50 font-bold uppercase tracking-widest">Assign Operator Privileges</p>
              </div>
              <button onClick={() => setShowUserMgmt(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleCreateAccount} className="flex gap-3 mb-8">
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="flex-1 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none border border-transparent focus:border-indigo-500 font-bold"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="flex-1 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none border border-transparent focus:border-indigo-500 font-bold"
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white px-6 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all">
                  <UserPlus className="w-5 h-5" /> Add
                </button>
              </form>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-current/5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${acc.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{acc.name}</p>
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{acc.role}</p>
                      </div>
                    </div>
                    {acc.name !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default App;
