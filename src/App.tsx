import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "./components/ProtectedRoute";

import ClientLogin from "./pages/ClientLogin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

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
          {/* Public login pages */}
          <Route path="/" element={<ClientLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin CRM — protected */}
          <Route path="/admin" element={<ProtectedRoute requiredType="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:id" element={<AdminClientCard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="trading" element={<AdminTrading />} />
            <Route path="assets" element={<AdminAssets />} />
            <Route path="prices" element={<AdminPrices />} />
            <Route path="history" element={<AdminHistory />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="desks" element={<AdminDesks />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="online" element={<AdminOnline />} />
            <Route path="reports" element={<AdminReports />} />
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
