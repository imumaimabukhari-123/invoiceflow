// Builds a professional PDF of an invoice in the browser (no server needed).
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { date, money, STATUS_LABEL } from "./format.js";

const INDIGO = [79, 70, 229];
const GREY = [100, 106, 120];

export function downloadInvoicePdf(inv, user) {
  const cur = user.business.currency;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, W, 8, "F");

  // From (business) on the left, INVOICE on the right
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(20, 20, 30);
  doc.text(user.business.name || user.name, 40, 60);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...GREY);
  doc.text(doc.splitTextToSize(user.business.address || "", 250), 40, 78);

  doc.setFont("helvetica", "bold").setFontSize(26).setTextColor(...INDIGO);
  doc.text("INVOICE", W - 40, 60, { align: "right" });
  doc.setFontSize(10).setTextColor(20, 20, 30);
  const status = STATUS_LABEL[inv.displayStatus];
  [["Invoice no.", inv.number], ["Issue date", date(inv.issueDate)], ["Due date", date(inv.dueDate)], ["Status", status]].forEach(([k, v], i) => {
    doc.setFont("helvetica", "normal").setTextColor(...GREY).text(k, W - 170, 82 + i * 15);
    doc.setFont("helvetica", "bold").setTextColor(20, 20, 30).text(String(v), W - 40, 82 + i * 15, { align: "right" });
  });

  // Bill to
  const c = inv.client || {};
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...INDIGO).text("BILL TO", 40, 160);
  doc.setFontSize(12).setTextColor(20, 20, 30).text(c.name || "", 40, 177);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...GREY);
  const lines = [c.company, c.email, c.phone, ...(c.address ? doc.splitTextToSize(c.address, 260) : [])].filter(Boolean);
  doc.text(lines, 40, 193);

  autoTable(doc, {
    startY: 250,
    head: [["Description", "Qty", "Price", "Amount"]],
    body: inv.items.map((i) => [i.description, String(i.quantity), money(i.price, cur), money(i.quantity * i.price, cur)]),
    theme: "striped",
    headStyles: { fillColor: INDIGO, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 7 },
    columnStyles: { 1: { halign: "right", cellWidth: 50 }, 2: { halign: "right", cellWidth: 90 }, 3: { halign: "right", cellWidth: 100 } },
    margin: { left: 40, right: 40 },
    didParseCell: (d) => { if (d.section === "head" && d.column.index > 0) d.cell.styles.halign = "right"; },
  });

  // Totals
  let y = doc.lastAutoTable.finalY + 24;
  const row = (label, value, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(bold ? 13 : 10).setTextColor(bold ? 20 : 100, bold ? 20 : 106, bold ? 30 : 120);
    doc.text(label, W - 200, y);
    doc.text(value, W - 40, y, { align: "right" });
    y += bold ? 22 : 17;
  };
  row("Subtotal", money(inv.subtotal, cur));
  if (inv.discount) row("Discount", "-" + money(inv.discount, cur));
  if (inv.taxRate) row(`Tax (${inv.taxRate}%)`, money(inv.tax, cur));
  doc.setDrawColor(220, 222, 230).line(W - 200, y - 8, W - 40, y - 8);
  y += 6;
  row("Total", money(inv.total, cur), true);

  if (inv.notes) {
    y += 20;
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...INDIGO).text("NOTES", 40, y);
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...GREY).text(doc.splitTextToSize(inv.notes, W - 80), 40, y + 15);
  }

  const H = doc.internal.pageSize.getHeight();
  doc.setFontSize(8).setTextColor(160, 164, 175).text("Created with InvoiceFlow", W / 2, H - 24, { align: "center" });
  doc.save(`${inv.number}.pdf`);
}
