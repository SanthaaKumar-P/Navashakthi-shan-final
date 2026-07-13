import jsPDF from "jspdf";

export interface CertificatePdf {
  title: string;
  subtitle?: string;
  holder: string;
  id: string;
  date: string;
  seal?: string;
  authority?: string;
}

// Palette (RGB values matching brand)
const FOREST: [number, number, number] = [11, 93, 80];
const CLAY: [number, number, number] = [198, 93, 53];
const GOLD: [number, number, number] = [212, 175, 55];
const EARTH: [number, number, number] = [58, 44, 34];
const CREAM: [number, number, number] = [255, 249, 241];
const MUTED: [number, number, number] = [120, 113, 100];

export function downloadCertificatePdf(c: CertificatePdf) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(...CREAM);
  pdf.rect(0, 0, W, H, "F");

  // Double gold border
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(4);
  pdf.rect(24, 24, W - 48, H - 48);
  pdf.setLineWidth(1);
  pdf.rect(36, 36, W - 72, H - 72);

  // Corner ornaments
  pdf.setDrawColor(...CLAY);
  pdf.setLineWidth(1.2);
  const corners = [
    [50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50],
  ] as const;
  corners.forEach(([x, y]) => {
    pdf.circle(x, y, 6);
    pdf.circle(x, y, 3);
  });

  // Header
  pdf.setTextColor(...FOREST);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("NAVSHAKTHI", 70, 90);

  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("MINISTRY OF MSME  ·  GOVERNMENT VERIFIED", 70, 106);

  // Certificate ID (top right)
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text("CERTIFICATE NO.", W - 70, 90, { align: "right" });
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...EARTH);
  pdf.text(c.id, W - 70, 106, { align: "right" });

  // Seal chip
  const seal = (c.seal || "Craftmark").toUpperCase();
  pdf.setFontSize(10);
  pdf.setTextColor(...CLAY);
  pdf.setFont("helvetica", "bold");
  pdf.text(seal, W / 2, H / 2 - 90, { align: "center" });

  // Main title
  pdf.setFontSize(44);
  pdf.setTextColor(...EARTH);
  pdf.setFont("times", "bold");
  pdf.text(c.title, W / 2, H / 2 - 40, { align: "center" });

  if (c.subtitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(...MUTED);
    pdf.text(c.subtitle, W / 2, H / 2 - 15, { align: "center" });
  }

  // Divider
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(1);
  pdf.line(W / 2 - 40, H / 2 + 5, W / 2 + 40, H / 2 + 5);

  // Presented to
  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.setFont("helvetica", "normal");
  pdf.text("PRESENTED TO", W / 2, H / 2 + 30, { align: "center" });

  pdf.setFont("times", "bolditalic");
  pdf.setFontSize(32);
  pdf.setTextColor(...FOREST);
  pdf.text(c.holder, W / 2, H / 2 + 62, { align: "center" });

  // Footer
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text("ISSUED ON", 70, H - 90);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...EARTH);
  pdf.text(c.date, 70, H - 74);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text("AUTHORISED BY", W - 70, H - 90, { align: "right" });
  pdf.setFont("times", "italic");
  pdf.setFontSize(13);
  pdf.setTextColor(...EARTH);
  pdf.text(c.authority || "Team NAVSHAKTHI", W - 70, H - 72, { align: "right" });

  // Seal circle center-bottom
  pdf.setDrawColor(...CLAY);
  pdf.setFillColor(...CLAY);
  pdf.setLineWidth(2);
  pdf.circle(W / 2, H - 80, 26);
  pdf.setFillColor(255, 255, 255);
  pdf.setTextColor(...CREAM);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("SEAL", W / 2, H - 76, { align: "center" });

  pdf.save(`${c.id}-${c.title.replace(/\s+/g, "-")}.pdf`);
}
