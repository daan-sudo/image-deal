import { onMounted, onUnmounted } from 'vue'
import { useImageStore } from '@renderer/stores/imageStore'
import { useUiStore } from '@renderer/stores/uiStore'
import { ImageStatus } from '@renderer/types'

export function useKeyboard(): void {
  const imageStore = useImageStore()
  const uiStore = useUiStore()

  function handleKeydown(e: KeyboardEvent): void {
    // 如果焦点在输入框中，不处理快捷键
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    const isMeta = e.metaKey || e.ctrlKey

    switch (e.key) {
      // 导航
      case 'ArrowLeft':
        e.preventDefault()
        uiStore.navigateImage('prev')
        break
      case 'ArrowRight':
        e.preventDefault()
        uiStore.navigateImage('next')
        break

      // 标记
      case 'a':
      case 'A':
        if (!isMeta) {
          e.preventDefault()
          if (uiStore.activeImageId) {
            imageStore.setImageStatus(uiStore.activeImageId, ImageStatus.Approved)
          }
        } else {
          e.preventDefault()
          uiStore.selectAll()
        }
        break
      case 'd':
      case 'D':
        if (!isMeta) {
          e.preventDefault()
          if (uiStore.activeImageId) {
            imageStore.setImageStatus(uiStore.activeImageId, ImageStatus.Rejected)
          }
        }
        break
      case 's':
      case 'S':
        if (!isMeta) {
          e.preventDefault()
          if (uiStore.activeImageId) {
            imageStore.setImageStatus(uiStore.activeImageId, ImageStatus.Pending)
          }
        }
        break

      // 评分
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        if (!isMeta) {
          e.preventDefault()
          if (uiStore.activeImageId) {
            imageStore.setImageRating(uiStore.activeImageId, parseInt(e.key))
          }
        }
        break
      case '0':
        if (!isMeta) {
          e.preventDefault()
          if (uiStore.activeImageId) {
            imageStore.setImageRating(uiStore.activeImageId, 0)
          }
        }
        break

      // 预览
      case ' ':
        e.preventDefault()
        if (uiStore.showPreview) {
          uiStore.closePreview()
        } else if (uiStore.activeImageId) {
          uiStore.openPreview(uiStore.activeImageId)
        }
        break

      // 删除
      case 'Delete':
      case 'Backspace':
        if (!isMeta) {
          e.preventDefault()
          const selected = [...uiStore.selectedImageIds]
          if (selected.length > 0) {
            imageStore.removeImages(selected)
            uiStore.clearSelection()
          }
        }
        break

      // 退出
      case 'Escape':
        if (uiStore.showPreview) {
          uiStore.closePreview()
        } else {
          uiStore.clearSelection()
        }
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
