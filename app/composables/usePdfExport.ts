export function usePdfExport() {
  function exportHtml(title: string, html: string) {
    const popup = window.open('', '_blank', 'width=960,height=720')

    if (!popup) return

    popup.document.write(`
      <!doctype html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; margin: 32px; color: #111827; }
            h1 { font-size: 22px; margin: 0 0 4px; }
            p { margin: 0 0 16px; color: #4b5563; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            .right { text-align: right; }
            .muted { color: #6b7280; }
            @page { margin: 18mm; }
          </style>
        </head>
        <body>
          ${html}
          <script>window.print()</script>
        </body>
      </html>
    `)
    popup.document.close()
  }

  return { exportHtml }
}
