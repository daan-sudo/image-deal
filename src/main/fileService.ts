import { readdirSync, statSync, readFileSync } from 'fs'
import { join, extname, basename } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const SUPPORTED_FORMATS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
  '.gif',
  '.bmp',
  '.avif'
])

export interface ScannedFile {
  fileName: string
  filePath: string
  fileSize: number
  modifiedTime: number
  format: string
}

/**
 * 递归扫描目录，获取所有支持格式的图片文件
 */
export function scanDirectory(dirPath: string): ScannedFile[] {
  const results: ScannedFile[] = []

  function scan(currentPath: string): void {
    try {
      const entries = readdirSync(currentPath, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name)
        if (entry.isDirectory()) {
          // 跳过隐藏目录
          if (!entry.name.startsWith('.')) {
            scan(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase()
          if (SUPPORTED_FORMATS.has(ext)) {
            try {
              const stat = statSync(fullPath)
              results.push({
                fileName: entry.name,
                filePath: fullPath,
                fileSize: stat.size,
                modifiedTime: stat.mtimeMs,
                format: ext.slice(1)
              })
            } catch {
              // Skip files we can't stat
            }
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  scan(dirPath)
  return results
}

/**
 * 读取文件并返回 data URL
 */
export function readFileAsDataUrl(filePath: string): string {
  const ext = extname(filePath).toLowerCase().slice(1)
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    bmp: 'image/bmp',
    avif: 'image/avif'
  }
  const mime = mimeMap[ext] || 'image/png'
  const buffer = readFileSync(filePath)
  const base64 = buffer.toString('base64')
  return `data:${mime};base64,${base64}`
}

/**
 * 复制文件到目标目录
 */
export function copyFilesToDirectory(
  filePaths: string[],
  targetDir: string
): { success: number; failed: number } {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  let success = 0
  let failed = 0

  for (const filePath of filePaths) {
    try {
      const fileName = basename(filePath)
      const targetPath = join(targetDir, fileName)
      copyFileSync(filePath, targetPath)
      success++
    } catch {
      failed++
    }
  }

  return { success, failed }
}
