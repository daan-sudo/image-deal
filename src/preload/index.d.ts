import { ElectronAPI } from '@electron-toolkit/preload'

interface FileInfo {
  fileName: string
  filePath: string
  fileSize: number
  modifiedTime: number
  format: string
}

interface ApiType {
  selectDirectory: () => Promise<string | null>
  scanDirectory: (dirPath: string) => Promise<{ success: boolean; files: FileInfo[] }>
  readFileAsDataUrl: (filePath: string) => Promise<{ success: boolean; dataUrl: string }>
  selectExportDir: () => Promise<string | null>
  exportFiles: (
    filePaths: string[],
    targetDir: string
  ) => Promise<{ success: boolean; success_count?: number; failed?: number }>
  selectFiles: () => Promise<string[] | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ApiType
  }
}
