/* Harbor OS: application shell is intentionally light, with the dashboard owning navigation and workspace state. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
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
    <Switch>
      <Route path="/" component={Home} />
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
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-right" />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
