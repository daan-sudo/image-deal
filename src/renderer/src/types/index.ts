// ===== 枚举 =====

export enum ImageStatus {
  None = 'none',
  Approved = 'approved',
  Rejected = 'rejected',
  Pending = 'pending'
}

export enum ViewMode {
  Grid = 'grid',
  List = 'list',
  Compare = 'compare'
}

export enum SortField {
  FileName = 'fileName',
  FileSize = 'fileSize',
  ModifiedTime = 'modifiedTime',
  ImportedTime = 'importedTime',
  Rating = 'rating'
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type SidebarFilter = 'all' | ImageStatus | string // string for tag/group id

// ===== 核心数据模型 =====

export interface ImageItem {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  width: number
  height: number
  format: string
  modifiedTime: number
  importedTime: number
  thumbnailDataUrl: string
  status: ImageStatus
  rating: number
  tags: string[]
  groupId: string | null
  note: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Group {
  id: string
  name: string
  description: string
  createdTime: number
}

// ===== IPC 通信类型 =====

export interface FileInfo {
  fileName: string
  filePath: string
  fileSize: number
  modifiedTime: number
  format: string
}

export interface ScanResult {
  files: FileInfo[]
  totalCount: number
}
