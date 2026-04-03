import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TradingProvider } from "@/contexts/TradingContext";
import ProtectedRoute, { AdminPageGuard } from "./components/ProtectedRoute";

import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Website (public)
import WebsiteLayout from "./layouts/WebsiteLayout";
import HomePage from "./pages/website/HomePage";
import AboutPage from "./pages/website/AboutPage";
import PlatformPage from "./pages/website/PlatformPage";
import ConditionsPage from "./pages/website/ConditionsPage";
import FAQPage from "./pages/website/FAQPage";
import ContactsPage from "./pages/website/ContactsPage";
import RegisterPage from "./pages/website/RegisterPage";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminClientCard from "./pages/admin/AdminClientCard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminTrading from "./pages/admin/AdminTrading";
import AdminAssets from "./pages/admin/AdminAssets";
import AdminPrices from "./pages/admin/AdminPrices";
import AdminHistory from "./pages/admin/AdminHistory";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminDesks from "./pages/admin/AdminDesks";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOnline from "./pages/admin/AdminOnline";
import AdminReports from "./pages/admin/AdminReports";
import AdminAccounts from "./pages/admin/AdminAccounts";

// Client
import ClientLayout from "./layouts/ClientLayout";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientAccounts from "./pages/client/ClientAccounts";
import ClientDeposit from "./pages/client/ClientDeposit";
import ClientWithdraw from "./pages/client/ClientWithdraw";
import ClientTransfer from "./pages/client/ClientTransfer";
import ClientPaymentHistory from "./pages/client/ClientPaymentHistory";
import ClientSupport from "./pages/client/ClientSupport";
import ClientProfile from "./pages/client/ClientProfile";

// Terminal
import TerminalLayout from "./layouts/TerminalLayout";
import TerminalMain from "./pages/terminal/TerminalMain";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public website */}
          <Route element={<WebsiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/conditions" element={<ConditionsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
          </Route>
          <Route path="/register" element={<RegisterPage />} />

          {/* Auth */}
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin CRM — protected */}
          <Route path="/admin" element={<ProtectedRoute requiredType="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminPageGuard routeKey="dashboard"><AdminDashboard /></AdminPageGuard>} />
            <Route path="clients" element={<AdminPageGuard routeKey="clients"><AdminClients /></AdminPageGuard>} />
            <Route path="clients/:id" element={<AdminPageGuard routeKey="clients"><AdminClientCard /></AdminPageGuard>} />
            <Route path="leads" element={<AdminPageGuard routeKey="leads"><AdminLeads /></AdminPageGuard>} />
            <Route path="accounts" element={<AdminPageGuard routeKey="accounts"><AdminAccounts /></AdminPageGuard>} />
            <Route path="payments" element={<AdminPageGuard routeKey="payments"><AdminPayments /></AdminPageGuard>} />
            <Route path="trading" element={<AdminPageGuard routeKey="trading"><AdminTrading /></AdminPageGuard>} />
            <Route path="assets" element={<AdminPageGuard routeKey="assets"><AdminAssets /></AdminPageGuard>} />
            <Route path="prices" element={<AdminPageGuard routeKey="assets"><AdminPrices /></AdminPageGuard>} />
            <Route path="history" element={<AdminPageGuard routeKey="history"><AdminHistory /></AdminPageGuard>} />
            <Route path="employees" element={<AdminPageGuard routeKey="employees"><AdminEmployees /></AdminPageGuard>} />
            <Route path="roles" element={<AdminPageGuard routeKey="roles"><AdminRoles /></AdminPageGuard>} />
            <Route path="desks" element={<AdminPageGuard routeKey="desks"><AdminDesks /></AdminPageGuard>} />
            <Route path="verification" element={<AdminPageGuard routeKey="verification"><AdminVerification /></AdminPageGuard>} />
            <Route path="support" element={<AdminPageGuard routeKey="support"><AdminSupport /></AdminPageGuard>} />
            <Route path="settings" element={<AdminPageGuard routeKey="settings"><AdminSettings /></AdminPageGuard>} />
            <Route path="online" element={<AdminPageGuard routeKey="online"><AdminOnline /></AdminPageGuard>} />
            <Route path="reports" element={<AdminPageGuard routeKey="reports"><AdminReports /></AdminPageGuard>} />
          </Route>

          {/* Client Cabinet — protected */}
          <Route path="/client" element={<ProtectedRoute requiredType="client"><ClientLayout /></ProtectedRoute>}>
            <Route index element={<ClientDashboard />} />
            <Route path="accounts" element={<ClientAccounts />} />
            <Route path="payments/deposit" element={<ClientDeposit />} />
            <Route path="payments/withdraw" element={<ClientWithdraw />} />
            <Route path="payments/transfer" element={<ClientTransfer />} />
            <Route path="payments/history" element={<ClientPaymentHistory />} />
            <Route path="support" element={<ClientSupport />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          {/* Terminal — protected (client) */}
          <Route path="/terminal" element={<ProtectedRoute requiredType="client"><TerminalLayout /></ProtectedRoute>}>
            <Route index element={<TerminalMain />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
