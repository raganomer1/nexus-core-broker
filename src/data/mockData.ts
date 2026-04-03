import { 
  Employee, Role, Desk, Client, Lead, TradingAccount, AssetSymbol, 
  PaymentRequest, PaymentMethod, SupportTicket, SupportMessage, 
  VerificationRequest, HistoryEvent, ClientNote, TradingPosition,
  ManualPriceOverride, ClientSession, SecuritySettings, ClientStatusConfig,
  ActionStatusConfig, ReminderInterval, SavedView
} from '@/types';

// ==================== ROLES ====================
export const roles: Role[] = [
  { id: 'r1', name: 'Administrator', employeeType: 'Admin', employeeCount: 2, permissions: {
    'main.view': true, 'employees.view': true, 'employees.create': true, 'employees.edit': true, 'employees.delete': true,
    'reports.view': true, 'settings.view': true, 'settings.edit': true, 'crm.view': true, 'crm.edit': true,
    'desks.view': true, 'desks.edit': true, 'sales.view': true, 'security.view': true, 'security.edit': true,
    'clients.view': true, 'clients.create': true, 'clients.edit': true, 'clients.delete': true, 'clients.viewContacts': true,
    'clients.loginCabinet': true, 'clients.export': true, 'clients.import': true,
    'verification.view': true, 'verification.approve': true, 'verification.reject': true, 'verification.ban': true,
    'actions.view': true, 'actions.edit': true, 'notes.view': true, 'notes.create': true,
    'history.view': true, 'accounts.view': true, 'accounts.create': true, 'accounts.edit': true,
    'trading.view': true, 'trading.edit': true, 'trading.close': true,
    'assets.view': true, 'assets.edit': true, 'assets.priceOverride': true,
    'assets.commission': true, 'assets.swap': true, 'assets.margin': true, 'assets.stopLevel': true,
    'assets.tradingToggle': true, 'payments.view': true, 'payments.approve': true, 'payments.reject': true,
    'support.view': true, 'support.respond': true,
  }},
  { id: 'r2', name: 'BU Manager', employeeType: 'Admin', employeeCount: 1, permissions: {
    'main.view': true, 'clients.view': true, 'clients.create': true, 'clients.edit': true, 'clients.viewContacts': true,
    'clients.loginCabinet': true, 'clients.export': true, 'crm.view': true, 'crm.edit': true,
    'desks.view': true, 'reports.view': true, 'trading.view': true, 'trading.edit': true,
    'assets.view': true, 'assets.edit': true, 'assets.priceOverride': true,
    'payments.view': true, 'payments.approve': true, 'accounts.view': true, 'accounts.edit': true,
    'verification.view': true, 'verification.approve': true, 'history.view': true,
    'support.view': true, 'support.respond': true, 'notes.view': true, 'notes.create': true,
  }},
  { id: 'r3', name: 'General Manager', employeeType: 'Admin', employeeCount: 1, permissions: {
    'main.view': true, 'clients.view': true, 'clients.edit': true, 'clients.viewContacts': true,
    'crm.view': true, 'desks.view': true, 'reports.view': true, 'trading.view': true,
    'assets.view': true, 'payments.view': true, 'accounts.view': true,
    'history.view': true, 'notes.view': true, 'notes.create': true,
  }},
  { id: 'r4', name: 'Retention Person', employeeType: 'Sales', employeeCount: 3, permissions: {
    'main.view': true, 'clients.view': true, 'clients.edit': true,
    'crm.view': true, 'notes.view': true, 'notes.create': true,
    'trading.view': true, 'accounts.view': true, 'history.view': true,
    'payments.view': true,
  }},
  { id: 'r5', name: 'Sales Person', employeeType: 'Sales', employeeCount: 4, permissions: {
    'main.view': true, 'clients.view': true, 'clients.create': true,
    'crm.view': true, 'notes.view': true, 'notes.create': true,
    'history.view': true,
  }},
];

// ==================== EMPLOYEES ====================
export const employees: Employee[] = [
  { id: 'e1', lastName: 'Иванов', firstName: 'Алексей', middleName: 'Петрович', type: 'Admin', position: 'CEO', department: 'Management', email: 'ivanov@broker.com', phone: '+7 999 123 4567', canViewContacts: true, canEdit: true, desks: ['d1', 'd2'], roleId: 'r1', lastLogin: '2026-03-31T10:30:00', isActive: true, createdAt: '2024-01-01' },
  { id: 'e2', lastName: 'Петрова', firstName: 'Мария', middleName: 'Сергеевна', type: 'Admin', position: 'Head of Operations', department: 'Operations', email: 'petrova@broker.com', phone: '+7 999 234 5678', canViewContacts: true, canEdit: true, desks: ['d1'], roleId: 'r2', lastLogin: '2026-03-31T09:15:00', isActive: true, createdAt: '2024-02-15' },
  { id: 'e3', lastName: 'Сидоров', firstName: 'Дмитрий', type: 'Admin', position: 'General Manager', department: 'Management', email: 'sidorov@broker.com', canViewContacts: true, canEdit: false, desks: ['d1', 'd2', 'd3'], roleId: 'r3', lastLogin: '2026-03-30T18:00:00', isActive: true, createdAt: '2024-03-01' },
  { id: 'e4', lastName: 'Козлова', firstName: 'Анна', type: 'Sales', position: 'Senior Retention', department: 'Sales', email: 'kozlova@broker.com', canViewContacts: true, canEdit: true, desks: ['d1'], roleId: 'r4', lastLogin: '2026-03-31T11:00:00', isActive: true, createdAt: '2024-04-01' },
  { id: 'e5', lastName: 'Морозов', firstName: 'Игорь', type: 'Sales', position: 'Sales Manager', department: 'Sales', email: 'morozov@broker.com', canViewContacts: false, canEdit: true, desks: ['d2'], roleId: 'r5', lastLogin: '2026-03-31T08:45:00', isActive: true, createdAt: '2024-05-01' },
  { id: 'e6', lastName: 'Волков', firstName: 'Сергей', type: 'Sales', position: 'Sales Manager', department: 'Sales', email: 'volkov@broker.com', canViewContacts: false, canEdit: true, desks: ['d3'], roleId: 'r5', isActive: true, createdAt: '2024-06-01' },
  { id: 'e7', lastName: 'Новиков', firstName: 'Павел', type: 'Sales', position: 'Retention Manager', department: 'Sales', email: 'novikov@broker.com', canViewContacts: true, canEdit: true, desks: ['d2'], roleId: 'r4', lastLogin: '2026-03-29T14:00:00', isActive: true, createdAt: '2024-07-01' },
  { id: 'e8', lastName: 'Тестов', firstName: 'Продажник', type: 'Sales', position: 'Sales Manager', department: 'Sales', email: 'test.sale@broker.com', phone: '+7 900 000 0001', canViewContacts: false, canEdit: true, desks: ['d1'], roleId: 'r5', lastLogin: '2026-04-03T09:00:00', isActive: true, createdAt: '2026-04-03' },
  { id: 'e9', lastName: 'Тестов', firstName: 'Ретеншн', type: 'Sales', position: 'Retention Manager', department: 'Sales', email: 'test.retention@broker.com', phone: '+7 900 000 0002', canViewContacts: true, canEdit: true, desks: ['d1'], roleId: 'r4', lastLogin: '2026-04-03T09:00:00', isActive: true, createdAt: '2026-04-03' },
];

// ==================== DESKS ====================
export const desks: Desk[] = [
  { id: 'd1', name: 'Default', description: 'Main trading desk', managerId: 'e1', employeeIds: ['e1', 'e2', 'e4'], createdAt: '2024-01-01' },
  { id: 'd2', name: 'VIP', description: 'VIP clients desk', managerId: 'e3', employeeIds: ['e3', 'e5', 'e7'], createdAt: '2024-02-01' },
  { id: 'd3', name: 'Crypto', description: 'Crypto trading desk', managerId: 'e6', employeeIds: ['e6'], createdAt: '2024-06-01' },
];

// ==================== CLIENTS ====================
export const clients: Client[] = [
  { id: '100', lastName: 'Смирнов', firstName: 'Андрей', middleName: 'Викторович', deskId: 'd1', responsibleId: 'e4', type: 'Live', status: 'Live', email: 'smirnov@mail.com', phone: '+7 916 111 2233', country: 'Russia', city: 'Москва', verificationStatus: 'Verified', createdAt: '2025-06-15', updatedAt: '2026-03-30', lastCabinetVisit: '2026-03-31T09:00:00', lastTerminalVisit: '2026-03-31T08:30:00', source: 'Google Ads', birthday: '1985-03-12' },
  { id: '101', lastName: 'Кузнецов', firstName: 'Максим', deskId: 'd1', responsibleId: 'e4', type: 'Live', status: 'Hot', email: 'kuznetsov@gmail.com', phone: '+7 926 333 4455', country: 'Russia', city: 'Санкт-Петербург', verificationStatus: 'Verified', createdAt: '2025-08-20', updatedAt: '2026-03-28', source: 'Referral' },
  { id: '102', lastName: 'Попов', firstName: 'Денис', deskId: 'd2', responsibleId: 'e5', type: 'Demo', status: 'Demo', email: 'popov@yahoo.com', phone: '+7 903 555 6677', country: 'Russia', city: 'Казань', verificationStatus: 'Unverified', createdAt: '2026-01-10', updatedAt: '2026-03-25' },
  { id: '103', lastName: 'Соколова', firstName: 'Елена', deskId: 'd2', responsibleId: 'e7', type: 'Live', status: 'Live', email: 'sokolova@mail.ru', phone: '+380 50 123 4567', country: 'Ukraine', city: 'Киев', verificationStatus: 'Verified', createdAt: '2025-11-05', updatedAt: '2026-03-31', source: 'Facebook', birthday: '1990-07-22' },
  { id: '104', lastName: 'Волков', firstName: 'Артем', deskId: 'd1', responsibleId: 'e4', type: 'Lead', status: 'Lead', email: 'volkov.a@outlook.com', phone: '+7 977 888 9900', country: 'Russia', city: 'Новосибирск', verificationStatus: 'Unverified', createdAt: '2026-03-01', updatedAt: '2026-03-29', source: 'Cold call' },
  { id: '105', lastName: 'Новикова', firstName: 'Ирина', deskId: 'd3', responsibleId: 'e6', type: 'Live', status: 'Hot', email: 'novikova@proton.me', phone: '+7 915 222 3344', country: 'Russia', city: 'Екатеринбург', verificationStatus: 'Pending', createdAt: '2025-12-20', updatedAt: '2026-03-30', source: 'Telegram' },
  { id: '106', lastName: 'Федоров', firstName: 'Олег', type: 'Lead', status: 'New', email: 'fedorov@test.com', phone: '+7 999 000 1122', country: 'Russia', verificationStatus: 'Unverified', createdAt: '2026-03-28', updatedAt: '2026-03-28' },
  { id: '107', lastName: 'Михайлова', firstName: 'Наталья', deskId: 'd1', responsibleId: 'e4', type: 'Live', status: 'Live', email: 'mikhaylova@gmail.com', phone: '+7 916 444 5566', country: 'Russia', city: 'Москва', verificationStatus: 'Verified', createdAt: '2025-09-10', updatedAt: '2026-03-31', birthday: '1988-11-15' },
  { id: '108', lastName: 'Brown', firstName: 'James', deskId: 'd2', responsibleId: 'e7', type: 'Live', status: 'Live', email: 'jbrown@email.com', phone: '+1 555 123 4567', country: 'USA', city: 'New York', verificationStatus: 'Verified', createdAt: '2025-07-01', updatedAt: '2026-03-30' },
  { id: '109', lastName: 'Müller', firstName: 'Hans', deskId: 'd2', responsibleId: 'e5', type: 'Demo', status: 'Demo', email: 'hmuller@web.de', phone: '+49 170 1234567', country: 'Germany', city: 'Berlin', verificationStatus: 'Unverified', createdAt: '2026-02-15', updatedAt: '2026-03-20' },
  { id: '110', lastName: 'Лебедев', firstName: 'Роман', type: 'Lead', status: 'Spam', email: 'spam@test.com', country: 'Russia', verificationStatus: 'Unverified', createdAt: '2026-03-25', updatedAt: '2026-03-25' },
  { id: '111', lastName: 'Козлов', firstName: 'Виталий', deskId: 'd1', responsibleId: 'e4', type: 'Live', status: 'Cold', email: 'kozlov.v@mail.ru', phone: '+7 926 777 8899', country: 'Russia', city: 'Ростов-на-Дону', verificationStatus: 'Verified', createdAt: '2025-04-20', updatedAt: '2026-02-15', source: 'SEO' },
];

// ==================== CLIENT NOTES ====================
export const clientNotes: ClientNote[] = [
  { id: 'cn1', clientId: '100', authorId: 'e4', text: 'Клиент заинтересован в торговле криптовалютой', createdAt: '2026-03-20T10:00:00' },
  { id: 'cn2', clientId: '100', authorId: 'e4', text: 'Запросил информацию о VIP-условиях', createdAt: '2026-03-25T14:30:00' },
  { id: 'cn3', clientId: '101', authorId: 'e4', text: 'Активно торгует, планирует увеличить депозит', createdAt: '2026-03-28T09:15:00' },
  { id: 'cn4', clientId: '103', authorId: 'e7', text: 'Верифицирована, начала торговлю на реальном счете', createdAt: '2026-03-15T11:00:00' },
];

// ==================== LEADS ====================
export const leads: Lead[] = [
  { id: 'l1', lastName: 'Тихонов', firstName: 'Алексей', email: 'tikhonov@mail.com', phone: '+7 999 111 0000', country: 'Russia', status: 'New', source: 'Landing page', createdAt: '2026-03-28' },
  { id: 'l2', lastName: 'Орлова', firstName: 'Мария', email: 'orlova@gmail.com', phone: '+7 916 222 3333', country: 'Russia', status: 'Hot', responsibleId: 'e5', source: 'Webinar', createdAt: '2026-03-25' },
  { id: 'l3', lastName: 'Smith', firstName: 'John', email: 'jsmith@outlook.com', country: 'UK', status: 'Lead', source: 'Partner', createdAt: '2026-03-20' },
  { id: 'l4', lastName: 'Белов', firstName: 'Николай', email: 'belov@yandex.ru', phone: '+7 903 444 5555', country: 'Russia', status: 'No answer', responsibleId: 'e6', source: 'Cold call', createdAt: '2026-03-15' },
];

// ==================== TRADING ACCOUNTS ====================
export const tradingAccounts: TradingAccount[] = [
  { id: 'ta1', accountNumber: '100001', clientId: '100', group: 'Standard', leverage: 100, stopOut: 50, maxOrders: 200, minDeposit: 100, balance: 15420.50, equity: 15890.30, margin: 2500, freeMargin: 13390.30, profit: 469.80, bonus: 500, currency: 'USD', isDemo: false, tradingAllowed: true, robotsAllowed: true, showBonus: true, spendBonus: false, status: 'Active', deposited: 20000, withdrawn: 5000, tradesCount: 156, bonusSpent: 0, createdAt: '2025-06-15' },
  { id: 'ta2', accountNumber: '100002', clientId: '100', group: 'ECN', leverage: 200, stopOut: 30, maxOrders: 500, minDeposit: 1000, balance: 52340.00, equity: 53120.75, margin: 12000, freeMargin: 41120.75, profit: 780.75, bonus: 0, currency: 'USD', isDemo: false, tradingAllowed: true, robotsAllowed: true, showBonus: false, spendBonus: false, status: 'Active', deposited: 50000, withdrawn: 0, tradesCount: 89, bonusSpent: 0, createdAt: '2025-09-01' },
  { id: 'ta3', accountNumber: '200001', clientId: '101', group: 'Standard', leverage: 100, stopOut: 50, maxOrders: 200, minDeposit: 100, balance: 8750.25, equity: 9100.00, margin: 1800, freeMargin: 7300.00, profit: 349.75, bonus: 250, currency: 'USD', isDemo: false, tradingAllowed: true, robotsAllowed: false, showBonus: true, spendBonus: true, status: 'Active', deposited: 10000, withdrawn: 1500, tradesCount: 67, bonusSpent: 100, createdAt: '2025-08-20' },
  { id: 'ta4', accountNumber: 'D300001', clientId: '102', group: 'Demo', leverage: 500, stopOut: 20, maxOrders: 1000, minDeposit: 0, balance: 100000.00, equity: 99500.00, margin: 5000, freeMargin: 94500.00, profit: -500.00, bonus: 0, currency: 'USD', isDemo: true, tradingAllowed: true, robotsAllowed: true, showBonus: false, spendBonus: false, status: 'Active', deposited: 100000, withdrawn: 0, tradesCount: 34, bonusSpent: 0, createdAt: '2026-01-10' },
  { id: 'ta5', accountNumber: '400001', clientId: '103', group: 'VIP', leverage: 300, stopOut: 30, maxOrders: 500, minDeposit: 5000, balance: 125000.00, equity: 128500.00, margin: 35000, freeMargin: 93500.00, profit: 3500.00, bonus: 1000, currency: 'USD', isDemo: false, tradingAllowed: true, robotsAllowed: true, showBonus: true, spendBonus: true, status: 'Active', deposited: 130000, withdrawn: 10000, tradesCount: 234, bonusSpent: 500, createdAt: '2025-11-05' },
  { id: 'ta6', accountNumber: '500001', clientId: '107', group: 'Standard', leverage: 100, stopOut: 50, maxOrders: 200, minDeposit: 100, balance: 3200.00, equity: 3150.00, margin: 800, freeMargin: 2350.00, profit: -50.00, bonus: 0, currency: 'USD', isDemo: false, tradingAllowed: true, robotsAllowed: false, showBonus: false, spendBonus: false, status: 'Active', deposited: 5000, withdrawn: 2000, tradesCount: 45, bonusSpent: 0, createdAt: '2025-09-10' },
  { id: 'ta7', accountNumber: '600001', clientId: '108', group: 'ECN', leverage: 200, stopOut: 30, maxOrders: 500, minDeposit: 1000, balance: 78900.00, equity: 81200.00, margin: 22000, freeMargin: 59200.00, profit: 2300.00, bonus: 0, currency: 'USD', isDemo: false, tradingAllowed: true, robotsAllowed: true, showBonus: false, spendBonus: false, status: 'Active', deposited: 80000, withdrawn: 5000, tradesCount: 178, bonusSpent: 0, createdAt: '2025-07-01' },
];

// ==================== ASSETS ====================
// 250+ instruments imported from generated file
import { generatedAssets } from './generatedAssets';
export const assetSymbols: AssetSymbol[] = generatedAssets;

// ==================== TRADING POSITIONS ====================
export const tradingPositions: TradingPosition[] = [
  { id: 'tp1', accountId: 'ta1', symbol: 'EURUSD', type: 'Buy', volume: 1.0, openPrice: 1.08200, currentPrice: 1.08542, openDate: '2026-03-28T10:30:00', swap: -3.50, commission: 0, profit: 342.00, margin: 1082.00, status: 'Open' },
  { id: 'tp2', accountId: 'ta1', symbol: 'XAUUSD', type: 'Buy', volume: 0.5, openPrice: 3010.00, currentPrice: 3024.50, openDate: '2026-03-29T14:00:00', swap: -8.50, commission: 5, profit: 717.50, margin: 3010.00, status: 'Open', takeProfit: 3100.00, stopLoss: 2950.00 },
  { id: 'tp3', accountId: 'ta2', symbol: 'BTCUSD', type: 'Sell', volume: 0.1, openPrice: 88000.00, currentPrice: 87250.00, openDate: '2026-03-30T09:00:00', swap: -15.00, commission: 10, profit: 75.00, margin: 880.00, status: 'Open' },
  { id: 'tp4', accountId: 'ta3', symbol: 'GBPUSD', type: 'Buy', volume: 0.5, openPrice: 1.26000, currentPrice: 1.26340, openDate: '2026-03-27T16:00:00', swap: -4.20, commission: 0, profit: 170.00, margin: 630.00, status: 'Open' },
  { id: 'tp5', accountId: 'ta5', symbol: 'EURUSD', type: 'Sell', volume: 5.0, openPrice: 1.09000, currentPrice: 1.08542, openDate: '2026-03-25T08:00:00', swap: 6.00, commission: 0, profit: 2290.00, margin: 5450.00, status: 'Open', takeProfit: 1.07500, stopLoss: 1.10000 },
  { id: 'tp6', accountId: 'ta5', symbol: 'AAPL', type: 'Buy', volume: 50, openPrice: 175.00, currentPrice: 178.45, openDate: '2026-03-20T15:30:00', swap: -125.00, commission: 100, profit: 1725.00, margin: 437.50, status: 'Open' },
  { id: 'tp7', accountId: 'ta7', symbol: 'US500', type: 'Buy', volume: 2.0, openPrice: 5750.00, currentPrice: 5780.50, openDate: '2026-03-29T10:00:00', swap: -10.00, commission: 6, profit: 610.00, margin: 2300.00, status: 'Open' },
  // Closed positions
  { id: 'tp8', accountId: 'ta1', symbol: 'USDJPY', type: 'Buy', volume: 1.0, openPrice: 150.500, currentPrice: 151.200, openDate: '2026-03-15T09:00:00', closeDate: '2026-03-20T16:00:00', closePrice: 151.200, swap: -26.50, commission: 0, profit: 463.00, margin: 0, status: 'Closed', closeType: 'Manual', balance: 15420.50 },
  { id: 'tp9', accountId: 'ta3', symbol: 'ETHUSD', type: 'Sell', volume: 1.0, openPrice: 3500.00, currentPrice: 3420.00, openDate: '2026-03-10T11:00:00', closeDate: '2026-03-18T14:00:00', closePrice: 3380.00, swap: -60.00, commission: 5, profit: 120.00, margin: 0, status: 'Closed', closeType: 'TP', balance: 8750.25 },
];

// ==================== PAYMENTS ====================
export const paymentMethods: PaymentMethod[] = [
  { id: 'pm1', name: 'Bank Transfer', type: 'Bank', isActive: true, minAmount: 100, maxAmount: 1000000, commission: 0 },
  { id: 'pm2', name: 'VISA/Mastercard', type: 'Card', isActive: true, minAmount: 50, maxAmount: 50000, commission: 2.5 },
  { id: 'pm3', name: 'Bitcoin (BTC)', type: 'Crypto', isActive: true, minAmount: 10, maxAmount: 500000, commission: 0 },
  { id: 'pm4', name: 'Ethereum (ETH)', type: 'Crypto', isActive: true, minAmount: 10, maxAmount: 500000, commission: 0 },
  { id: 'pm5', name: 'USDT (TRC-20)', type: 'Crypto', isActive: true, minAmount: 10, maxAmount: 500000, commission: 1 },
  { id: 'pm6', name: 'Skrill', type: 'EWallet', isActive: true, minAmount: 20, maxAmount: 100000, commission: 1.5 },
  { id: 'pm7', name: 'Neteller', type: 'EWallet', isActive: true, minAmount: 20, maxAmount: 100000, commission: 1.5 },
];

export const paymentRequests: PaymentRequest[] = [
  { id: 'p1', clientId: '100', accountId: 'ta1', type: 'Deposit', amount: 5000, currency: 'USD', paymentMethod: 'Bank Transfer', status: 'Approved', createdAt: '2026-03-20T10:00:00', processedAt: '2026-03-20T14:00:00', processedBy: 'e2' },
  { id: 'p2', clientId: '101', accountId: 'ta3', type: 'Deposit', amount: 2000, currency: 'USD', paymentMethod: 'VISA/Mastercard', status: 'Approved', createdAt: '2026-03-22T09:00:00', processedAt: '2026-03-22T09:05:00', processedBy: 'e2' },
  { id: 'p3', clientId: '100', accountId: 'ta1', type: 'Withdrawal', amount: 1500, currency: 'USD', paymentMethod: 'Bank Transfer', status: 'New', wallet: 'RU12345678901234567890', createdAt: '2026-03-30T15:00:00' },
  { id: 'p4', clientId: '103', accountId: 'ta5', type: 'Deposit', amount: 25000, currency: 'USD', paymentMethod: 'Bitcoin (BTC)', status: 'Pending', createdAt: '2026-03-31T08:00:00' },
  { id: 'p5', clientId: '108', accountId: 'ta7', type: 'Withdrawal', amount: 5000, currency: 'USD', paymentMethod: 'USDT (TRC-20)', status: 'New', wallet: 'TRx1234567890abcdef', createdAt: '2026-03-31T10:00:00' },
  { id: 'p6', clientId: '107', accountId: 'ta6', type: 'Deposit', amount: 1000, currency: 'USD', paymentMethod: 'Skrill', status: 'Rejected', createdAt: '2026-03-29T12:00:00', processedAt: '2026-03-29T16:00:00', processedBy: 'e2', comment: 'Insufficient documentation' },
  { id: 'p7', clientId: '105', accountId: 'ta5', type: 'Deposit', amount: 10000, currency: 'USD', paymentMethod: 'Ethereum (ETH)', status: 'Approved', createdAt: '2026-03-25T11:00:00', processedAt: '2026-03-25T11:30:00', processedBy: 'e1' },
];

// ==================== SUPPORT TICKETS ====================
export const supportTickets: SupportTicket[] = [
  { id: 'st1', clientId: '100', subject: 'Проблема с выводом средств', status: 'Open', assignedTo: 'e4', createdAt: '2026-03-29T10:00:00', lastMessageAt: '2026-03-31T09:00:00', deskId: 'd1' },
  { id: 'st2', clientId: '102', subject: 'Как открыть реальный счет?', status: 'Open', assignedTo: 'e5', createdAt: '2026-03-30T14:00:00', lastMessageAt: '2026-03-30T16:30:00', deskId: 'd2' },
  { id: 'st3', clientId: '103', subject: 'Ошибка при входе в терминал', status: 'Closed', assignedTo: 'e7', createdAt: '2026-03-25T08:00:00', lastMessageAt: '2026-03-26T10:00:00', deskId: 'd2' },
  { id: 'st4', clientId: '107', subject: 'Запрос на изменение плеча', status: 'Open', assignedTo: 'e4', createdAt: '2026-03-31T07:00:00', lastMessageAt: '2026-03-31T07:30:00', deskId: 'd1' },
];

export const supportMessages: SupportMessage[] = [
  { id: 'sm1', ticketId: 'st1', authorId: '100', authorType: 'Client', text: 'Здравствуйте, я подал заявку на вывод 3 дня назад, но средства до сих пор не поступили.', createdAt: '2026-03-29T10:00:00' },
  { id: 'sm2', ticketId: 'st1', authorId: 'e4', authorType: 'Employee', text: 'Добрый день! Ваша заявка на вывод находится в обработке. Обычно это занимает 3-5 рабочих дней.', createdAt: '2026-03-29T10:30:00' },
  { id: 'sm3', ticketId: 'st1', authorId: '100', authorType: 'Client', text: 'Спасибо, буду ждать.', createdAt: '2026-03-31T09:00:00' },
  { id: 'sm4', ticketId: 'st2', authorId: '102', authorType: 'Client', text: 'Хочу перейти с демо на реальный счет. Какие документы нужны?', createdAt: '2026-03-30T14:00:00' },
  { id: 'sm5', ticketId: 'st2', authorId: 'e5', authorType: 'Employee', text: 'Для открытия реального счета необходимо пройти верификацию. Загрузите паспорт и подтверждение адреса в разделе "Верификация".', createdAt: '2026-03-30T16:30:00' },
];

// ==================== VERIFICATION ====================
export const verificationRequests: VerificationRequest[] = [
  { id: 'vr1', clientId: '105', status: 'Pending', documents: [
    { id: 'vd1', requestId: 'vr1', fileName: 'passport_front.jpg', fileType: 'image/jpeg', uploadedBy: '105', uploadedAt: '2026-03-28T10:00:00' },
    { id: 'vd2', requestId: 'vr1', fileName: 'utility_bill.pdf', fileType: 'application/pdf', uploadedBy: '105', uploadedAt: '2026-03-28T10:05:00' },
  ], createdAt: '2026-03-28T10:00:00' },
  { id: 'vr2', clientId: '102', status: 'Unverified', documents: [], createdAt: '2026-01-10' },
  { id: 'vr3', clientId: '100', status: 'Verified', documents: [
    { id: 'vd3', requestId: 'vr3', fileName: 'id_card.jpg', fileType: 'image/jpeg', uploadedBy: '100', uploadedAt: '2025-06-20T09:00:00' },
  ], createdAt: '2025-06-20', processedAt: '2025-06-21', processedBy: 'e2' },
];

// ==================== HISTORY ====================
export const historyEvents: HistoryEvent[] = [
  { id: 'h1', timestamp: '2026-03-31T10:30:00', clientId: '100', clientName: 'Смирнов Андрей', deskId: 'd1', deskName: 'Default', section: 'Clients', authorId: 'e4', authorName: 'Козлова Анна', source: 'Employee', description: 'Просмотр карточки клиента' },
  { id: 'h2', timestamp: '2026-03-31T10:15:00', clientId: '101', clientName: 'Кузнецов Максим', deskId: 'd1', deskName: 'Default', section: 'Trading', authorId: 'e1', authorName: 'Иванов Алексей', source: 'Employee', description: 'Изменение позиции #tp4: volume 0.3 → 0.5' },
  { id: 'h3', timestamp: '2026-03-31T09:00:00', clientId: '100', clientName: 'Смирнов Андрей', section: 'Payments', authorId: '100', authorName: 'Смирнов Андрей', source: 'Client', description: 'Создание заявки на вывод $1500' },
  { id: 'h4', timestamp: '2026-03-30T18:00:00', section: 'Assets', authorId: 'e1', authorName: 'Иванов Алексей', source: 'Employee', description: 'Ручное изменение цены BTCUSD: Bid 87000→87250, Ask 87100→87350' },
  { id: 'h5', timestamp: '2026-03-30T16:00:00', clientId: '103', clientName: 'Соколова Елена', deskId: 'd2', deskName: 'VIP', section: 'Auth', authorId: 'e7', authorName: 'Новиков Павел', source: 'Employee', description: 'Вход в кабинет клиента', ip: '192.168.1.100' },
  { id: 'h6', timestamp: '2026-03-30T14:00:00', clientId: '105', clientName: 'Новикова Ирина', deskId: 'd3', deskName: 'Crypto', section: 'Verification', authorId: '105', authorName: 'Новикова Ирина', source: 'Client', description: 'Загрузка документов для верификации' },
  { id: 'h7', timestamp: '2026-03-30T10:00:00', section: 'Assets', authorId: 'e1', authorName: 'Иванов Алексей', source: 'Employee', description: 'Изменение комиссии XAUUSD: 3 → 5 USD' },
  { id: 'h8', timestamp: '2026-03-29T16:00:00', clientId: '107', clientName: 'Михайлова Наталья', section: 'Payments', authorId: 'e2', authorName: 'Петрова Мария', source: 'Employee', description: 'Отклонение платежа #p6: Insufficient documentation' },
  { id: 'h9', timestamp: '2026-03-29T12:00:00', section: 'Employees', authorId: 'e1', authorName: 'Иванов Алексей', source: 'Employee', description: 'Создание сотрудника: Новиков Павел' },
  { id: 'h10', timestamp: '2026-03-28T10:00:00', clientId: '104', clientName: 'Волков Артем', section: 'Clients', authorId: 'e4', authorName: 'Козлова Анна', source: 'Employee', description: 'Изменение статуса клиента: New → Lead' },
];

// ==================== SESSIONS ====================
export const clientSessions: ClientSession[] = [
  { id: 'cs1', clientId: '100', accountId: 'ta1', group: 'Standard', accountNumber: '100001', fullName: 'Смирнов Андрей', email: 'smirnov@mail.com', registrationIp: '95.24.100.50', currentIp: '95.24.100.55', isOnline: true, lastLogin: '2026-03-31T09:00:00', isDemo: false },
  { id: 'cs2', clientId: '103', accountId: 'ta5', group: 'VIP', accountNumber: '400001', fullName: 'Соколова Елена', email: 'sokolova@mail.ru', registrationIp: '178.150.20.10', currentIp: '178.150.20.15', isOnline: true, lastLogin: '2026-03-31T08:30:00', isDemo: false },
  { id: 'cs3', clientId: '108', accountId: 'ta7', group: 'ECN', accountNumber: '600001', fullName: 'James Brown', email: 'jbrown@email.com', registrationIp: '72.14.200.100', currentIp: '72.14.200.105', isOnline: true, lastLogin: '2026-03-31T10:00:00', isDemo: false },
  { id: 'cs4', clientId: '102', accountId: 'ta4', group: 'Demo', accountNumber: 'D300001', fullName: 'Попов Денис', email: 'popov@yahoo.com', registrationIp: '188.32.50.20', currentIp: '188.32.50.25', isOnline: false, lastLogin: '2026-03-30T18:00:00', lastDisconnect: '2026-03-30T20:30:00', isDemo: true },
  { id: 'cs5', clientId: '101', accountId: 'ta3', group: 'Standard', accountNumber: '200001', fullName: 'Кузнецов Максим', email: 'kuznetsov@gmail.com', registrationIp: '78.46.120.30', currentIp: '78.46.120.35', isOnline: false, lastLogin: '2026-03-31T07:00:00', lastDisconnect: '2026-03-31T08:00:00', isDemo: false },
];

// ==================== SETTINGS ====================
export const clientStatusConfigs: ClientStatusConfig[] = [
  { id: 'cs1', name: 'New', color: '#3B82F6', isDefault: true },
  { id: 'cs2', name: 'Hot', color: '#EF4444', isDefault: false },
  { id: 'cs3', name: 'Cold', color: '#6B7280', isDefault: false },
  { id: 'cs4', name: 'Not interesting', color: '#9CA3AF', isDefault: false },
  { id: 'cs5', name: 'Spam', color: '#4B5563', isDefault: false },
  { id: 'cs6', name: 'No answer', color: '#F59E0B', isDefault: false },
  { id: 'cs7', name: 'Lead', color: '#F97316', isDefault: false },
  { id: 'cs8', name: 'Live', color: '#22C55E', isDefault: false },
  { id: 'cs9', name: 'Demo', color: '#A855F7', isDefault: false },
];

export const actionStatusConfigs: ActionStatusConfig[] = [
  { id: 'as1', name: 'New', isCompleted: false },
  { id: 'as2', name: 'In process', isCompleted: false },
  { id: 'as3', name: 'Complete', isCompleted: true },
  { id: 'as4', name: 'Processed, is not completed', isCompleted: true },
];

export const reminderIntervals: ReminderInterval[] = [
  { id: 'ri1', label: '5 минут', minutes: 5, isDefault: false },
  { id: 'ri2', label: '15 минут', minutes: 15, isDefault: true },
  { id: 'ri3', label: '20 минут', minutes: 20, isDefault: false },
  { id: 'ri4', label: '1 час', minutes: 60, isDefault: false },
];

export const defaultSecuritySettings: SecuritySettings = {
  contactProtection: true,
  protectedFields: ['phone', 'email'],
  editProtection: false,
  protectedEditFields: [],
  ipWhitelist: [],
  showFullPhoneNumbers: false,
};

export const manualPriceOverrides: ManualPriceOverride[] = [];

export const savedViews: SavedView[] = [
  { id: 'sv1', name: 'Все клиенты', fields: ['lastName', 'firstName', 'email', 'phone', 'country', 'createdAt', 'type', 'status', 'responsibleId'], filters: [], section: 'clients' },
  { id: 'sv2', name: 'Горячие лиды', fields: ['lastName', 'firstName', 'email', 'phone', 'status', 'responsibleId'], filters: [{ id: 'f1', field: 'status', operator: 'equals', value: 'Hot' }], section: 'clients' },
];
