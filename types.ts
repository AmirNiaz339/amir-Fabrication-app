
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
}

export interface PendingEntry {
  id: string;
  url: string;
}

export type SortOption = 'newest' | 'oldest' | 'barcode-asc' | 'barcode-desc' | 'vendor-asc' | 'product-asc';

export type ThemeType = 
  | 'indigo-light' | 'indigo-dark' | 'emerald-light' | 'emerald-dark' 
  | 'rose-light' | 'rose-dark' | 'amber-light' | 'amber-dark' 
  | 'violet-light' | 'violet-dark' | 'cyan-light' | 'cyan-dark'
  | 'orange-light' | 'orange-dark' | 'lime-light' | 'lime-dark'
  | 'fuchsia-light' | 'fuchsia-dark' | 'sky-light' | 'sky-dark'
  | 'zinc-light' | 'zinc-dark' | 'slate-light' | 'slate-dark';

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
