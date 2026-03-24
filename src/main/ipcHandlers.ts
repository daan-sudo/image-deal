import { ipcMain, dialog, BrowserWindow } from 'electron'
import { scanDirectory, readFileAsDataUrl, copyFilesToDirectory } from './fileService'

export function registerIpcHandlers(): void {
  // 选择目录
  ipcMain.handle('select-directory', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // 扫描目录中的图片
  ipcMain.handle('scan-directory', async (_event, dirPath: string) => {
    try {
      const files = scanDirectory(dirPath)
      return { success: true, files }
    } catch (error) {
      return { success: false, files: [], error: String(error) }
    }
  })

  // 读取文件为 DataURL
  ipcMain.handle('read-file-as-dataurl', async (_event, filePath: string) => {
    try {
      const dataUrl = readFileAsDataUrl(filePath)
      return { success: true, dataUrl }
    } catch (error) {
      return { success: false, dataUrl: '', error: String(error) }
    }
  })

  // 选择导出目录
  ipcMain.handle('select-export-dir', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // 导出文件
  ipcMain.handle(
    'export-files',
    async (_event, filePaths: string[], targetDir: string) => {
      try {
        const result = copyFilesToDirectory(filePaths, targetDir)
        return { success: true, ...result }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    }
  )

  // 选择文件（多选图片）
  ipcMain.handle('select-files', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif']
        }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths
  })
}
