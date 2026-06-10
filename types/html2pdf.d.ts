declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: "jpeg" | "png" | "webp";
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
    };
    pagebreak?: {
      mode?: string[];
    };
  }

  interface Html2PdfWorker {
    from(element: HTMLElement): Html2PdfWorker;
    set(options: Html2PdfOptions): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    get(key: "pdf"): Promise<{
      internal: {
        getNumberOfPages(): number;
        pageSize: {
          getWidth(): number;
          getHeight(): number;
        };
      };
      setPage(page: number): void;
      setFontSize(size: number): void;
      setTextColor(color: string): void;
      text(
        text: string,
        x: number,
        y: number,
        options?: { align?: "center" | "left" | "right" },
      ): void;
    }>;
    save(): Promise<void>;
  }

  export default function html2pdf(): Html2PdfWorker;
}
