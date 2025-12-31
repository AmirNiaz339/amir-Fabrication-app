
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
      return alert("Authentication Failed.");
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
  const brandText = theme === 'cyber' ? 'text-amber-500' : 'text-blue-600';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${themeClasses}`}>
      <div className={`w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl transition-all border border-current/5 ${cardBg}`}>
        <div className="p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className={`p-5 rounded-2xl mb-6 ${theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}>
              <Layers className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter mb-2">AMIR NIAZ <span className={brandText}>FABRICATION</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Identity Gateway</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Operator ID"
              className={`w-full px-6 py-5 rounded-2xl text-lg font-black outline-none border transition-all ${theme === 'cyber' ? 'bg-black border-amber-900' : 'bg-slate-50 border-slate-200'}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Access Key"
              className={`w-full px-6 py-5 rounded-2xl text-lg font-black outline-none border transition-all ${theme === 'cyber' ? 'bg-black border-amber-900' : 'bg-slate-50 border-slate-200'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="submit"
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 mt-4 text-xs ${theme === 'cyber' ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}
            >
              Initialize App <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
