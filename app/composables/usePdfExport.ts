export function usePdfExport() {
  async function exportHtml(title: string, html: string, filename?: string) {
    if (!import.meta.client) return;

    const { default: html2pdf } = await import("html2pdf.js");
    const target = document.createElement("div");
    target.style.position = "fixed";
    target.style.left = "-10000px";
    target.style.top = "0";
    target.innerHTML = `
      <section class="pdf-page">
        <header class="pdf-header">
          <div>
            <p class="pdf-brand">HL</p>
            <h1>${title}</h1>
          </div>
          <p class="pdf-date">${formatDate(new Date())}</p>
        </header>
        ${html}
        <footer class="pdf-footer">HL Sales & Receivables</footer>
      </section>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .pdf-page { width: 190mm; color: #111827; font-family: Inter, Arial, sans-serif; font-size: 12px; }
      .pdf-header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 10px; margin-bottom: 14px; }
      .pdf-brand { margin: 0 0 2px; color: #0284c7; font-weight: 700; letter-spacing: 0.08em; }
      .pdf-date, .pdf-page p { margin: 0 0 10px; color: #4b5563; }
      .pdf-page h1 { margin: 0; font-size: 20px; line-height: 1.25; }
      .pdf-page table { border-collapse: collapse; width: 100%; font-size: 11px; }
      .pdf-page th, .pdf-page td { border: 1px solid #d1d5db; padding: 7px; text-align: left; vertical-align: top; }
      .pdf-page th { background: #f3f4f6; color: #334155; font-weight: 700; }
      .pdf-page .right { text-align: right; }
      .pdf-footer { margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px; color: #6b7280; font-size: 10px; }
    `;

    document.body.append(style, target);

    try {
      const worker = html2pdf()
        .from(target)
        .set({
          margin: [10, 10, 15, 10],
          filename: filename ?? `${slugify(title)}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .toPdf();

      const pdf = await worker.get("pdf");
      const totalPages = pdf.internal.getNumberOfPages();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        pdf.setFontSize(9);
        pdf.setTextColor("#6b7280");
        pdf.text(
          `Halaman ${page} dari ${totalPages}`,
          pageWidth / 2,
          pageHeight - 7,
          {
            align: "center",
          },
        );
      }

      await worker.save();
    } finally {
      target.remove();
      style.remove();
    }
  }

  return { exportHtml };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
