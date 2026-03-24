<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUiStore } from '@renderer/stores/uiStore'
import { useImageStore } from '@renderer/stores/imageStore'
import { ImageStatus } from '@renderer/types'

const uiStore = useUiStore()
const imageStore = useImageStore()

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const imageUrl = ref('')

const currentImage = computed(() => {
  if (!uiStore.previewImageId) return null
  return imageStore.images.find((i) => i.id === uiStore.previewImageId) || null
})

// Load full resolution image
watch(
  () => uiStore.previewImageId,
  async (id) => {
    if (!id) return
    const img = imageStore.images.find((i) => i.id === id)
    if (!img) return
    // Try to load full resolution via file path
    try {
      const result = await window.api.readFileAsDataUrl(img.filePath)
      if (result.success) {
        imageUrl.value = result.dataUrl
      } else {
        imageUrl.value = img.thumbnailDataUrl
      }
    } catch {
      imageUrl.value = img.thumbnailDataUrl
    }
    // Reset transform
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  },
  { immediate: true }
)

function handleWheel(e: WheelEvent): void {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(0.1, Math.min(10, scale.value + delta))
}

function handleMouseDown(e: MouseEvent): void {
  if (e.button !== 0) return
  isDragging.value = true
  dragStart.value = { x: e.clientX - translateX.value, y: e.clientY - translateY.value }
}

function handleMouseMove(e: MouseEvent): void {
  if (!isDragging.value) return
  translateX.value = e.clientX - dragStart.value.x
  translateY.value = e.clientY - dragStart.value.y
}

function handleMouseUp(): void {
  isDragging.value = false
}

function handleKeydown(e: KeyboardEvent): void {
  switch (e.key) {
    case 'Escape':
    case ' ':
      e.preventDefault()
      uiStore.closePreview()
      break
    case 'ArrowLeft':
      e.preventDefault()
      navigatePreview('prev')
      break
    case 'ArrowRight':
      e.preventDefault()
      navigatePreview('next')
      break
    case 'a':
    case 'A':
      if (!e.metaKey && !e.ctrlKey && currentImage.value) {
        e.preventDefault()
        imageStore.setImageStatus(currentImage.value.id, ImageStatus.Approved)
      }
      break
    case 'd':
    case 'D':
      if (!e.metaKey && !e.ctrlKey && currentImage.value) {
        e.preventDefault()
        imageStore.setImageStatus(currentImage.value.id, ImageStatus.Rejected)
      }
      break
    case 's':
    case 'S':
      if (!e.metaKey && !e.ctrlKey && currentImage.value) {
        e.preventDefault()
        imageStore.setImageStatus(currentImage.value.id, ImageStatus.Pending)
      }
      break
  }
}

function navigatePreview(direction: 'prev' | 'next'): void {
  const list = uiStore.filteredAndSortedImages
  const currentIdx = list.findIndex((img) => img.id === uiStore.previewImageId)
  let newIdx: number
  if (direction === 'prev') {
    newIdx = currentIdx > 0 ? currentIdx - 1 : list.length - 1
  } else {
    newIdx = currentIdx < list.length - 1 ? currentIdx + 1 : 0
  }
  uiStore.previewImageId = list[newIdx].id
  uiStore.selectImage(list[newIdx].id)
}

const statusLabel = computed(() => {
  if (!currentImage.value) return null
  switch (currentImage.value.status) {
    case ImageStatus.Approved:
      return { icon: '✓', label: '通过', class: 'approved' }
    case ImageStatus.Rejected:
      return { icon: '✕', label: '淘汰', class: 'rejected' }
    case ImageStatus.Pending:
      return { icon: '?', label: '待定', class: 'pending' }
    default:
      return null
  }
})

const currentIndex = computed(() => {
  const list = uiStore.filteredAndSortedImages
  return list.findIndex((img) => img.id === uiStore.previewImageId)
})

const totalCount = computed(() => uiStore.filteredAndSortedImages.length)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="preview-overlay"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @wheel="handleWheel"
    @click.self="uiStore.closePreview()"
  >
    <!-- 顶栏 -->
    <div class="preview-header" @mousedown.stop>
      <div class="preview-info">
        <span class="preview-name">{{ currentImage?.fileName }}</span>
        <span class="preview-counter">{{ currentIndex + 1 }} / {{ totalCount }}</span>
        <span v-if="statusLabel" class="preview-status" :class="statusLabel.class">
          {{ statusLabel.icon }} {{ statusLabel.label }}
        </span>
      </div>
      <div class="preview-actions">
        <button class="preview-btn" @click="scale = Math.min(10, scale + 0.25)">+</button>
        <span class="zoom-value">{{ Math.round(scale * 100) }}%</span>
        <button class="preview-btn" @click="scale = Math.max(0.1, scale - 0.25)">-</button>
        <button class="preview-btn" @click="scale = 1; translateX = 0; translateY = 0">
          适应
        </button>
        <button class="preview-btn close-btn" @click="uiStore.closePreview()">✕</button>
      </div>
    </div>

    <!-- 图片 -->
    <div class="preview-image-container">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="currentImage?.fileName"
        class="preview-image"
        :style="{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
        draggable="false"
      />
    </div>

    <!-- 导航按钮 -->
    <button class="nav-btn nav-prev" @click.stop="navigatePreview('prev')">‹</button>
    <button class="nav-btn nav-next" @click.stop="navigatePreview('next')">›</button>

    <!-- 底部快捷操作 -->
    <div class="preview-footer" @mousedown.stop>
      <button
        class="action-btn approved"
        :class="{ active: currentImage?.status === ImageStatus.Approved }"
        @click="currentImage && imageStore.setImageStatus(currentImage.id, ImageStatus.Approved)"
      >
        ✓ 通过 <kbd>A</kbd>
      </button>
      <button
        class="action-btn pending"
        :class="{ active: currentImage?.status === ImageStatus.Pending }"
        @click="currentImage && imageStore.setImageStatus(currentImage.id, ImageStatus.Pending)"
      >
        ? 待定 <kbd>S</kbd>
      </button>
      <button
        class="action-btn rejected"
        :class="{ active: currentImage?.status === ImageStatus.Rejected }"
        @click="currentImage && imageStore.setImageStatus(currentImage.id, ImageStatus.Rejected)"
      >
        ✕ 淘汰 <kbd>D</kbd>
      </button>
    </div>
  </div>
</template>

<style scoped>
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-sm) var(--sp-lg);
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.preview-name {
  font-size: var(--font-size-md);
  color: white;
  font-weight: 500;
}

.preview-counter {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.preview-status {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.preview-status.approved { background: rgba(78, 203, 113, 0.2); color: var(--status-approved); }
.preview-status.rejected { background: rgba(255, 82, 82, 0.2); color: var(--status-rejected); }
.preview-status.pending { background: rgba(255, 167, 38, 0.2); color: var(--status-pending); }

.preview-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.preview-btn {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.preview-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.close-btn {
  font-size: 18px;
  margin-left: var(--sp-sm);
}

.zoom-value {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  min-width: 40px;
  text-align: center;
  font-family: var(--font-mono);
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  max-width: 90%;
  max-height: 85vh;
  object-fit: contain;
  transition: none;
  will-change: transform;
}

.nav-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  z-index: 10;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.nav-prev { left: var(--sp-md); }
.nav-next { right: var(--sp-md); }

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-md);
  padding: var(--sp-md);
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: 8px 20px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.action-btn kbd {
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
}

.action-btn:hover {
  border-color: var(--border-light);
  background: rgba(255, 255, 255, 0.05);
}

.action-btn.approved.active {
  background: rgba(78, 203, 113, 0.2);
  border-color: var(--status-approved);
  color: var(--status-approved);
}

.action-btn.rejected.active {
  background: rgba(255, 82, 82, 0.2);
  border-color: var(--status-rejected);
  color: var(--status-rejected);
}

.action-btn.pending.active {
  background: rgba(255, 167, 38, 0.2);
  border-color: var(--status-pending);
  color: var(--status-pending);
}
</style>
