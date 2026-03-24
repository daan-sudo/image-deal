<script setup lang="ts">
import { computed } from 'vue'
import type { ImageItem } from '@renderer/types'
import { ImageStatus } from '@renderer/types'

const props = defineProps<{
  image: ImageItem
  selected: boolean
  active: boolean
}>()

defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'dblclick'): void
}>()

const statusIcon = computed(() => {
  switch (props.image.status) {
    case ImageStatus.Approved:
      return { icon: '✓', class: 'approved' }
    case ImageStatus.Rejected:
      return { icon: '✕', class: 'rejected' }
    case ImageStatus.Pending:
      return { icon: '?', class: 'pending' }
    default:
      return null
  }
})

function formatSize(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1048576).toFixed(1) + 'MB'
}
</script>

<template>
  <div
    class="image-card"
    :class="{ selected, active }"
    @click="$emit('click', $event)"
    @dblclick="$emit('dblclick')"
  >
    <div class="card-thumb">
      <img
        v-if="image.thumbnailDataUrl"
        :src="image.thumbnailDataUrl"
        :alt="image.fileName"
        loading="lazy"
      />
      <div v-else class="thumb-placeholder">🖼️</div>

      <!-- 状态角标 -->
      <div v-if="statusIcon" class="status-badge" :class="statusIcon.class">
        {{ statusIcon.icon }}
      </div>

      <!-- 评分 -->
      <div v-if="image.rating > 0" class="rating-badge">
        <span v-for="i in image.rating" :key="i" class="star">★</span>
      </div>

      <!-- 选中勾 -->
      <div v-if="selected" class="select-check">✓</div>
    </div>

    <div class="card-info">
      <div class="card-name truncate">{{ image.fileName }}</div>
      <div class="card-meta">
        <span v-if="image.width">{{ image.width }}×{{ image.height }}</span>
        <span>{{ formatSize(image.fileSize) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-card);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.image-card:hover {
  border-color: var(--border-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.image-card.selected {
  border-color: var(--accent-primary);
}

.image-card.active {
  border-color: var(--accent-secondary);
  box-shadow: var(--shadow-glow);
}

.card-thumb {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.card-thumb img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  opacity: 0.3;
}

.status-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  box-shadow: var(--shadow-sm);
}

.status-badge.approved { background: var(--status-approved); }
.status-badge.rejected { background: var(--status-rejected); }
.status-badge.pending { background: var(--status-pending); }

.rating-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: flex;
  gap: 1px;
}

.star {
  color: var(--star-active);
  font-size: 10px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.select-check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.card-info {
  padding: var(--sp-sm);
}

.card-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.card-meta {
  display: flex;
  gap: var(--sp-sm);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
</style>
