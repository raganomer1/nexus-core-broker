import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import {
  Plus, X, ArrowUp, ArrowDown, Home, Menu
} from 'lucide-react';

export default function TerminalLayout() {
  const navigate = useNavigate();
  const { assets, auth, clients, tradingAccounts, positions, checkOverrideExpiry, stopImpersonation } = useStore();
  const client = clients.find(c => c.id === auth.clientId);
  const clientAccounts = tradingAccounts.filter(a => a.clientId === auth.clientId);
  const [selectedAccountId, setSelectedAccountId] = useState(clientAccounts[0]?.id || '');
  const [watchlist, setWatchlist] = useState(['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'AAPL', 'US500']);
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);

  const selectedAccount = tradingAccounts.find(a => a.id === selectedAccountId);
  const openPositions = positions.filter(p => p.accountId === selectedAccountId && p.status === 'Open');

  // Override expiry check (price updates handled by TradingContext)
  useEffect(() => {
    const interval = setInterval(() => {
      checkOverrideExpiry();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const watchlistAssets = watchlist.map(s => assets.find(a => a.symbol === s)).filter(Boolean);

  return (
    <div className="flex flex-col h-screen" style={{ background: 'hsl(220, 25%, 8%)' }}>
      {/* Impersonation banner */}
      {auth.impersonating && (
        <div className="bg-warning/90 text-warning-foreground px-4 py-1.5 text-sm flex items-center justify-between">
          <span className="truncate">Терминал клиента: {client?.lastName} {client?.firstName}</span>
          <button onClick={() => { stopImpersonation(); navigate('/admin/clients'); }} className="underline font-medium whitespace-nowrap ml-2">Вернуться в CRM</button>
        </div>
      )}

      {/* Top bar */}
      <div className="h-10 flex items-center justify-between px-3 md:px-4 border-b" style={{ borderColor: 'hsl(220, 20%, 20%)', background: 'hsl(220, 25%, 10%)' }}>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="md:hidden p-1" style={{ color: 'hsl(220, 14%, 60%)' }} onClick={() => setShowWatchlist(!showWatchlist)}>
            <Menu size={16} />
          </button>
          <span className="font-bold text-sm" style={{ color: 'hsl(217, 91%, 55%)' }}>Terminal</span>
          <NavLink to="/client" className="hidden sm:flex text-xs hover:underline" style={{ color: 'hsl(220, 14%, 60%)' }}>
            <Home size={14} className="inline mr-1" />Кабинет
          </NavLink>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-xs" style={{ color: 'hsl(220, 14%, 60%)' }}>
          <span className="hidden sm:inline">{client?.firstName} {client?.lastName}</span>
          <select
            value={selectedAccountId}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="bg-transparent border rounded px-1.5 md:px-2 py-1 text-xs max-w-[140px] md:max-w-none"
            style={{ borderColor: 'hsl(220, 20%, 25%)', color: 'hsl(220, 14%, 80%)' }}
          >
            {clientAccounts.map(a => (
              <option key={a.id} value={a.id} style={{ background: 'hsl(220, 25%, 12%)' }}>
                {a.accountNumber} ({a.isDemo ? 'Demo' : 'Real'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile watchlist overlay */}
        {showWatchlist && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setShowWatchlist(false)} />
        )}

        {/* Watchlist */}
        <div className={`
          w-56 border-r flex flex-col flex-shrink-0 overflow-hidden z-40
          fixed md:static inset-y-0 left-0 top-10 transition-transform duration-200
          ${showWatchlist ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `} style={{ borderColor: 'hsl(220, 20%, 20%)', background: 'hsl(220, 25%, 10%)' }}>
          {/* Mobile nav inside watchlist */}
          <div className="md:hidden flex items-center gap-1 px-2 py-2 border-b" style={{ borderColor: 'hsl(220, 20%, 20%)' }}>
            <NavLink to="/client" onClick={() => setShowWatchlist(false)} className="p-1.5 rounded opacity-50 hover:opacity-80" style={{ color: 'hsl(220, 14%, 60%)' }}>
              <Home size={16} />
            </NavLink>
          </div>

          <div className="px-3 py-2 flex items-center justify-between border-b" style={{ borderColor: 'hsl(220, 20%, 20%)' }}>
            <span className="text-xs font-medium" style={{ color: 'hsl(220, 14%, 70%)' }}>Инструменты</span>
            <button onClick={() => setShowAddSymbol(true)} className="p-1 rounded hover:bg-white/10" style={{ color: 'hsl(220, 14%, 60%)' }}>
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {watchlistAssets.map(asset => {
              if (!asset) return null;
              const isUp = asset.prevBid !== undefined ? asset.bid > asset.prevBid : true;
              const isSelected = asset.symbol === selectedSymbol;
              return (
                <div key={asset.symbol}
                  onClick={() => { setSelectedSymbol(asset.symbol); setShowWatchlist(false); }}
                  className={`group px-3 py-2 cursor-pointer border-b transition-colors ${isSelected ? '' : 'hover:bg-white/5'}`}
                  style={{
                    borderColor: 'hsl(220, 20%, 15%)',
                    background: isSelected ? 'hsl(217, 91%, 55%, 0.1)' : 'transparent',
                  }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'hsl(220, 14%, 90%)' }}>{asset.symbol}</span>
                    <button onClick={(e) => { e.stopPropagation(); setWatchlist(w => w.filter(s => s !== asset.symbol)); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5" style={{ color: 'hsl(220, 14%, 40%)' }}>
                      <X size={10} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: isUp ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>
                      {asset.bid.toFixed(asset.precision)}
                    </span>
                    <span className="text-xs" style={{ color: 'hsl(220, 14%, 50%)' }}>
                      {asset.ask.toFixed(asset.precision)}
                    </span>
                    {isUp ? <ArrowUp size={10} style={{ color: 'hsl(142, 71%, 45%)' }} /> : <ArrowDown size={10} style={{ color: 'hsl(0, 84%, 60%)' }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet context={{ selectedSymbol, setSelectedSymbol, selectedAccountId, setSelectedAccountId, watchlist, setWatchlist, showAddSymbol, setShowAddSymbol }} />
        </div>
      </div>

      {/* Bottom portfolio bar */}
      {selectedAccount && (
        <div className="h-auto md:h-10 flex flex-col md:flex-row items-start md:items-center justify-between px-3 md:px-4 py-2 md:py-0 border-t text-xs gap-1 md:gap-0" style={{ borderColor: 'hsl(220, 20%, 20%)', background: 'hsl(220, 25%, 10%)', color: 'hsl(220, 14%, 70%)' }}>
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            <span>Баланс: <b style={{ color: 'hsl(220, 14%, 90%)' }}>${selectedAccount.balance.toFixed(2)}</b></span>
            <span>Средства: <b style={{ color: 'hsl(220, 14%, 90%)' }}>${selectedAccount.equity.toFixed(2)}</b></span>
            <span>Прибыль: <b style={{ color: selectedAccount.profit >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)' }}>{selectedAccount.profit >= 0 ? '+' : ''}${selectedAccount.profit.toFixed(2)}</b></span>
            <span className="hidden sm:inline">Свободно: <b style={{ color: 'hsl(220, 14%, 90%)' }}>${selectedAccount.freeMargin.toFixed(2)}</b></span>
            <span className="hidden sm:inline">Маржа: <b>${selectedAccount.margin.toFixed(2)}</b></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Открыто: {openPositions.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
