
export interface ArchiveImage {
  id: string;
  url: string; // Base64 or Blob URL
  timestamp: number;
}

export interface ArchiveEntry {
  id: string;
  code: string;
  userName: string;
  images: ArchiveImage[];
  timestamp: number;
  description?: string;
}

export interface PendingEntry {
  id: string;
  url: string;
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}
