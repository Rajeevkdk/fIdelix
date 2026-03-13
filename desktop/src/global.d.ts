export {};

type PageSize =
  | "A4"
  | "A5"
  | "A6"
  | "A7"
  | "Letter"
  | { width: number; height: number }; // microns

declare global {
  interface Window {
    fidelix: {
      printReceipt: (payload: { html: string; pageSize: PageSize; landscape: boolean }) => Promise<{ ok: boolean }>;
      printTracking: (payload: { html: string; trackingNo: string; pageSize: PageSize; landscape: boolean }) => Promise<{ ok: boolean }>;
      printBoth: (payload: {
        receiptHtml: string;
        trackingHtml: string;
        trackingNo: string;
        receiptPageSize: PageSize;
        receiptLandscape: boolean;
        trackingPageSize: PageSize;
        trackingLandscape: boolean;
      }) => Promise<{ ok: boolean }>;
    };
  }
}