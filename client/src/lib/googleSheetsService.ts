// Google Sheets and Drive API Service for FinTrack

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface GoogleSheetTab {
  sheetId: number;
  title: string;
  index: number;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  webViewLink?: string;
  sheets: GoogleSheetTab[];
}

export interface SyncFinancialDataPayload {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  receivables: number;
  payables: number;
  outstandingLoans: number;
  transactions: any[];
  expenses: any[];
  orders: any[];
  clients: any[];
  projects: any[];
  loans: any[];
  products: any[];
  salesMetrics?: {
    totalRevenue?: number;
    netSales?: number;
    actualProfit?: number;
    totalOrders?: number;
    totalInventoryValue?: number;
  };
}

/**
 * Parses a Google Sheets URL or raw ID to get the spreadsheet ID
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  // Regex to match /d/<id>/ in Google Docs URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an ID (alphanumeric with dashes/underscores, typically ~44 chars)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Lists user's Google Sheets from Google Drive
 */
export async function listSpreadsheets(accessToken: string): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=40`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load Google Sheets from Drive (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return (data.files || []) as GoogleDriveFile[];
}

/**
 * Fetches spreadsheet metadata including title and tabs
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMetadata> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=spreadsheetId,properties.title,sheets.properties`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to access Google Sheet (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const sheets: GoogleSheetTab[] = (data.sheets || []).map((s: any) => ({
    sheetId: s.properties.sheetId,
    title: s.properties.title,
    index: s.properties.index,
  }));

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || "Untitled Spreadsheet",
    webViewLink: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets,
  };
}

/**
 * Creates a brand new Google Sheet specifically tailored for FinTrack
 */
export async function createFinTrackSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<SpreadsheetMetadata> {
  const title =
    customTitle ||
    `FinTrack Financial Ledger - ${new Date().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })}`;

  const url = "https://sheets.googleapis.com/v4/spreadsheets";

  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: "Dashboard Summary",
          gridProperties: { frozenRowCount: 2 },
        },
      },
      {
        properties: {
          title: "Transactions",
          gridProperties: { frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: "Expenses",
          gridProperties: { frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: "Sales & Orders",
          gridProperties: { frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: "Clients & Projects",
          gridProperties: { frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: "Loans",
          gridProperties: { frozenRowCount: 1 },
        },
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create new Google Sheet (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const sheets: GoogleSheetTab[] = (data.sheets || []).map((s: any) => ({
    sheetId: s.properties.sheetId,
    title: s.properties.title,
    index: s.properties.index,
  }));

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    webViewLink: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets,
  };
}

/**
 * Ensures required tabs exist on the target spreadsheet without deleting existing user tabs
 */
export async function ensureRequiredTabsExist(
  accessToken: string,
  spreadsheetId: string,
  requiredTabTitles: string[]
): Promise<void> {
  const metadata = await getSpreadsheetMetadata(accessToken, spreadsheetId);
  const existingTabTitles = new Set(metadata.sheets.map((s) => s.title.toLowerCase()));

  const tabsToAdd = requiredTabTitles.filter(
    (title) => !existingTabTitles.has(title.toLowerCase())
  );

  if (tabsToAdd.length === 0) {
    return;
  }

  const requests = tabsToAdd.map((title) => ({
    addSheet: {
      properties: {
        title,
        gridProperties: { frozenRowCount: 1 },
      },
    },
  }));

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    console.warn("Notice: could not auto-add missing sheet tabs:", await response.text());
  }
}

/**
 * Clears and updates full data set in the Google Sheet
 */
export async function syncAllDataToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  data: SyncFinancialDataPayload
): Promise<{ updatedCells: number; timestamp: string }> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const now = new Date().toLocaleString();

  // 1. Ensure required tabs exist
  await ensureRequiredTabsExist(accessToken, cleanId, [
    "Dashboard Summary",
    "Transactions",
    "Expenses",
    "Sales & Orders",
    "Clients & Projects",
    "Loans",
  ]);

  // 2. Prepare Dashboard Summary Table
  const dashboardValues: (string | number)[][] = [
    ["FINTRACK FINANCIAL OS - LIVE DASHBOARD SUMMARY", "", "", ""],
    [`Last Synchronized: ${now}`, "", "Currency: PKR (Rs.)", ""],
    ["", "", "", ""],
    ["METRIC", "AMOUNT (PKR)", "STATUS / CONTEXT", "TARGET TYPE"],
    ["Total Income", data.totalIncome, `${data.transactions.filter(t => t.type?.includes("income") || t.type?.includes("fee")).length} Inflow Entries`, "Asset Flow"],
    ["Total Expenses", data.totalExpenses, `${data.expenses.length} Recorded Outflows`, "Expense"],
    ["Net Profit", data.netProfit, data.netProfit >= 0 ? "Positive Cash Margin" : "Negative Margin", "Balance"],
    ["Receivables", data.receivables, "Uncollected Client & Student Balances", "Pending Asset"],
    ["Payables", data.payables, "Vendor & Operating Liabilities", "Liability"],
    ["Outstanding Loans", data.outstandingLoans, "Active Loan Repayments Due", "Liability"],
    ["", "", "", ""],
    ["COMMERCE & BUSINESS METRICS", "VALUE", "DETAILS", ""],
    ["Total Sales Revenue", data.salesMetrics?.totalRevenue || 0, "Gross order intake", ""],
    ["Net Sales Margin", data.salesMetrics?.netSales || 0, "Net after discounts/returns", ""],
    ["Commerce Gross Profit", data.salesMetrics?.actualProfit || 0, "Sales profit margin", ""],
    ["Total Orders Count", data.salesMetrics?.totalOrders || data.orders.length, "Recorded customer orders", ""],
    ["Total Inventory Valuation", data.salesMetrics?.totalInventoryValue || 0, "Calculated cost of stock on hand", ""],
    ["Active Products in Catalog", data.products.length, "Product variants available", ""],
    ["Total Registered Clients", data.clients.length, "Commercial and business accounts", ""],
  ];

  // 3. Prepare Transactions Table
  const transactionHeaders = [
    "Date",
    "Transaction ID",
    "Type",
    "Category",
    "Amount (PKR)",
    "Description",
    "Payment Method",
    "Reference Type",
    "Reference ID",
    "Notes",
  ];
  const transactionRows = data.transactions.map((t) => [
    t.date || "",
    t.id || "",
    t.type || "",
    t.category || "",
    Number(t.amount || 0),
    t.description || "",
    t.payment_method || "",
    t.reference_type || "",
    t.reference_id || "",
    t.notes || "",
  ]);
  const transactionValues = [transactionHeaders, ...transactionRows];

  // 4. Prepare Expenses Table
  const expenseHeaders = [
    "Date",
    "Expense ID",
    "Description",
    "Category",
    "Amount (PKR)",
    "Payment Method",
    "Notes",
  ];
  const expenseRows = data.expenses.map((e) => [
    e.date || "",
    e.id || "",
    e.description || "",
    e.category || "",
    Number(e.amount || 0),
    e.payment_method || "",
    e.notes || "",
  ]);
  const expenseValues = [expenseHeaders, ...expenseRows];

  // 5. Prepare Sales & Orders Table
  const orderHeaders = [
    "Order #",
    "Date",
    "Customer Name",
    "Phone / Contact",
    "Platform",
    "Total Price (PKR)",
    "Total Cost (PKR)",
    "Net Margin (PKR)",
    "Payment Status",
    "Order Status",
    "Items Count",
  ];
  const orderRows = data.orders.map((o) => [
    o.order_number || o.id || "",
    o.order_date || "",
    o.customer_name || "",
    o.customer_phone || "",
    o.platform || "manual",
    Number(o.total_price || 0),
    Number(o.total_cost || 0),
    Number(o.profit_margin || (o.total_price - o.total_cost) || 0),
    o.payment_status || "paid",
    o.order_status || "completed",
    o.items?.length || 1,
  ]);
  const orderValues = [orderHeaders, ...orderRows];

  // 6. Prepare Clients & Projects Table
  const clientHeaders = [
    "Name / Project",
    "Category",
    "Email",
    "Phone / Contact",
    "Company",
    "Total Value / Fee (PKR)",
    "Received (PKR)",
    "Outstanding (PKR)",
    "Status",
  ];
  const clientRows = data.clients.map((c) => [
    c.name || "",
    "Client Account",
    c.email || "",
    c.phone || "",
    c.company || "",
    Number(c.total_billed || 0),
    Number(c.received_amount || 0),
    Number(c.outstanding_balance || 0),
    c.status || "active",
  ]);
  const projectRows = data.projects.map((p) => [
    p.name || "",
    "Project Deliverable",
    "",
    "",
    p.description || "",
    Number(p.total_amount || 0),
    Number(p.received_amount || 0),
    Number((p.total_amount || 0) - (p.received_amount || 0)),
    p.status || "active",
  ]);
  const clientValues = [clientHeaders, ...clientRows, ...projectRows];

  // 7. Prepare Loans Table
  const loanHeaders = [
    "Lender",
    "Principal Amount (PKR)",
    "Remaining Amount (PKR)",
    "Interest Rate (%)",
    "Due Date",
    "Status",
    "Reason / Purpose",
  ];
  const loanRows = data.loans.map((l) => [
    l.lender || "",
    Number(l.principal_amount || 0),
    Number(l.remaining_amount || 0),
    Number(l.interest_rate || 0),
    l.due_date || "",
    l.status || "active",
    l.reason || "",
  ]);
  const loanValues = [loanHeaders, ...loanRows];

  // 8. Execute batchUpdate with valueInputOption=USER_ENTERED
  // Note: we write to ranges with plenty of buffer so old extra rows are cleared
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values:batchUpdate`;

  // Pad arrays with empty rows to clear previous extra lines up to 500 rows
  const padTable = (values: (string | number)[][], targetCols: number, minRows = 100) => {
    const padded = [...values];
    while (padded.length < minRows) {
      padded.push(new Array(targetCols).fill(""));
    }
    return padded;
  };

  const payload = {
    valueInputOption: "USER_ENTERED",
    data: [
      {
        range: "'Dashboard Summary'!A1:D30",
        values: dashboardValues,
      },
      {
        range: `'Transactions'!A1:J${Math.max(transactionValues.length + 10, 100)}`,
        values: padTable(transactionValues, 10, Math.max(transactionValues.length + 10, 50)),
      },
      {
        range: `'Expenses'!A1:G${Math.max(expenseValues.length + 10, 100)}`,
        values: padTable(expenseValues, 7, Math.max(expenseValues.length + 10, 50)),
      },
      {
        range: `'Sales & Orders'!A1:K${Math.max(orderValues.length + 10, 100)}`,
        values: padTable(orderValues, 11, Math.max(orderValues.length + 10, 50)),
      },
      {
        range: `'Clients & Projects'!A1:I${Math.max(clientValues.length + 10, 100)}`,
        values: padTable(clientValues, 9, Math.max(clientValues.length + 10, 50)),
      },
      {
        range: `'Loans'!A1:G${Math.max(loanValues.length + 10, 50)}`,
        values: padTable(loanValues, 7, Math.max(loanValues.length + 10, 30)),
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to sync data to Google Sheet (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const updatedCells = result.totalUpdatedCells || 0;

  return {
    updatedCells,
    timestamp: now,
  };
}
