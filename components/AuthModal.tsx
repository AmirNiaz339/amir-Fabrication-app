
import React, { useState } from 'react';
import { Layers, User as UserIcon, Lock, ArrowRight } from 'lucide-react';
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
      return alert("Authentication Failed. User not found or key incorrect.");
    }

    onLogin({ name: target.name, role: target.role });
  };

  const themeClasses = {
    indigo: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-950 text-slate-100',
    emerald: 'bg-emerald-50 text-emerald-950',
    cyber: 'bg-black text-amber-400'
  }[theme];

  const cardBg = theme === 'dark' || theme === 'cyber' ? 'bg-slate-900' : 'bg-white';
  const brandText = theme === 'cyber' ? 'text-amber-500' : 'text-indigo-600';
  const inputBg = theme === 'dark' || theme === 'cyber' ? 'bg-slate-800 border-current/20' : 'bg-slate-50 border-slate-200';
  const placeholderClass = theme === 'dark' || theme === 'cyber' ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${themeClasses}`}>
      <div className={`w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all border ${theme === 'cyber' ? 'border-amber-500/30' : 'border-current/10'} ${cardBg}`}>
        <div className="p-12 md:p-16">
          <div className="flex flex-col items-center text-center mb-12">
            <div className={`p-6 rounded-[2rem] mb-8 shadow-2xl ring-8 ring-current/5 ${theme === 'cyber' ? 'bg-amber-500 text-black shadow-amber-500/20' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}>
              <Layers className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">ARCHIVE<span className={brandText}>MAX</span></h1>
            <p className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'cyber' ? 'text-amber-600' : 'opacity-60'}`}>System Security Gateway</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <UserIcon className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${theme === 'cyber' ? 'text-amber-500' : 'opacity-40 group-focus-within:opacity-100'}`} />
              <input 
                type="text" 
                placeholder="Operator Username"
                className={`w-full pl-16 pr-8 py-6 rounded-[2rem] text-xl font-black outline-none border transition-all ${inputBg} ${placeholderClass} focus:border-current focus:ring-8 focus:ring-current/5`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${theme === 'cyber' ? 'text-amber-500' : 'opacity-40 group-focus-within:opacity-100'}`} />
              <input 
                type="password" 
                placeholder="Access Secret Key"
                className={`w-full pl-16 pr-8 py-6 rounded-[2rem] text-xl font-black outline-none border transition-all ${inputBg} ${placeholderClass} focus:border-current focus:ring-8 focus:ring-current/5`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-4 mt-6 text-sm ${theme === 'cyber' ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              INITIALIZE ARCHIVE <ArrowRight className="w-6 h-6" />
            </button>
          </form>

          <div className="mt-14 pt-10 border-t border-current/10 flex items-center justify-center">
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] text-center ${theme === 'cyber' ? 'text-amber-800' : 'opacity-40'}`}>Secured Terminal v2.5.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
