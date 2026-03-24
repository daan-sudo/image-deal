<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@renderer/stores/uiStore'
import { useImageStore } from '@renderer/stores/imageStore'
import { useTagStore } from '@renderer/stores/tagStore'
import { useGroupStore } from '@renderer/stores/groupStore'
import { ImageStatus } from '@renderer/types'
import StarRating from '@renderer/components/common/StarRating.vue'

const uiStore = useUiStore()
const imageStore = useImageStore()
const tagStore = useTagStore()
const groupStore = useGroupStore()

const image = computed(() => uiStore.activeImage)

function formatSize(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1048576).toFixed(1) + 'MB'
}

function formatDate(ts: number): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('zh-CN')
}

function setStatus(status: ImageStatus): void {
  if (image.value) {
    imageStore.setImageStatus(image.value.id, status)
  }
}

function setRating(rating: number): void {
  if (image.value) {
    imageStore.setImageRating(image.value.id, rating)
  }
}

function toggleTag(tagId: string): void {
  if (!image.value) return
  if (image.value.tags.includes(tagId)) {
    imageStore.removeTagFromImage(image.value.id, tagId)
  } else {
    imageStore.addTagToImage(image.value.id, tagId)
  }
}

function setGroup(groupId: string | null): void {
  if (image.value) {
    imageStore.setImageGroup(image.value.id, groupId)
  }
}

let noteTimer: ReturnType<typeof setTimeout> | null = null
function updateNote(e: Event): void {
  if (!image.value) return
  const value = (e.target as HTMLTextAreaElement).value
  if (noteTimer) clearTimeout(noteTimer)
  noteTimer = setTimeout(() => {
    if (image.value) {
      imageStore.setImageNote(image.value.id, value)
    }
  }, 500)
}
</script>

<template>
  <aside v-if="image" class="detail-panel">
    <!-- 预览图 -->
    <div class="detail-preview" @click="uiStore.openPreview(image.id)">
      <img
        v-if="image.thumbnailDataUrl"
        :src="image.thumbnailDataUrl"
        :alt="image.fileName"
        class="preview-img"
      />
    </div>

    <!-- 文件信息 -->
    <div class="detail-section">
      <div class="detail-title truncate">{{ image.fileName }}</div>
      <div class="detail-meta">
        <div class="meta-row">
          <span class="meta-label">尺寸</span>
          <span class="meta-value">
            {{ image.width ? `${image.width} × ${image.height}` : '—' }}
          </span>
        </div>
        <div class="meta-row">
          <span class="meta-label">大小</span>
          <span class="meta-value">{{ formatSize(image.fileSize) }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">格式</span>
          <span class="meta-value">{{ image.format.toUpperCase() }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">修改时间</span>
          <span class="meta-value">{{ formatDate(image.modifiedTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 快速标记 -->
    <div class="detail-section">
      <div class="section-label">标记</div>
      <div class="status-buttons">
        <button
          class="status-btn approved"
          :class="{ active: image.status === ImageStatus.Approved }"
          @click="setStatus(ImageStatus.Approved)"
          title="通过 (A)"
        >
          ✓ 通过
        </button>
        <button
          class="status-btn rejected"
          :class="{ active: image.status === ImageStatus.Rejected }"
          @click="setStatus(ImageStatus.Rejected)"
          title="淘汰 (D)"
        >
          ✕ 淘汰
        </button>
        <button
          class="status-btn pending"
          :class="{ active: image.status === ImageStatus.Pending }"
          @click="setStatus(ImageStatus.Pending)"
          title="待定 (S)"
        >
          ? 待定
        </button>
      </div>
    </div>

    <!-- 评分 -->
    <div class="detail-section">
      <div class="section-label">评分</div>
      <StarRating :rating="image.rating" @update="setRating" />
    </div>

    <!-- 标签 -->
    <div class="detail-section">
      <div class="section-label">标签</div>
      <div class="tag-list">
        <button
          v-for="tag in tagStore.tags"
          :key="tag.id"
          class="tag-chip"
          :class="{ active: image.tags.includes(tag.id) }"
          :style="{
            '--tag-color': tag.color,
            borderColor: image.tags.includes(tag.id) ? tag.color : 'var(--border-color)'
          }"
          @click="toggleTag(tag.id)"
        >
          <span class="tag-dot" :style="{ background: tag.color }"></span>
          {{ tag.name }}
        </button>
        <span v-if="tagStore.tags.length === 0" class="empty-hint">
          在左侧栏创建标签
        </span>
      </div>
    </div>

    <!-- 分组 -->
    <div class="detail-section">
      <div class="section-label">分组</div>
      <select
        class="group-select"
        :value="image.groupId || ''"
        @change="setGroup(($event.target as HTMLSelectElement).value || null)"
      >
        <option value="">未分组</option>
        <option v-for="group in groupStore.groups" :key="group.id" :value="group.id">
          {{ group.name }}
        </option>
      </select>
    </div>

    <!-- 备注 -->
    <div class="detail-section">
      <div class="section-label">备注</div>
      <textarea
        class="note-input"
        :value="image.note"
        placeholder="添加评审备注..."
        rows="3"
        @input="updateNote"
      ></textarea>
    </div>
  </aside>
</template>

<style scoped>
.detail-panel {
  width: var(--detail-panel-width);
  height: 100%;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  flex-shrink: 0;
}

.detail-preview {
  width: 100%;
  aspect-ratio: 4/3;
  background: var(--bg-tertiary);
  cursor: pointer;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.detail-section {
  padding: var(--sp-md) var(--sp-lg);
  border-bottom: 1px solid var(--divider);
}

.detail-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--sp-sm);
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.meta-label {
  color: var(--text-muted);
}

.meta-value {
  color: var(--text-secondary);
}

.section-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--sp-sm);
}

.status-buttons {
  display: flex;
  gap: var(--sp-xs);
}

.status-btn {
  flex: 1;
  padding: 6px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.status-btn:hover {
  border-color: var(--border-light);
}

.status-btn.approved.active {
  background: rgba(78, 203, 113, 0.15);
  border-color: var(--status-approved);
  color: var(--status-approved);
}

.status-btn.rejected.active {
  background: rgba(255, 82, 82, 0.15);
  border-color: var(--status-rejected);
  color: var(--status-rejected);
}

.status-btn.pending.active {
  background: rgba(255, 167, 38, 0.15);
  border-color: var(--status-pending);
  color: var(--status-pending);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-xs);
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.tag-chip.active {
  background: rgba(108, 99, 255, 0.1);
  color: var(--text-primary);
}

.tag-chip:hover {
  border-color: var(--border-light);
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.empty-hint {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.group-select {
  width: 100%;
  padding: 6px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.group-select:hover {
  border-color: var(--accent-primary);
}

.note-input {
  width: 100%;
  padding: var(--sp-sm);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
}

.note-input:focus {
  border-color: var(--accent-primary);
}

.note-input::placeholder {
  color: var(--text-muted);
}
</style>
