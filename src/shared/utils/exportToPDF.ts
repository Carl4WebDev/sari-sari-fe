import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function peso(amount: number): string {
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, dec] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `Php ${amount < 0 ? "-" : ""}${withCommas}.${dec}`;
}

const COLORS = {
  primary: [30, 58, 138] as [number, number, number], // #1E3A8A
  white: [255, 255, 255] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
};

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  // Blue header bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 16);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 14, 25);
  }

  // Date
  const date = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(9);
  doc.text(`Generated: ${date}`, 196, 16, { align: "right" });

  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    doc.text("Listahub - Sari-Sari Loan Tracker", 14, 290);
  }
}

// ─── Borrowers PDF ───────────────────────────────────────────

export function generateBorrowersPDF(
  borrowers: any[],
  storeName: string,
) {
  const doc = new jsPDF();
  addHeader(doc, "Borrowers Report", storeName);

  const rows = borrowers.map((b) => [
    b.borrower_id,
    `${b.first_name} ${b.middle_name ? b.middle_name[0] + "." : ""} ${b.last_name}`,
    b.contact_number || "-",
    b.dob
      ? new Date(b.dob).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-",
    peso(Number(b.balance || 0)),
    Number(b.balance || 0) > 0 ? "With Balance" : "Fully Paid",
  ]);

  autoTable(doc, {
    startY: 38,
    head: [["ID", "Name", "Contact", "Birthdate", "Balance", "Status"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: COLORS.lightGray },
    columnStyles: {
      4: { halign: "right" },
      5: { halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 5) {
        const val = data.cell.raw as string;
        if (val === "Fully Paid") {
          data.cell.styles.textColor = COLORS.green;
          data.cell.styles.fontStyle = "bold";
        } else if (val === "With Balance") {
          data.cell.styles.textColor = COLORS.red;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  addFooter(doc);
  doc.save(`borrowers-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Transactions PDF ────────────────────────────────────────

export function generateTransactionsPDF(
  borrowerName: string,
  transactions: any[],
  totalBalance: number,
  storeName: string,
) {
  const doc = new jsPDF();
  addHeader(doc, "Transaction Ledger", `${storeName} — ${borrowerName}`);

  // Balance summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Current Balance:", 14, 40);
  doc.setTextColor(totalBalance > 0 ? COLORS.red[0] : COLORS.green[0], totalBalance > 0 ? COLORS.red[1] : COLORS.green[1], totalBalance > 0 ? COLORS.red[2] : COLORS.green[2]);
  doc.text(peso(totalBalance), 60, 40);
  doc.setTextColor(0, 0, 0);

  const rows = transactions.map((t) => {
    const items = t.items?.length
      ? t.items.map((i: any) => `${i.product} x${i.quantity}`).join(", ")
      : "-";

    return [
      t.type,
      t.date,
      items,
      t.type === "LOAN"
        ? peso(Number(t.amount))
        : "-",
      t.type === "PAYMENT"
        ? peso(Number(t.amount))
        : "-",
      peso(Number(t.runningBalance || 0)),
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [["Type", "Date", "Items", "Loan", "Payment", "Running Balance"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: COLORS.lightGray },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 0) {
        const val = data.cell.raw as string;
        if (val === "LOAN") {
          data.cell.styles.textColor = COLORS.red;
          data.cell.styles.fontStyle = "bold";
        } else if (val === "PAYMENT") {
          data.cell.styles.textColor = COLORS.green;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  addFooter(doc);
  const safeName = borrowerName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  doc.save(`${safeName}-transactions-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Products PDF ────────────────────────────────────────────

export function generateProductsPDF(products: any[], storeName: string) {
  const doc = new jsPDF();
  addHeader(doc, "Products Report", storeName);

  const rows = products.map((p) => [
    p.product_id,
    p.product_name,
    peso(Number(p.product_price)),
    p.is_active ? "Active" : "Archived",
  ]);

  autoTable(doc, {
    startY: 38,
    head: [["ID", "Product Name", "Price", "Status"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: COLORS.lightGray },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 3) {
        const val = data.cell.raw as string;
        if (val === "Active") {
          data.cell.styles.textColor = COLORS.green;
        } else {
          data.cell.styles.textColor = [150, 150, 150];
        }
      }
    },
  });

  addFooter(doc);
  doc.save(`products-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Dashboard PDF ───────────────────────────────────────────

export function generateDashboardPDF(dashboard: any, storeName: string) {
  const doc = new jsPDF();
  addHeader(doc, "Dashboard Summary", storeName);

  let y = 40;

  // Summary stats
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Overview", 14, y);
  y += 8;

  const stats = [
    ["Total Utang", peso(Number(dashboard.total_utang || 0))],
    ["Total Borrowers", String(dashboard.total_borrowers || 0)],
    ["New Today", String(dashboard.new_borrowers_today || 0)],
    ["New This Month", String(dashboard.new_borrowers_this_month || 0)],
    ["Fully Paid", String(dashboard.fully_paid || 0)],
    ["With Balance", String(dashboard.with_balance || 0)],
  ];

  autoTable(doc, {
    startY: y,
    body: stats,
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { halign: "right" },
    },
    theme: "plain",
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Top Borrowers
  if (dashboard.top_borrowers?.length) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Top Borrowers", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Name", "Balance"]],
      body: dashboard.top_borrowers.map((b: any) => [
        b.name,
        peso(Number(b.balance || 0)),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "right" } },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Recent Activities
  if (dashboard.recent_activities?.length) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Recent Activities", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Type", "Borrower", "Amount", "Date"]],
      body: dashboard.recent_activities.map((a: any) => [
        a.type,
        a.borrower_name,
        peso(Number(a.amount || 0)),
        new Date(a.created_at).toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: "bold",
      },
      columnStyles: { 2: { halign: "right" } },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 0) {
          const val = data.cell.raw as string;
          if (val === "LOAN") {
            data.cell.styles.textColor = COLORS.red;
            data.cell.styles.fontStyle = "bold";
          } else if (val === "PAYMENT") {
            data.cell.styles.textColor = COLORS.green;
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });
  }

  addFooter(doc);
  doc.save(`dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
}
