
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search,
  X,
  Plus,
  Layers,
  Upload,
  Loader2,
  User as UserIcon,
  Maximize2
} from 'lucide-react';
import { ArchiveEntry, ArchiveImage, PendingEntry } from './types';
import EntryCard from './components/EntryCard';
import CreatorCard from './components/CreatorCard';
import PendingCard from './components/PendingCard';
import ImagePreviewModal from './components/ImagePreviewModal';

const ADMIN_PASSWORD = 'admin';

const App: React.FC = () => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('archive_current_user') || '');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load archive data
  useEffect(() => {
    const saved = localStorage.getItem('visual_archive_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse archive data", e);
      }
    }
  }, []);

  // Save archive data
  useEffect(() => {
    localStorage.setItem('visual_archive_entries', JSON.stringify(entries));
  }, [entries]);

  // Persist current user
  useEffect(() => {
    localStorage.setItem('archive_current_user', currentUser);
  }, [currentUser]);

  const handleAddEntry = (code: string, userName: string, imageUrl: string) => {
    const newEntry: ArchiveEntry = {
      id: crypto.randomUUID(),
      code: code,
      userName: userName || 'Unknown User',
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
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = (re) => resolve(re.target?.result as string);
        reader.readAsDataURL(file);
      });
      const url = await promise;
      newPending.push({ id: crypto.randomUUID(), url });
    }

    setPendingEntries(prev => [...newPending, ...prev]);
    setIsBulkProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteEntry = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("ADMIN ONLY: Are you sure you want to permanently delete this record?")) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const verifyAdmin = () => {
    if (adminPassInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassInput('');
    } else {
      alert("Incorrect admin password");
    }
  };

  const filteredEntries = entries.filter(e => 
    e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
                <Layers className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">ARCHIVE<span className="text-indigo-600">PRO</span></h1>
            </div>
            
            <div className="hidden md:flex h-6 w-px bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Set User Name..."
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-32 placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isBulkProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all border border-indigo-100 active:scale-95 disabled:opacity-50"
            >
              {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Bulk Upload
            </button>
            <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search barcode, code, or user..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 px-4 text-xs font-black uppercase tracking-widest shadow-sm ${
                isAdmin 
                ? 'bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-50' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {isAdmin ? 'Admin On' : 'Admin Login'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-[1800px] mx-auto">
          {pendingEntries.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 w-2.5 h-2.5 rounded-full animate-pulse shadow-lg shadow-orange-200"></div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Awaiting Barcode Details ({pendingEntries.length})</h2>
                </div>
                <button 
                  onClick={() => setPendingEntries([])}
                  className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100"
                >
                  Discard All Pending
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {pendingEntries.map(pending => (
                  <PendingCard 
                    key={pending.id} 
                    pending={pending} 
                    currentUser={currentUser}
                    onSave={handleSavePending}
                    onDiscard={(id) => setPendingEntries(prev => prev.filter(p => p.id !== id))}
                    onPreview={setPreviewImageUrl}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Main Archive Repository</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <CreatorCard onSave={handleAddEntry} currentUser={currentUser} />
            {filteredEntries.map(entry => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                isAdmin={isAdmin}
                onDelete={handleDeleteEntry}
                onPreview={setPreviewImageUrl}
              />
            ))}
          </div>

          {filteredEntries.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-bold">No matches for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Admin Login</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Management Override</p>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <input 
                  type="password" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-center font-bold text-lg"
                  placeholder="••••••••"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
                  autoFocus
                />
                <button 
                  onClick={verifyAdmin}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                >
                  Verify Access
                </button>
              </div>
              <p className="text-center mt-6 text-[10px] text-slate-300 uppercase tracking-widest font-black">Credential: admin</p>
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
