import { ref } from 'vue'
import { useImageStore } from '@renderer/stores/imageStore'

export function useImageImport() {
  const imageStore = useImageStore()
  const importing = ref(false)

  // 通过文件夹选择导入
  async function importFromDirectory(): Promise<void> {
    const dirPath = await window.api.selectDirectory()
    if (!dirPath) return

    importing.value = true
    try {
      const result = await window.api.scanDirectory(dirPath)
      if (result.success && result.files.length > 0) {
        await imageStore.importImages(result.files)
      }
    } finally {
      importing.value = false
    }
  }

  // 通过拖拽导入
  async function importFromDrop(event: DragEvent): Promise<void> {
    event.preventDefault()
    event.stopPropagation()

    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return

    importing.value = true
    try {
      const fileList: Array<{
        fileName: string
        filePath: string
        fileSize: number
        modifiedTime: number
        format: string
      }> = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = (file as any).path as string
        if (!path) continue

        const ext = path.split('.').pop()?.toLowerCase() || ''
        const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif']

        if (supportedFormats.includes(ext)) {
          fileList.push({
            fileName: file.name,
            filePath: path,
            fileSize: file.size,
            modifiedTime: file.lastModified,
            format: ext
          })
        }
      }

      // 检查是否拖入的是文件夹
      if (fileList.length === 0 && files.length > 0) {
        // 尝试把所有 path 当做目录扫描
        for (let i = 0; i < files.length; i++) {
          const path = (files[i] as any).path as string
          if (!path) continue
          const result = await window.api.scanDirectory(path)
          if (result.success && result.files.length > 0) {
            await imageStore.importImages(result.files)
          }
        }
      } else if (fileList.length > 0) {
        await imageStore.importImages(fileList)
      }
    } finally {
      importing.value = false
    }
  }

  // 通过文件选择导入
  async function importFromFiles(): Promise<void> {
    const filePaths = await window.api.selectFiles()
    if (!filePaths || filePaths.length === 0) return

    importing.value = true
    try {
      const fileList = filePaths.map((fp) => {
        const parts = fp.split('/')
        const fileName = parts[parts.length - 1]
        const ext = fileName.split('.').pop()?.toLowerCase() || ''
        return {
          fileName,
          filePath: fp,
          fileSize: 0,
          modifiedTime: Date.now(),
          format: ext
        }
      })
      await imageStore.importImages(fileList)
    } finally {
      importing.value = false
    }
  }

  return {
    importing,
    importFromDirectory,
    importFromDrop,
    importFromFiles
  }
}
