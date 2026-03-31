import { create } from 'zustand';
import {
  AuthState, Client, Lead, Employee, Role, Desk, TradingAccount, TradingPosition,
  AssetSymbol, PaymentRequest, SupportTicket, SupportMessage, VerificationRequest,
  HistoryEvent, ClientNote, ManualPriceOverride, ClientSession, SecuritySettings,
  ClientStatusConfig, ActionStatusConfig, PaymentMethod, SavedView, ReminderInterval,
  OrderType, PaymentStatus, VerificationStatus, TicketStatus
} from '@/types';
import * as mock from '@/data/mockData';
import { useNotificationStore } from './useNotificationStore';

// Generate unique IDs
let idCounter = 1000;
const genId = () => `gen_${++idCounter}`;

interface AppStore {
  // Auth
  auth: AuthState;
  login: (type: 'admin' | 'client', id: string) => void;
  logout: () => void;
  impersonateClient: (clientId: string, employeeId: string) => void;
  stopImpersonation: () => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Client Notes
  clientNotes: ClientNote[];
  addClientNote: (clientId: string, text: string) => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToClient: (leadId: string) => void;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Roles
  roles: Role[];
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;

  // Desks
  desks: Desk[];
  addDesk: (desk: Omit<Desk, 'id' | 'createdAt'>) => void;

  // Trading Accounts
  tradingAccounts: TradingAccount[];
  addTradingAccount: (account: Omit<TradingAccount, 'id' | 'createdAt'>) => void;
  updateTradingAccount: (id: string, updates: Partial<TradingAccount>) => void;

  // Positions
  positions: TradingPosition[];
  openPosition: (position: Omit<TradingPosition, 'id' | 'status' | 'profit' | 'currentPrice'>) => { success: boolean; error?: string };
  closePosition: (id: string) => void;
  updatePosition: (id: string, updates: Partial<TradingPosition>) => void;
  deletePosition: (id: string) => void;

  // Assets
  assets: AssetSymbol[];
  updateAsset: (id: string, updates: Partial<AssetSymbol>) => void;

  // Manual Price Override
  manualOverrides: ManualPriceOverride[];
  setManualPrice: (symbolId: string, newBid: number, newAsk: number, employeeId: string) => void;
  checkOverrideExpiry: () => void;

  // Payments
  payments: PaymentRequest[];
  paymentMethods: PaymentMethod[];
  addPayment: (payment: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus, processedBy?: string) => void;

  // Support
  tickets: SupportTicket[];
  messages: SupportMessage[];
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'lastMessageAt' | 'status'>) => void;
  addMessage: (message: Omit<SupportMessage, 'id' | 'createdAt'>) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;

  // Verification
  verificationRequests: VerificationRequest[];
  updateVerificationStatus: (id: string, status: VerificationStatus, processedBy?: string) => void;

  // History
  history: HistoryEvent[];
  addHistoryEvent: (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => void;

  // Sessions
  sessions: ClientSession[];

  // Settings
  clientStatusConfigs: ClientStatusConfig[];
  actionStatusConfigs: ActionStatusConfig[];
  reminderIntervals: ReminderInterval[];
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  savedViews: SavedView[];
  addSavedView: (view: Omit<SavedView, 'id'>) => void;
  deleteSavedView: (id: string) => void;

  // Helpers
  getClientById: (id: string) => Client | undefined;
  getEmployeeById: (id: string) => Employee | undefined;
  getAccountsByClientId: (clientId: string) => TradingAccount[];
  getPositionsByAccountId: (accountId: string) => TradingPosition[];
  getAssetBySymbol: (symbol: string) => AssetSymbol | undefined;
  getEffectivePrice: (symbolId: string) => { bid: number; ask: number };
  hasPermission: (permission: string) => boolean;

  // Price simulation
  simulatePriceMovement: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // ==================== AUTH ====================
  auth: { isAuthenticated: false, userType: null, userId: null },

  login: (type, id) => {
    const role = type === 'admin' ? mock.roles.find(r => r.id === get().employees.find(e => e.id === id)?.roleId) : undefined;
    set({ auth: { isAuthenticated: true, userType: type, userId: id, employeeId: type === 'admin' ? id : undefined, clientId: type === 'client' ? id : undefined, role } });
  },

  logout: () => set({ auth: { isAuthenticated: false, userType: null, userId: null } }),

  impersonateClient: (clientId, employeeId) => {
    const store = get();
    store.addHistoryEvent({
      clientId,
      clientName: (() => { const c = store.clients.find(cl => cl.id === clientId); return c ? `${c.lastName} ${c.firstName}` : ''; })(),
      section: 'Auth',
      authorId: employeeId,
      authorName: (() => { const e = store.employees.find(emp => emp.id === employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })(),
      source: 'Employee',
      description: 'Вход в кабинет клиента',
      ip: '192.168.1.1',
    });
    set({ auth: { isAuthenticated: true, userType: 'client', userId: clientId, clientId, impersonating: true, impersonatedBy: employeeId } });
  },

  stopImpersonation: () => {
    const empId = get().auth.impersonatedBy;
    const role = empId ? mock.roles.find(r => r.id === get().employees.find(e => e.id === empId)?.roleId) : undefined;
    set({ auth: { isAuthenticated: true, userType: 'admin', userId: empId || 'e1', employeeId: empId || 'e1', role } });
  },

  // ==================== CLIENTS ====================
  clients: [...mock.clients],
  addClient: (data) => {
    const client: Client = { ...data, id: genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    set(s => ({ clients: [...s.clients, client] }));
    get().addHistoryEvent({ clientId: client.id, clientName: `${client.lastName} ${client.firstName}`, section: 'Clients', authorId: get().auth.userId || '', authorName: '', source: 'Employee', description: `Создание клиента: ${client.lastName} ${client.firstName}` });
    return client;
  },
  updateClient: (id, updates) => {
    set(s => ({ clients: s.clients.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c) }));
  },
  deleteClient: (id) => set(s => ({ clients: s.clients.filter(c => c.id !== id) })),

  // ==================== NOTES ====================
  clientNotes: [...mock.clientNotes],
  addClientNote: (clientId, text) => {
    const note: ClientNote = { id: genId(), clientId, authorId: get().auth.userId || '', text, createdAt: new Date().toISOString() };
    set(s => ({ clientNotes: [...s.clientNotes, note] }));
  },

  // ==================== LEADS ====================
  leads: [...mock.leads],
  addLead: (data) => {
    const lead = { ...data, id: genId(), createdAt: new Date().toISOString() };
    set(s => ({ leads: [...s.leads, lead as Lead] }));
  },
  updateLead: (id, updates) => set(s => ({ leads: s.leads.map(l => l.id === id ? { ...l, ...updates } : l) })),
  convertLeadToClient: (leadId) => {
    const lead = get().leads.find(l => l.id === leadId);
    if (!lead) return;
    const client = get().addClient({ lastName: lead.lastName, firstName: lead.firstName, email: lead.email, phone: lead.phone, country: lead.country, type: 'Lead', status: 'Lead', verificationStatus: 'Unverified', responsibleId: lead.responsibleId, source: lead.source });
    set(s => ({ leads: s.leads.map(l => l.id === leadId ? { ...l, convertedClientId: client.id } : l) }));
  },

  // ==================== EMPLOYEES ====================
  employees: [...mock.employees],
  addEmployee: (data) => {
    const emp = { ...data, id: genId(), createdAt: new Date().toISOString() } as Employee;
    set(s => ({ employees: [...s.employees, emp] }));
  },
  updateEmployee: (id, updates) => set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...updates } : e) })),

  // ==================== ROLES ====================
  roles: [...mock.roles],
  addRole: (data) => {
    const role = { ...data, id: genId() } as Role;
    set(s => ({ roles: [...s.roles, role] }));
  },
  updateRole: (id, updates) => set(s => ({ roles: s.roles.map(r => r.id === id ? { ...r, ...updates } : r) })),

  // ==================== DESKS ====================
  desks: [...mock.desks],
  addDesk: (data) => {
    const desk = { ...data, id: genId(), createdAt: new Date().toISOString() } as Desk;
    set(s => ({ desks: [...s.desks, desk] }));
  },

  // ==================== TRADING ACCOUNTS ====================
  tradingAccounts: [...mock.tradingAccounts],
  addTradingAccount: (data) => {
    const account = { ...data, id: genId(), createdAt: new Date().toISOString() } as TradingAccount;
    set(s => ({ tradingAccounts: [...s.tradingAccounts, account] }));
  },
  updateTradingAccount: (id, updates) => set(s => ({
    tradingAccounts: s.tradingAccounts.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  // ==================== POSITIONS ====================
  positions: [...mock.tradingPositions],

  openPosition: (data) => {
    const store = get();
    const account = store.tradingAccounts.find(a => a.id === data.accountId);
    if (!account) return { success: false, error: 'Account not found' };
    if (!account.tradingAllowed) return { success: false, error: 'Trading not allowed' };

    const asset = store.assets.find(a => a.symbol === data.symbol);
    if (!asset) return { success: false, error: 'Asset not found' };
    if (!asset.tradingAllowed) return { success: false, error: 'Trading forbidden for this asset' };

    const { bid, ask } = store.getEffectivePrice(asset.id);
    const price = data.type === 'Buy' ? ask : bid;

    // Calculate required margin
    const contractValue = data.volume * asset.contractSize * price;
    const requiredMargin = (contractValue * asset.marginPercent) / 100 / account.leverage;
    const commission = asset.commission * data.volume;

    if (requiredMargin + commission > account.freeMargin) {
      return { success: false, error: 'Insufficient free margin' };
    }

    // Check max orders
    const openOrders = store.positions.filter(p => p.accountId === data.accountId && p.status === 'Open').length;
    if (openOrders >= account.maxOrders) {
      return { success: false, error: 'Maximum orders reached' };
    }

    const position: TradingPosition = {
      ...data,
      id: genId(),
      openPrice: price,
      currentPrice: price,
      status: 'Open',
      profit: -commission - (data.type === 'Buy' ? (ask - bid) * data.volume * asset.contractSize : (bid - ask) * data.volume * asset.contractSize * -1),
      commission,
      margin: requiredMargin,
    };

    set(s => ({
      positions: [...s.positions, position],
      tradingAccounts: s.tradingAccounts.map(a => a.id === data.accountId ? {
        ...a,
        margin: a.margin + requiredMargin,
        freeMargin: a.freeMargin - requiredMargin - commission,
        tradesCount: a.tradesCount + 1,
      } : a),
    }));

    return { success: true };
  },

  closePosition: (id) => {
    const store = get();
    const pos = store.positions.find(p => p.id === id);
    if (!pos || pos.status !== 'Open') return;

    const asset = store.assets.find(a => a.symbol === pos.symbol);
    if (!asset) return;

    const { bid, ask } = store.getEffectivePrice(asset.id);
    const closePrice = pos.type === 'Buy' ? bid : ask;
    const priceDiff = pos.type === 'Buy' ? closePrice - pos.openPrice : pos.openPrice - closePrice;
    const profit = priceDiff * pos.volume * asset.contractSize - pos.commission + pos.swap;

    set(s => ({
      positions: s.positions.map(p => p.id === id ? {
        ...p, status: 'Closed' as const, closeDate: new Date().toISOString(), closePrice, currentPrice: closePrice, profit, closeType: 'Manual',
        balance: (s.tradingAccounts.find(a => a.id === p.accountId)?.balance || 0) + profit,
      } : p),
      tradingAccounts: s.tradingAccounts.map(a => a.id === pos.accountId ? {
        ...a, balance: a.balance + profit, equity: a.equity + profit - pos.profit, margin: a.margin - pos.margin, freeMargin: a.freeMargin + pos.margin + profit,
        profit: a.profit - pos.profit,
      } : a),
    }));
  },

  updatePosition: (id, updates) => set(s => ({ positions: s.positions.map(p => p.id === id ? { ...p, ...updates } : p) })),
  deletePosition: (id) => set(s => ({ positions: s.positions.filter(p => p.id !== id) })),

  // ==================== ASSETS ====================
  assets: [...mock.assetSymbols],
  updateAsset: (id, updates) => {
    set(s => ({ assets: s.assets.map(a => a.id === id ? { ...a, ...updates, lastUpdated: new Date().toISOString() } : a) }));
  },

  // ==================== MANUAL PRICE OVERRIDE ====================
  manualOverrides: [],
  setManualPrice: (symbolId, newBid, newAsk, employeeId) => {
    const asset = get().assets.find(a => a.id === symbolId);
    if (!asset) return;

    const override: ManualPriceOverride = {
      id: genId(),
      symbolId,
      oldBid: asset.bid,
      oldAsk: asset.ask,
      newBid,
      newAsk,
      employeeId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      isActive: true,
    };

    set(s => ({
      manualOverrides: [...s.manualOverrides.filter(o => o.symbolId !== symbolId), override],
      assets: s.assets.map(a => a.id === symbolId ? { ...a, bid: newBid, ask: newAsk, prevBid: asset.bid, prevAsk: asset.ask, lastUpdated: new Date().toISOString() } : a),
    }));

    get().addHistoryEvent({
      section: 'Assets',
      authorId: employeeId,
      authorName: (() => { const e = get().employees.find(emp => emp.id === employeeId); return e ? `${e.lastName} ${e.firstName}` : ''; })(),
      source: 'Employee',
      description: `Ручное изменение цены ${asset.symbol}: Bid ${asset.bid}→${newBid}, Ask ${asset.ask}→${newAsk}`,
    });
  },

  checkOverrideExpiry: () => {
    const now = new Date().getTime();
    const expired = get().manualOverrides.filter(o => o.isActive && new Date(o.expiresAt).getTime() <= now);

    if (expired.length === 0) return;

    set(s => ({
      manualOverrides: s.manualOverrides.map(o => expired.find(e => e.id === o.id) ? { ...o, isActive: false } : o),
      assets: s.assets.map(a => {
        const exp = expired.find(e => e.symbolId === a.id);
        if (!exp) return a;
        return { ...a, bid: exp.oldBid, ask: exp.oldAsk, lastUpdated: new Date().toISOString() };
      }),
    }));
  },

  // ==================== PAYMENTS ====================
  payments: [...mock.paymentRequests],
  paymentMethods: [...mock.paymentMethods],
  addPayment: (data) => {
    const payment: PaymentRequest = { ...data, id: genId(), status: 'New', createdAt: new Date().toISOString() };
    set(s => ({ payments: [...s.payments, payment] }));
    const client = get().clients.find(c => c.id === data.clientId);
    useNotificationStore.getState().addNotification({
      type: 'payment',
      title: `Новый ${data.type === 'Deposit' ? 'депозит' : data.type === 'Withdrawal' ? 'вывод' : 'перевод'}`,
      message: `${data.type} $${data.amount} от ${client ? `${client.lastName} ${client.firstName}` : 'клиента'}`,
      link: '/admin/payments',
    });
  },
  updatePaymentStatus: (id, status, processedBy) => {
    set(s => ({
      payments: s.payments.map(p => p.id === id ? { ...p, status, processedAt: new Date().toISOString(), processedBy } : p),
    }));

    // If approved deposit, update account balance
    const payment = get().payments.find(p => p.id === id);
    if (payment && status === 'Approved' && payment.type === 'Deposit') {
      set(s => ({
        tradingAccounts: s.tradingAccounts.map(a => a.id === payment.accountId ? {
          ...a, balance: a.balance + payment.amount, equity: a.equity + payment.amount,
          freeMargin: a.freeMargin + payment.amount, deposited: a.deposited + payment.amount,
        } : a),
      }));
    }
    if (payment && status === 'Approved' && payment.type === 'Withdrawal') {
      set(s => ({
        tradingAccounts: s.tradingAccounts.map(a => a.id === payment.accountId ? {
          ...a, balance: a.balance - payment.amount, equity: a.equity - payment.amount,
          freeMargin: a.freeMargin - payment.amount, withdrawn: a.withdrawn + payment.amount,
        } : a),
      }));
    }
  },

  // ==================== SUPPORT ====================
  tickets: [...mock.supportTickets],
  messages: [...mock.supportMessages],
  addTicket: (data) => {
    const ticket: SupportTicket = { ...data, id: genId(), status: 'Open', createdAt: new Date().toISOString(), lastMessageAt: new Date().toISOString() };
    set(s => ({ tickets: [...s.tickets, ticket] }));
    const client = get().clients.find(c => c.id === data.clientId);
    useNotificationStore.getState().addNotification({
      type: 'ticket',
      title: 'Новое обращение',
      message: `${client ? `${client.lastName} ${client.firstName}` : 'Клиент'}: ${data.subject}`,
      link: '/admin/support',
    });
    return ticket as any;
  },
  addMessage: (data) => {
    const msg: SupportMessage = { ...data, id: genId(), createdAt: new Date().toISOString() };
    set(s => ({
      messages: [...s.messages, msg],
      tickets: s.tickets.map(t => t.id === data.ticketId ? { ...t, lastMessageAt: new Date().toISOString() } : t),
    }));
  },
  updateTicketStatus: (id, status) => set(s => ({ tickets: s.tickets.map(t => t.id === id ? { ...t, status } : t) })),

  // ==================== VERIFICATION ====================
  verificationRequests: [...mock.verificationRequests],
  updateVerificationStatus: (id, status, processedBy) => {
    const req = get().verificationRequests.find(r => r.id === id);
    if (!req) return;
    set(s => ({
      verificationRequests: s.verificationRequests.map(r => r.id === id ? { ...r, status, processedAt: new Date().toISOString(), processedBy } : r),
      clients: s.clients.map(c => c.id === req.clientId ? { ...c, verificationStatus: status } : c),
    }));
  },

  // ==================== HISTORY ====================
  history: [...mock.historyEvents],
  addHistoryEvent: (event) => {
    const e: HistoryEvent = { ...event, id: genId(), timestamp: new Date().toISOString() };
    set(s => ({ history: [e, ...s.history] }));
  },

  // ==================== SESSIONS ====================
  sessions: [...mock.clientSessions],

  // ==================== SETTINGS ====================
  clientStatusConfigs: [...mock.clientStatusConfigs],
  actionStatusConfigs: [...mock.actionStatusConfigs],
  reminderIntervals: [...mock.reminderIntervals],
  securitySettings: { ...mock.defaultSecuritySettings },
  updateSecuritySettings: (settings) => set(s => ({ securitySettings: { ...s.securitySettings, ...settings } })),
  savedViews: [...mock.savedViews],
  addSavedView: (view) => set(s => ({ savedViews: [...s.savedViews, { ...view, id: genId() }] })),
  deleteSavedView: (id) => set(s => ({ savedViews: s.savedViews.filter(v => v.id !== id) })),

  // ==================== HELPERS ====================
  getClientById: (id) => get().clients.find(c => c.id === id),
  getEmployeeById: (id) => get().employees.find(e => e.id === id),
  getAccountsByClientId: (clientId) => get().tradingAccounts.filter(a => a.clientId === clientId),
  getPositionsByAccountId: (accountId) => get().positions.filter(p => p.accountId === accountId),
  getAssetBySymbol: (symbol) => get().assets.find(a => a.symbol === symbol),

  getEffectivePrice: (symbolId) => {
    const asset = get().assets.find(a => a.id === symbolId);
    if (!asset) return { bid: 0, ask: 0 };
    const override = get().manualOverrides.find(o => o.symbolId === symbolId && o.isActive);
    if (override) return { bid: override.newBid, ask: override.newAsk };
    return { bid: asset.bid, ask: asset.ask };
  },

  hasPermission: (permission) => {
    const { auth } = get();
    if (!auth.role) return false;
    return auth.role.permissions[permission] === true;
  },

  // ==================== PRICE SIMULATION ====================
  simulatePriceMovement: () => {
    set(s => ({
      assets: s.assets.map(asset => {
        const override = s.manualOverrides.find(o => o.symbolId === asset.id && o.isActive);
        if (override) return asset;

        const volatility = asset.calcType === 'Crypto' ? 0.002 : asset.calcType === 'CFD' ? 0.001 : 0.0003;
        const change = (Math.random() - 0.5) * 2 * volatility * asset.bid;
        const newBid = Number((asset.bid + change).toFixed(asset.precision));
        const spread = asset.spreadBid + asset.spreadAsk;
        const newAsk = Number((newBid + spread).toFixed(asset.precision));

        return { ...asset, prevBid: asset.bid, prevAsk: asset.ask, bid: newBid, ask: newAsk, lastUpdated: new Date().toISOString() };
      }),
      positions: s.positions.map(pos => {
        if (pos.status !== 'Open') return pos;
        const asset = s.assets.find(a => a.symbol === pos.symbol);
        if (!asset) return pos;
        const override = s.manualOverrides.find(o => o.symbolId === asset.id && o.isActive);
        const currentBid = override ? override.newBid : asset.bid;
        const currentAsk = override ? override.newAsk : asset.ask;
        const currentPrice = pos.type === 'Buy' ? currentBid : currentAsk;
        const priceDiff = pos.type === 'Buy' ? currentPrice - pos.openPrice : pos.openPrice - currentPrice;
        const profit = priceDiff * pos.volume * asset.contractSize - pos.commission + pos.swap;
        return { ...pos, currentPrice, profit };
      }),
    }));

    // Update account equity
    const store = get();
    const accountProfits = new Map<string, number>();
    store.positions.filter(p => p.status === 'Open').forEach(p => {
      accountProfits.set(p.accountId, (accountProfits.get(p.accountId) || 0) + p.profit);
    });

    set(s => ({
      tradingAccounts: s.tradingAccounts.map(a => {
        const totalProfit = accountProfits.get(a.id) || 0;
        return { ...a, profit: totalProfit, equity: a.balance + totalProfit, freeMargin: a.balance + totalProfit - a.margin };
      }),
    }));
  },
}));
