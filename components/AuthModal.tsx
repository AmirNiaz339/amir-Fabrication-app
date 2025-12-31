
import React, { useState } from 'react';
import { Layers, ShieldCheck, User as UserIcon, Lock, ArrowRight } from 'lucide-react';
import { ThemeType, UserSession, UserAccount } from '../types';

interface AuthModalProps {
  theme: ThemeType;
  accounts: UserAccount[];
  onLogin: (session: UserSession) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ theme, accounts, onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = accounts.find(a => a.name.toLowerCase() === name.toLowerCase());
    
    if (!target || target.password !== password) {
      return alert("Invalid Credentials. Please contact Admin.");
    }

    onLogin({ name: target.name, role: target.role });
  };

  const themeClasses = {
    indigo: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-950 text-slate-100',
    emerald: 'bg-emerald-50 text-slate-900',
    cyber: 'bg-black text-amber-400'
  }[theme];

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${themeClasses}`}>
      <div className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border ${theme === 'cyber' ? 'border-amber-500/30' : 'border-current/5'} ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="p-10 md:p-14">
          <div className="flex flex-col items-center text-center mb-10">
            <div className={`p-5 rounded-3xl mb-6 shadow-xl ${theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white'}`}>
              <Layers className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">ARCHIVE<span className={theme === 'cyber' ? 'text-amber-500' : 'text-indigo-600'}>MAX</span></h1>
            <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em]">Authorized Access Control</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
              <input 
                type="text" 
                placeholder="Authorized Username"
                className={`w-full pl-14 pr-6 py-5 rounded-2xl text-lg font-bold outline-none border transition-all ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-slate-700 focus:border-amber-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
              <input 
                type="password" 
                placeholder="Access Key"
                className={`w-full pl-14 pr-6 py-5 rounded-2xl text-lg font-bold outline-none border transition-all ${theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 ${theme === 'cyber' ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              Authenticate <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-current/5 flex items-center justify-center opacity-30">
            <span className="text-[10px] font-black uppercase tracking-widest text-center">Unauthorized attempts are logged for security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
