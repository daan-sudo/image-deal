import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 文件操作 API
const api = {
  // 选择目录
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),

  // 扫描目录
  scanDirectory: (
    dirPath: string
  ): Promise<{
    success: boolean
    files: Array<{
      fileName: string
      filePath: string
      fileSize: number
      modifiedTime: number
      format: string
    }>
  }> => ipcRenderer.invoke('scan-directory', dirPath),

  // 读取文件为 DataURL
  readFileAsDataUrl: (
    filePath: string
  ): Promise<{ success: boolean; dataUrl: string }> =>
    ipcRenderer.invoke('read-file-as-dataurl', filePath),

  // 选择导出目录
  selectExportDir: (): Promise<string | null> => ipcRenderer.invoke('select-export-dir'),

  // 导出文件
  exportFiles: (
    filePaths: string[],
    targetDir: string
  ): Promise<{ success: boolean; success_count?: number; failed?: number }> =>
    ipcRenderer.invoke('export-files', filePaths, targetDir),

  // 选择文件
  selectFiles: (): Promise<string[] | null> => ipcRenderer.invoke('select-files')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
