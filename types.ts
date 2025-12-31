
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
  description?: string;
}

export interface PendingEntry {
  id: string;
  url: string;
}

export type ThemeType = 'indigo' | 'dark' | 'emerald' | 'cyber';

export interface UserSession {
  name: string;
  role: 'admin' | 'user';
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}
