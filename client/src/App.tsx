import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FinancialDataProvider } from "./contexts/FinancialDataContext";
import { GoogleSheetsProvider } from "./contexts/GoogleSheetsContext";
import { AutoSyncManager } from "./components/google-sheets/AutoSyncManager";
import { AppLayout } from "./components/layout/AppLayout";
import Home from "./pages/Home";
import SalesBusiness from "./pages/SalesBusiness";
import Transactions from "./pages/Transactions";
import StudentsFees from "./pages/StudentsFees";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Expenses from "./pages/Expenses";
import OwnerPayments from "./pages/OwnerPayments";
import Loans from "./pages/Loans";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sales-business" component={SalesBusiness} />
        <Route path="/sales" component={SalesBusiness} />
        <Route path="/products" component={SalesBusiness} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/students-fees" component={StudentsFees} />
        <Route path="/clients" component={Clients} />
        <Route path="/projects" component={Projects} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/owner-payments" component={OwnerPayments} />
        <Route path="/loans" component={Loans} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <FinancialDataProvider>
            <GoogleSheetsProvider>
              <TooltipProvider>
                <Toaster position="top-right" />
                <AutoSyncManager />
                <Router />
              </TooltipProvider>
            </GoogleSheetsProvider>
          </FinancialDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
