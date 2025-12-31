
export interface ExcelRow {
  barcode: string;
  productId: string;
  productName: string;
  sizeId: string;
  colorId: string;
  vendorName: string;
  purchasePrice: string;
  uom: string;
  hir3: string;
  hir5: string;
  cvGroup: string;
  lastPurchaseYear: string;
  closingStock: string;
  qtyReserve: string;
}

export interface ArchiveImage {
  id: string;
  url: string; 
  timestamp: number;
}

export interface ArchiveEntry {
  id: string;
  code: string;
  userName: string;
  images: ArchiveImage[];
  timestamp: number;
  lookupData?: ExcelRow;
  description?: string;
}

export interface PendingEntry {
  id: string;
  url: string;
}

export type ThemeType = 'indigo' | 'dark' | 'emerald' | 'cyber';

export interface UserAccount {
  id: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UserSession {
  name: string;
  role: 'admin' | 'user';
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}
