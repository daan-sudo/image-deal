<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUiStore } from '@renderer/stores/uiStore'
import { useImageStore } from '@renderer/stores/imageStore'

const uiStore = useUiStore()
const imageStore = useImageStore()

const scale = ref(1)
const syncPan = ref(true)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const compareImages = computed(() => {
  return uiStore.compareImageIds
    .map((id) => imageStore.images.find((img) => img.id === id))
    .filter(Boolean)
})

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

function resetView(): void {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const statusMap = {
  approved: { label: '通过', class: 'approved' },
  rejected: { label: '淘汰', class: 'rejected' },
  pending: { label: '待定', class: 'pending' },
  none: { label: '未标记', class: 'none' }
}
</script>

<template>
  <div class="compare-view">
    <!-- 工具栏 -->
    <div class="compare-toolbar">
      <div class="compare-info">
        对比模式 · {{ compareImages.length }} 张图片
      </div>
      <div class="compare-actions">
        <label class="sync-toggle">
          <input type="checkbox" v-model="syncPan" />
          同步缩放
        </label>
        <button class="compare-btn" @click="scale = Math.min(10, scale + 0.25)">+</button>
        <span class="zoom-value">{{ Math.round(scale * 100) }}%</span>
        <button class="compare-btn" @click="scale = Math.max(0.1, scale - 0.25)">-</button>
        <button class="compare-btn" @click="resetView">重置</button>
        <button class="compare-btn exit-btn" @click="uiStore.exitCompareMode()">退出对比</button>
      </div>
    </div>

    <!-- 对比区域 -->
    <div
      class="compare-grid"
      :style="{ '--count': compareImages.length }"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <div
        v-for="image in compareImages"
        :key="image!.id"
        class="compare-cell"
      >
        <div class="cell-image-container">
          <img
            v-if="image!.thumbnailDataUrl"
            :src="image!.thumbnailDataUrl"
            :alt="image!.fileName"
            class="cell-image"
            :style="
              syncPan
                ? {
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }
                : { transform: `scale(${scale})` }
            "
            draggable="false"
          />
        </div>
        <div class="cell-footer">
          <span class="cell-name truncate">{{ image!.fileName }}</span>
          <span
            v-if="image!.status !== 'none'"
            class="cell-status"
            :class="statusMap[image!.status].class"
          >
            {{ statusMap[image!.status].label }}
          </span>
          <span v-if="image!.rating > 0" class="cell-rating">
            <span v-for="i in image!.rating" :key="i">★</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compare-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.compare-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-sm) var(--sp-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.compare-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.compare-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.sync-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.sync-toggle input {
  cursor: pointer;
}

.compare-btn {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.compare-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.exit-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  margin-left: var(--sp-sm);
}

.zoom-value {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  min-width: 36px;
  text-align: center;
  font-family: var(--font-mono);
}

.compare-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(var(--count, 2), 1fr);
  gap: 2px;
  overflow: hidden;
}

.compare-cell {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.cell-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cell-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
}

.cell-footer {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-xs) var(--sp-sm);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.cell-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cell-status {
  font-size: var(--font-size-xs);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.cell-status.approved { background: rgba(78, 203, 113, 0.15); color: var(--status-approved); }
.cell-status.rejected { background: rgba(255, 82, 82, 0.15); color: var(--status-rejected); }
.cell-status.pending { background: rgba(255, 167, 38, 0.15); color: var(--status-pending); }

.cell-rating {
  color: var(--star-active);
  font-size: var(--font-size-xs);
}
</style>
