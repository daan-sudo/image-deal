<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@renderer/stores/uiStore'
import { ImageStatus } from '@renderer/types'

const uiStore = useUiStore()

const statusLabel = {
  [ImageStatus.Approved]: { icon: '✓', label: '通过', class: 'approved' },
  [ImageStatus.Rejected]: { icon: '✕', label: '淘汰', class: 'rejected' },
  [ImageStatus.Pending]: { icon: '?', label: '待定', class: 'pending' },
  [ImageStatus.None]: { icon: '○', label: '未标记', class: 'none' }
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1048576).toFixed(1) + 'MB'
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const images = computed(() => uiStore.filteredAndSortedImages)
</script>

<template>
  <div class="list-view">
    <!-- 表头 -->
    <div class="list-header">
      <div class="col-thumb">缩略图</div>
      <div class="col-name">文件名</div>
      <div class="col-size">大小</div>
      <div class="col-dimensions">尺寸</div>
      <div class="col-status">状态</div>
      <div class="col-rating">评分</div>
      <div class="col-date">修改时间</div>
    </div>

    <!-- 列表项 -->
    <div
      v-for="image in images"
      :key="image.id"
      class="list-item"
      :class="{
        selected: uiStore.selectedImageIds.has(image.id),
        active: uiStore.activeImageId === image.id
      }"
      @click="uiStore.selectImage(image.id, $event.metaKey || $event.ctrlKey)"
      @dblclick="uiStore.openPreview(image.id)"
    >
      <div class="col-thumb">
        <img
          v-if="image.thumbnailDataUrl"
          :src="image.thumbnailDataUrl"
          :alt="image.fileName"
          class="list-thumb"
        />
        <div v-else class="thumb-placeholder">🖼️</div>
      </div>
      <div class="col-name truncate">{{ image.fileName }}</div>
      <div class="col-size">{{ formatSize(image.fileSize) }}</div>
      <div class="col-dimensions">
        <span v-if="image.width">{{ image.width }}×{{ image.height }}</span>
        <span v-else>—</span>
      </div>
      <div class="col-status">
        <span class="status-tag" :class="statusLabel[image.status].class">
          {{ statusLabel[image.status].icon }} {{ statusLabel[image.status].label }}
        </span>
      </div>
      <div class="col-rating">
        <span v-if="image.rating > 0" class="stars">
          <span v-for="i in image.rating" :key="i">★</span>
        </span>
        <span v-else class="no-rating">—</span>
      </div>
      <div class="col-date">{{ formatDate(image.modifiedTime) }}</div>
    </div>
  </div>
</template>

<style scoped>
.list-view {
  height: 100%;
  overflow-y: auto;
  font-size: var(--font-size-sm);
}

.list-header {
  display: flex;
  align-items: center;
  padding: var(--sp-sm) var(--sp-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.list-item {
  display: flex;
  align-items: center;
  padding: var(--sp-xs) var(--sp-md);
  border-bottom: 1px solid var(--divider);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.list-item:hover {
  background: var(--bg-hover);
}

.list-item.selected {
  background: rgba(108, 99, 255, 0.1);
}

.list-item.active {
  background: rgba(0, 210, 255, 0.08);
  border-left: 3px solid var(--accent-secondary);
}

.col-thumb {
  width: 50px;
  flex-shrink: 0;
  margin-right: var(--sp-sm);
}

.list-thumb {
  width: 40px;
  height: 30px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.thumb-placeholder {
  width: 40px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  font-size: 16px;
  opacity: 0.3;
}

.col-name { flex: 1; min-width: 0; }
.col-size { width: 70px; flex-shrink: 0; text-align: right; color: var(--text-muted); }
.col-dimensions { width: 100px; flex-shrink: 0; text-align: center; color: var(--text-muted); }
.col-status { width: 70px; flex-shrink: 0; text-align: center; }
.col-rating { width: 80px; flex-shrink: 0; text-align: center; }
.col-date { width: 130px; flex-shrink: 0; text-align: right; color: var(--text-muted); }

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.status-tag.approved { background: rgba(78, 203, 113, 0.15); color: var(--status-approved); }
.status-tag.rejected { background: rgba(255, 82, 82, 0.15); color: var(--status-rejected); }
.status-tag.pending { background: rgba(255, 167, 38, 0.15); color: var(--status-pending); }
.status-tag.none { color: var(--text-muted); }

.stars {
  color: var(--star-active);
  font-size: var(--font-size-xs);
}

.no-rating {
  color: var(--text-muted);
}
</style>
