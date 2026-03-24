import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  ImageStatus,
  SortField,
  SortOrder,
  type ImageItem
} from '@renderer/types'
import * as dbOps from '@renderer/db'

export const useImageStore = defineStore('images', () => {
  const images = ref<ImageItem[]>([])
  const loading = ref(false)
  const importProgress = ref(0)

  // 加载所有图片（从 IndexedDB）
  async function loadFromDB(): Promise<void> {
    images.value = await dbOps.getAllImages()
  }

  // 导入图片
  async function importImages(
    files: Array<{
      fileName: string
      filePath: string
      fileSize: number
      modifiedTime: number
      format: string
    }>
  ): Promise<void> {
    loading.value = true
    importProgress.value = 0
    const newImages: ImageItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // 检查是否已导入
      const exists = images.value.some((img) => img.filePath === file.filePath)
      if (exists) {
        importProgress.value = ((i + 1) / files.length) * 100
        continue
      }

      // 读取图片获取宽高
      let width = 0
      let height = 0
      let thumbnailDataUrl = ''

      try {
        const result = await window.api.readFileAsDataUrl(file.filePath)
        if (result.success) {
          // 使用 Image 对象获取宽高和生成缩略图
          const dimensions = await getImageDimensions(result.dataUrl)
          width = dimensions.width
          height = dimensions.height
          thumbnailDataUrl = await generateThumbnail(result.dataUrl, 300)
        }
      } catch {
        // 如果读取失败，继续，设置默认值
      }

      const imageItem: ImageItem = {
        id: uuidv4(),
        fileName: file.fileName,
        filePath: file.filePath,
        fileSize: file.fileSize,
        width,
        height,
        format: file.format,
        modifiedTime: file.modifiedTime,
        importedTime: Date.now(),
        thumbnailDataUrl,
        status: ImageStatus.None,
        rating: 0,
        tags: [],
        groupId: null,
        note: ''
      }
      newImages.push(imageItem)
      importProgress.value = ((i + 1) / files.length) * 100
    }

    if (newImages.length > 0) {
      await dbOps.addImages(newImages)
      images.value.push(...newImages)
    }

    loading.value = false
    importProgress.value = 100
  }

  // 设置图片标记状态
  async function setImageStatus(id: string, status: ImageStatus): Promise<void> {
    const img = images.value.find((i) => i.id === id)
    if (img) {
      img.status = status
      await dbOps.updateImage(id, { status })
    }
  }

  // 设置图片评分
  async function setImageRating(id: string, rating: number): Promise<void> {
    const img = images.value.find((i) => i.id === id)
    if (img) {
      img.rating = rating
      await dbOps.updateImage(id, { rating })
    }
  }

  // 设置图片备注
  async function setImageNote(id: string, note: string): Promise<void> {
    const img = images.value.find((i) => i.id === id)
    if (img) {
      img.note = note
      await dbOps.updateImage(id, { note })
    }
  }

  // 添加标签到图片
  async function addTagToImage(imageId: string, tagId: string): Promise<void> {
    const img = images.value.find((i) => i.id === imageId)
    if (img && !img.tags.includes(tagId)) {
      img.tags.push(tagId)
      await dbOps.updateImage(imageId, { tags: [...img.tags] })
    }
  }

  // 移除图片标签
  async function removeTagFromImage(imageId: string, tagId: string): Promise<void> {
    const img = images.value.find((i) => i.id === imageId)
    if (img) {
      img.tags = img.tags.filter((t) => t !== tagId)
      await dbOps.updateImage(imageId, { tags: [...img.tags] })
    }
  }

  // 设置图片分组
  async function setImageGroup(imageId: string, groupId: string | null): Promise<void> {
    const img = images.value.find((i) => i.id === imageId)
    if (img) {
      img.groupId = groupId
      await dbOps.updateImage(imageId, { groupId })
    }
  }

  // 批量设置状态
  async function batchSetStatus(ids: string[], status: ImageStatus): Promise<void> {
    for (const id of ids) {
      await setImageStatus(id, status)
    }
  }

  // 批量设置分组
  async function batchSetGroup(ids: string[], groupId: string | null): Promise<void> {
    for (const id of ids) {
      await setImageGroup(id, groupId)
    }
  }

  // 删除图片
  async function removeImages(ids: string[]): Promise<void> {
    await dbOps.deleteImages(ids)
    images.value = images.value.filter((img) => !ids.includes(img.id))
  }

  // 清空所有图片
  async function clearAll(): Promise<void> {
    await dbOps.clearAllImages()
    images.value = []
  }

  // 获取排序后的图片
  function getSortedImages(
    items: ImageItem[],
    field: SortField,
    order: SortOrder
  ): ImageItem[] {
    const sorted = [...items].sort((a, b) => {
      let cmp = 0
      switch (field) {
        case SortField.FileName:
          cmp = a.fileName.localeCompare(b.fileName)
          break
        case SortField.FileSize:
          cmp = a.fileSize - b.fileSize
          break
        case SortField.ModifiedTime:
          cmp = a.modifiedTime - b.modifiedTime
          break
        case SortField.ImportedTime:
          cmp = a.importedTime - b.importedTime
          break
        case SortField.Rating:
          cmp = a.rating - b.rating
          break
      }
      return order === SortOrder.Asc ? cmp : -cmp
    })
    return sorted
  }

  // 统计数量
  const totalCount = computed(() => images.value.length)
  const approvedCount = computed(
    () => images.value.filter((i) => i.status === ImageStatus.Approved).length
  )
  const rejectedCount = computed(
    () => images.value.filter((i) => i.status === ImageStatus.Rejected).length
  )
  const pendingCount = computed(
    () => images.value.filter((i) => i.status === ImageStatus.Pending).length
  )
  const unmarkedCount = computed(
    () => images.value.filter((i) => i.status === ImageStatus.None).length
  )

  return {
    images,
    loading,
    importProgress,
    totalCount,
    approvedCount,
    rejectedCount,
    pendingCount,
    unmarkedCount,
    loadFromDB,
    importImages,
    setImageStatus,
    setImageRating,
    setImageNote,
    addTagToImage,
    removeTagFromImage,
    setImageGroup,
    batchSetStatus,
    batchSetGroup,
    removeImages,
    clearAll,
    getSortedImages
  }
})

// ===== 辅助函数 =====

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve({ width: 0, height: 0 })
    img.src = dataUrl
  })
}

function generateThumbnail(dataUrl: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => resolve('')
    img.src = dataUrl
  })
}
