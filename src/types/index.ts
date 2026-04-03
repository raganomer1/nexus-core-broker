// ===================== ENUMS =====================
export type ClientStatus = 'New' | 'Hot' | 'Warm' | 'Cold' | 'No potential' | 'Not interesting' | 'Spam' | 'No answer' | 'Call Back' | 'Lead' | 'Live' | 'Demo';
export type ClientType = 'Lead' | 'Live' | 'Demo';
export type ActionStatus = 'New' | 'In process' | 'Complete' | 'Processed, is not completed';
export type PaymentStatus = 'New' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type PaymentType = 'Deposit' | 'Withdrawal' | 'Transfer';
export type VerificationStatus = 'Pending' | 'Unverified' | 'Rejected' | 'Verified' | 'Banned';
export type TicketStatus = 'Open' | 'Closed';
export type OrderType = 'Buy' | 'Sell';
export type OrderStatus = 'Open' | 'Closed' | 'Pending' | 'Cancelled';
export type EmployeeType = 'Admin' | 'Sales' | 'Archived';
export type AssetCategory = 'Currencies' | 'Commodities' | 'Crypto' | 'Indices' | 'US Stocks' | 'EU Stocks' | 'RU Stocks' | 'Asian Stocks';
export type CalcType = 'Forex' | 'CFD' | 'Crypto';
export type SpreadType = 'Fixed' | 'Variable';
export type HistorySource = 'Employee' | 'Client' | 'System';
export type HistorySection = 'Clients' | 'Accounts' | 'Payments' | 'Trading' | 'Verification' | 'Support' | 'Assets' | 'Settings' | 'Employees' | 'Auth';

// ===================== CORE ENTITIES =====================
export interface Employee {
  id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthday?: string;
  type: EmployeeType;
  position: string;
  department: string;
  country?: string;
  region?: string;
  city?: string;
  zip?: string;
  address?: string;
  email: string;
  phone?: string;
  additionalContact?: string;
  avatar?: string;
  password?: string;
  ipRestriction?: string;
  canViewContacts: boolean;
  canEdit: boolean;
  desks: string[];
  signature?: string;
  roleId: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  employeeType: EmployeeType;
  permissions: Record<string, boolean>;
  employeeCount?: number;
}

export interface Desk {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  employeeIds: string[];
  createdAt: string;
}

export interface Client {
  id: string;
  salutation?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  deskId?: string;
  responsibleId?: string;
  type: ClientType;
  status: ClientStatus;
  affiliateId?: string;
  country?: string;
  region?: string;
  city?: string;
  zip?: string;
  address?: string;
  email: string;
  phone?: string;
  additionalContact?: string;
  lastCabinetVisit?: string;
  lastTerminalVisit?: string;
  origin?: string;
  verificationStatus: VerificationStatus;
  citizenship?: string;
  campaignId?: string;
  tag1?: string;
  tag2?: string;
  passport?: string;
  birthday?: string;
  purpose?: string;
  source?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  password?: string;
}

export interface ClientNote {
  id: string;
  clientId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone?: string;
  country?: string;
  status: ClientStatus;
  responsibleId?: string;
  source?: string;
  notes?: string;
  createdAt: string;
  convertedClientId?: string;
}

// ===================== TRADING =====================
export interface TradingAccount {
  id: string;
  accountNumber: string;
  clientId: string;
  group: string;
  leverage: number;
  stopOut: number;
  maxOrders: number;
  minDeposit: number;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  profit: number;
  bonus: number;
  currency: string;
  isDemo: boolean;
  tradingAllowed: boolean;
  robotsAllowed: boolean;
  showBonus: boolean;
  spendBonus: boolean;
  status: 'Active' | 'Inactive' | 'Blocked';
  processing?: string;
  password?: string;
  comment?: string;
  deposited: number;
  withdrawn: number;
  tradesCount: number;
  bonusSpent: number;
  createdAt: string;
}

export interface TradingPosition {
  id: string;
  accountId: string;
  symbol: string;
  type: OrderType;
  volume: number;
  openPrice: number;
  currentPrice: number;
  openDate: string;
  closeDate?: string;
  closePrice?: number;
  swap: number;
  commission: number;
  profit: number;
  takeProfit?: number;
  stopLoss?: number;
  margin: number;
  status: OrderStatus;
  closeType?: string;
  balance?: number;
}

export interface AssetSymbol {
  id: string;
  symbol: string;
  description: string;
  category: AssetCategory;
  calcType: CalcType;
  groupName: string;
  spreadBid: number;
  spreadAsk: number;
  stopLevel: number;
  gapLevel: number;
  swapLong: number;
  swapShort: number;
  tradingAllowed: boolean;
  contractSize: number;
  marginPercent: number;
  precision: number;
  hedgeMargin: number;
  spreadType: SpreadType;
  marginCurrency: string;
  profitCurrency: string;
  processing?: string;
  commission: number;
  bid: number;
  ask: number;
  prevBid?: number;
  prevAsk?: number;
  lastUpdated: string;
  isActive: boolean;
  quotesPackage?: string;
}

export interface ManualPriceOverride {
  id: string;
  symbolId: string;
  oldBid: number;
  oldAsk: number;
  newBid: number;
  newAsk: number;
  employeeId: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

// ===================== PAYMENTS =====================
export interface PaymentRequest {
  id: string;
  clientId: string;
  accountId: string;
  type: PaymentType;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  wallet?: string;
  comment?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  creditAmount?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Bank' | 'Crypto' | 'EWallet' | 'Card';
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number;
  commission?: number;
}

// ===================== SUPPORT =====================
export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  lastMessageAt: string;
  deskId?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: 'Client' | 'Employee';
  text: string;
  attachments?: string[];
  createdAt: string;
}

// ===================== VERIFICATION =====================
export interface VerificationRequest {
  id: string;
  clientId: string;
  status: VerificationStatus;
  documents: VerificationDocument[];
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  comment?: string;
}

export interface VerificationDocument {
  id: string;
  requestId: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

// ===================== HISTORY =====================
export interface HistoryEvent {
  id: string;
  timestamp: string;
  clientId?: string;
  clientName?: string;
  deskId?: string;
  deskName?: string;
  section: HistorySection;
  authorId: string;
  authorName: string;
  source: HistorySource;
  description: string;
  details?: Record<string, any>;
  ip?: string;
  actionType?: string;
  actionStatus?: string;
  responsibleId?: string;
  actionDate?: string;
}

// ===================== SETTINGS =====================
export interface ClientStatusConfig {
  id: string;
  name: ClientStatus;
  color: string;
  isDefault: boolean;
}

export interface ActionStatusConfig {
  id: string;
  name: ActionStatus;
  isCompleted: boolean;
}

export interface ReminderInterval {
  id: string;
  label: string;
  minutes: number;
  isDefault: boolean;
}

export interface SecuritySettings {
  contactProtection: boolean;
  protectedFields: string[];
  editProtection: boolean;
  protectedEditFields: string[];
  ipWhitelist: { id: string; from: string; to: string; label?: string }[];
  showFullPhoneNumbers: boolean;
}

// ===================== SESSION =====================
export interface ClientSession {
  id: string;
  clientId: string;
  accountId?: string;
  group?: string;
  accountNumber?: string;
  fullName?: string;
  address?: string;
  email?: string;
  registrationIp?: string;
  currentIp?: string;
  isOnline: boolean;
  lastLogin?: string;
  lastDisconnect?: string;
  isDemo: boolean;
}

// ===================== AUTH STATE =====================
export interface AuthState {
  isAuthenticated: boolean;
  userType: 'admin' | 'client' | null;
  userId: string | null;
  employeeId?: string;
  clientId?: string;
  role?: Role;
  impersonating?: boolean;
  impersonatedBy?: string;
}

// ===================== NOTIFICATION =====================
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ===================== API INTEGRATION =====================
export interface ApiIntegration {
  id: string;
  name: string;
  apiKey: string;
  webhookUrl?: string;
  type: 'leads' | 'clients' | 'both';
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

// ===================== CLIENT RESTRICTION =====================
export interface ClientRestriction {
  id: string;
  name: string;
  message: string;
  restrictTrading: boolean;
  restrictWithdrawal: boolean;
  restrictFullAccess: boolean;
  targetType: 'clients' | 'desks' | 'manager' | 'filters';
  targetIds: string[];
  filterConditions?: FilterCondition[];
  isActive: boolean;
  createdAt: string;
}

// ===================== FILTER =====================
export interface FilterCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'ne' | 'in' | 'between';
  value: any;
}

export interface SavedView {
  id: string;
  name: string;
  fields: string[];
  filters: FilterCondition[];
  section: string;
}
