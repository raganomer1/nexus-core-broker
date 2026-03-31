import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, employees } = useStore();
  const { lang } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => { setError(''); const emp = employees.find(e => e.email === email); if (emp) { login('admin', emp.id); navigate('/admin'); } else setError(t(lang, 'employeeNotFound')); };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, hsl(220, 20%, 6%) 0%, hsl(220, 25%, 12%) 100%)' }}>
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-2 mb-6 justify-center"><Shield size={24} className="text-primary" /><span className="text-xl font-bold">BrokerCRM</span></div>
        <h2 className="text-xl font-semibold mb-1 text-center">{t(lang, 'adminLogin')}</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">{t(lang, 'crmPanel')}</p>
        <div className="space-y-4">
          <div><label className="text-xs text-muted-foreground font-medium">{t(lang, 'employeeEmail')}</label><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="ivanov@broker.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
          <div><label className="text-xs text-muted-foreground font-medium">{t(lang, 'password')}</label><div className="relative"><Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} /><button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={handleLogin}>{t(lang, 'loginToCRM')}</Button>
        </div>
        <div className="mt-6 p-3 bg-muted/50 rounded-lg"><p className="text-xs font-medium text-muted-foreground mb-2">{t(lang, 'demoAccess')}</p><div className="text-xs text-muted-foreground"><button className="text-primary hover:underline" onClick={() => setEmail('ivanov@broker.com')}>ivanov@broker.com</button></div></div>
        <div className="mt-4 text-center"><button onClick={() => navigate('/')} className="text-xs text-muted-foreground hover:text-primary">{t(lang, 'clientLoginLink')}</button></div>
      </div>
    </div>
  );
}
