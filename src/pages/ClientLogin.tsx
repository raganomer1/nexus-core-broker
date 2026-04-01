import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function ClientLogin() {
  const navigate = useNavigate();
  const { login, clients } = useStore();
  const { lang } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => { setError(''); const client = clients.find(c => c.email === email); if (client) { login('client', client.id); navigate('/client'); } else setError(t(lang, 'clientNotFound')); };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, hsl(220, 25%, 8%) 0%, hsl(220, 30%, 15%) 50%, hsl(217, 91%, 20%) 100%)' }}>
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 text-white">
        <div className="flex items-center gap-3 mb-8"><TrendingUp size={40} className="text-blue-400" /><span className="text-3xl font-bold tracking-tight">BrokerPlatform</span></div>
        <h1 className="text-4xl font-bold mb-4 leading-tight">{t(lang, 'traderCabinet')}</h1>
        <p className="text-lg text-white/60 mb-8 max-w-md">{t(lang, 'manageAccounts')}</p>
      </div>
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-8">
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6 lg:hidden"><TrendingUp size={24} className="text-primary" /><span className="text-xl font-bold">BrokerPlatform</span></div>
          <h2 className="text-xl font-semibold mb-1">{t(lang, 'loginToAccount')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t(lang, 'clientArea')}</p>
          <div className="space-y-4">
            <div><label className="text-xs text-muted-foreground font-medium">{t(lang, 'email')}</label><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="smirnov@mail.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
            <div><label className="text-xs text-muted-foreground font-medium">{t(lang, 'password')}</label><div className="relative"><Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} /><button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span className="text-muted-foreground">{t(lang, 'rememberMe')}</span></label><button className="text-primary text-xs hover:underline">{t(lang, 'forgotPassword')}</button></div>
            <Button className="w-full" onClick={handleLogin}>{t(lang, 'login')}</Button>
          </div>
          <div className="mt-6 p-3 bg-muted/50 rounded-lg"><p className="text-xs font-medium text-muted-foreground mb-2">{t(lang, 'demoAccess')}</p><div className="text-xs text-muted-foreground"><button className="text-primary hover:underline" onClick={() => setEmail('smirnov@mail.com')}>smirnov@mail.com</button></div></div>
          
        </div>
      </div>
    </div>
  );
}
