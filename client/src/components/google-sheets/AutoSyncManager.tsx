import React, { useEffect, useRef } from "react";
import { useGoogleSheets } from "@/contexts/GoogleSheetsContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { GoogleSheetSelectorModal } from "./GoogleSheetSelectorModal";
import { useLocation } from "wouter";

const PROMPT_SESSION_KEY = "fintrack_dashboard_sheet_prompted_v1";

export function AutoSyncManager() {
  const [location] = useLocation();
  const {
    activeSheet,
    autoSyncEnabled,
    syncData,
    isSelectorOpen,
    setIsSelectorOpen,
  } = useGoogleSheets();

  const financialData = useFinancialData();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMountRef = useRef(true);

  // 1. Ask for Google Sheet when user enters dashboard (if not connected yet)
  useEffect(() => {
    const isDashboard = location === "/";
    if (isDashboard && !activeSheet) {
      const alreadyPrompted = sessionStorage.getItem(PROMPT_SESSION_KEY);
      if (!alreadyPrompted) {
        sessionStorage.setItem(PROMPT_SESSION_KEY, "true");
        const timer = setTimeout(() => {
          setIsSelectorOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [location, activeSheet, setIsSelectorOpen]);

  // 2. Automated background sync whenever financial records change
  useEffect(() => {
    // Skip the very first initial render
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    if (!activeSheet || !autoSyncEnabled) {
      return;
    }

    // Debounce 2 seconds to batch rapid inputs
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const payload = {
        totalIncome: financialData.totalIncome,
        totalExpenses: financialData.totalExpenses,
        netProfit: financialData.netProfit,
        receivables: financialData.receivables,
        payables: financialData.payables,
        outstandingLoans: financialData.outstandingLoans,
        transactions: financialData.transactions,
        expenses: financialData.expenses,
        orders: financialData.orders,
        clients: financialData.clients,
        projects: financialData.projects,
        loans: financialData.loans,
        products: financialData.products,
        salesMetrics: financialData.salesMetrics,
      };

      syncData(payload, true);
    }, 2000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    financialData.transactions,
    financialData.expenses,
    financialData.orders,
    financialData.clients,
    financialData.projects,
    financialData.loans,
    financialData.products,
    activeSheet,
    autoSyncEnabled,
    syncData,
  ]);

  return (
    <GoogleSheetSelectorModal
      open={isSelectorOpen}
      onOpenChange={setIsSelectorOpen}
    />
  );
}
