import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";

// Slugify a title for use as a filename
function toFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

// Strip inline markdown tokens (**bold**, *italic*, `code`, etc.)
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

function renderMarkdownToPdf(doc: PDFKit.PDFDocument, markdown: string) {
  const FONTS = {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    oblique: "Helvetica-Oblique",
  };

  const COLORS = {
    heading: "#1a1a2e",
    body: "#333333",
    muted: "#666666",
    rule: "#cccccc",
    bullet: "#4f46e5",
  };

  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Blank line
    if (line.trim() === "") {
      doc.moveDown(0.4);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      doc
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .strokeColor(COLORS.rule)
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.5);
      i++;
      continue;
    }

    // H1
    if (/^# /.test(line)) {
      const text = stripInlineMarkdown(line.slice(2).trim());
      doc
        .font(FONTS.bold)
        .fontSize(22)
        .fillColor(COLORS.heading)
        .text(text, { paragraphGap: 6 });
      doc.moveDown(0.3);
      i++;
      continue;
    }

    // H2
    if (/^## /.test(line)) {
      const text = stripInlineMarkdown(line.slice(3).trim());
      doc.moveDown(0.3);
      doc
        .font(FONTS.bold)
        .fontSize(16)
        .fillColor(COLORS.heading)
        .text(text, { paragraphGap: 4 });
      doc.moveDown(0.2);
      i++;
      continue;
    }

    // H3
    if (/^### /.test(line)) {
      const text = stripInlineMarkdown(line.slice(4).trim());
      doc.moveDown(0.2);
      doc
        .font(FONTS.bold)
        .fontSize(13)
        .fillColor(COLORS.heading)
        .text(text, { paragraphGap: 3 });
      doc.moveDown(0.1);
      i++;
      continue;
    }

    // H4/H5/H6 — treat as bold body text
    if (/^#{4,6} /.test(line)) {
      const text = stripInlineMarkdown(line.replace(/^#{4,6} /, "").trim());
      doc
        .font(FONTS.bold)
        .fontSize(11)
        .fillColor(COLORS.body)
        .text(text, { paragraphGap: 2 });
      i++;
      continue;
    }

    // Bullet list item (- or * or +)
    if (/^[-*+] /.test(line)) {
      const text = stripInlineMarkdown(line.slice(2).trim());
      const x = doc.page.margins.left;
      const indent = 14;
      doc
        .font(FONTS.normal)
        .fontSize(11)
        .fillColor(COLORS.bullet)
        .text("•", x, doc.y, { continued: false, width: indent });

      // pdfkit moves cursor after text(), so we need to go back up
      doc.moveUp();
      doc
        .fillColor(COLORS.body)
        .text(text, x + indent, doc.y, {
          width: doc.page.width - doc.page.margins.right - x - indent,
          paragraphGap: 2,
        });
      i++;
      continue;
    }

    // Numbered list item
    if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)$/);
      if (match) {
        const num = match[1] + ".";
        const text = stripInlineMarkdown(match[2].trim());
        const x = doc.page.margins.left;
        const indent = 20;
        doc
          .font(FONTS.bold)
          .fontSize(11)
          .fillColor(COLORS.bullet)
          .text(num, x, doc.y, { continued: false, width: indent });
        doc.moveUp();
        doc
          .font(FONTS.normal)
          .fillColor(COLORS.body)
          .text(text, x + indent, doc.y, {
            width: doc.page.width - doc.page.margins.right - x - indent,
            paragraphGap: 2,
          });
      }
      i++;
      continue;
    }

    // Blockquote
    if (/^> /.test(line)) {
      const text = stripInlineMarkdown(line.slice(2).trim());
      doc
        .font(FONTS.oblique)
        .fontSize(11)
        .fillColor(COLORS.muted)
        .text(text, doc.page.margins.left + 16, doc.y, {
          width: doc.page.width - doc.page.margins.right - doc.page.margins.left - 16,
          paragraphGap: 4,
        });
      i++;
      continue;
    }

    // Plain paragraph — collect consecutive non-empty, non-heading lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6} /.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^\*\*\*+$/.test(lines[i].trim())
    ) {
      paragraphLines.push(stripInlineMarkdown(lines[i].trimEnd()));
      i++;
    }
    const paraText = paragraphLines.join(" ").trim();
    if (paraText) {
      doc
        .font(FONTS.normal)
        .fontSize(11)
        .fillColor(COLORS.body)
        .text(paraText, {
          align: "justify",
          paragraphGap: 4,
          lineGap: 2,
        });
      doc.moveDown(0.3);
    }
    continue;
  }
}

export async function POST(req: NextRequest) {
  const { content, title = "Proposal" } = await req.json();

  if (!content || typeof content !== "string") {
    return new Response(JSON.stringify({ error: "Missing content" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 72, size: "LETTER" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cover header
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#4f46e5")
      .text("PROPOSAL DOCUMENT", { align: "center" });
    doc.moveDown(0.2);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor("#4f46e5")
      .lineWidth(1.5)
      .stroke();
    doc.moveDown(1);

    renderMarkdownToPdf(doc, content);

    // Footer on every page
    const pageCount = doc.bufferedPageRange().count;
    for (let p = 0; p < pageCount; p++) {
      doc.switchToPage(p);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#999999")
        .text(
          `Generated by AI Proposal Generator · ${new Date().toLocaleDateString()}`,
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom + 10,
          { align: "center", width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
        );
    }

    doc.end();
  });

  const filename = `${toFilename(title) || "proposal"}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
