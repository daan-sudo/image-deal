<script setup lang="ts">
import { useUiStore } from '@renderer/stores/uiStore'
import { useImageStore } from '@renderer/stores/imageStore'
import { useImageImport } from '@renderer/composables/useImageImport'
import { ViewMode, SortField, SortOrder } from '@renderer/types'

const uiStore = useUiStore()
const imageStore = useImageStore()
const { importFromDirectory, importFromFiles } = useImageImport()

function toggleSortOrder(): void {
  uiStore.sortOrder = uiStore.sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc
}

async function handleExport(): Promise<void> {
  const approvedImages = imageStore.images.filter((img) => img.status === 'approved')
  if (approvedImages.length === 0) {
    alert('没有标记为「通过」的图片可导出')
    return
  }
  const targetDir = await window.api.selectExportDir()
  if (!targetDir) return

  const filePaths = approvedImages.map((img) => img.filePath)
  const result = await window.api.exportFiles(filePaths, targetDir)
  if (result.success) {
    alert(`成功导出 ${approvedImages.length} 张图片`)
  }
}

function enterCompare(): void {
  if (uiStore.selectedImageIds.size >= 2) {
    uiStore.enterCompareMode()
  } else {
    alert('请至少选择 2 张图片进行对比')
  }
}

async function handleDelete(): Promise<void> {
  const selected = [...uiStore.selectedImageIds]
  if (selected.length === 0) return
  const confirmed = confirm(`确定要删除选中的 ${selected.length} 张图片吗？\n（仅从列表中移除，不会删除原始文件）`)
  if (!confirmed) return
  await imageStore.removeImages(selected)
  uiStore.clearSelection()
}
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <div class="app-brand">
        <span class="brand-icon">🖼️</span>
        <span class="brand-text">图片评审工作台</span>
      </div>
    </div>

    <div class="toolbar-center">
      <!-- 导入 -->
      <div class="toolbar-group">
        <button class="toolbar-btn primary" @click="importFromDirectory" title="导入文件夹">
          <span class="btn-icon">📂</span>
          <span>导入文件夹</span>
        </button>
        <button class="toolbar-btn" @click="importFromFiles" title="导入文件">
          <span class="btn-icon">📄</span>
          <span>导入文件</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 视图切换 -->
      <div class="toolbar-group view-toggle">
        <button
          class="toolbar-btn icon-btn"
          :class="{ active: uiStore.viewMode === ViewMode.Grid }"
          @click="uiStore.viewMode = ViewMode.Grid"
          title="网格视图"
        >
          ⊞
        </button>
        <button
          class="toolbar-btn icon-btn"
          :class="{ active: uiStore.viewMode === ViewMode.List }"
          @click="uiStore.viewMode = ViewMode.List"
          title="列表视图"
        >
          ☰
        </button>
        <button
          class="toolbar-btn icon-btn"
          :class="{ active: uiStore.viewMode === ViewMode.Compare }"
          @click="enterCompare"
          title="对比视图"
        >
          ⧉
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 网格列数调节 -->
      <div v-if="uiStore.viewMode === ViewMode.Grid" class="toolbar-group">
        <label class="slider-label">列数</label>
        <input
          type="range"
          class="grid-slider"
          min="2"
          max="8"
          :value="uiStore.gridColumns"
          @input="uiStore.gridColumns = parseInt(($event.target as HTMLInputElement).value)"
        />
        <span class="slider-value">{{ uiStore.gridColumns }}</span>
      </div>

      <div class="toolbar-divider"></div>

      <!-- 排序 -->
      <div class="toolbar-group">
        <select
          class="toolbar-select"
          :value="uiStore.sortField"
          @change="uiStore.sortField = ($event.target as HTMLSelectElement).value as SortField"
        >
          <option :value="SortField.ImportedTime">导入时间</option>
          <option :value="SortField.FileName">文件名</option>
          <option :value="SortField.FileSize">文件大小</option>
          <option :value="SortField.ModifiedTime">修改时间</option>
          <option :value="SortField.Rating">评分</option>
        </select>
        <button class="toolbar-btn icon-btn" @click="toggleSortOrder" title="排序方向">
          {{ uiStore.sortOrder === SortOrder.Asc ? '↑' : '↓' }}
        </button>
      </div>
    </div>

    <div class="toolbar-right">
      <!-- 选中信息 -->
      <span v-if="uiStore.selectedImageIds.size > 0" class="selection-info">
        已选 {{ uiStore.selectedImageIds.size }} 张
      </span>

      <!-- 删除 -->
      <button
        v-if="uiStore.selectedImageIds.size > 0"
        class="toolbar-btn danger"
        @click="handleDelete"
        title="删除选中图片 (Delete)"
      >
        <span class="btn-icon">🗑️</span>
        <span>删除</span>
      </button>

      <!-- 导出 -->
      <button class="toolbar-btn" @click="handleExport" title="导出通过的图片">
        <span class="btn-icon">📤</span>
        <span>导出</span>
      </button>

      <!-- 详情面板切换 -->
      <button
        class="toolbar-btn icon-btn"
        :class="{ active: uiStore.showDetailPanel }"
        @click="uiStore.showDetailPanel = !uiStore.showDetailPanel"
        title="详情面板"
      >
        ℹ️
      </button>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--toolbar-height);
  padding: 0 var(--sp-md);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: var(--sp-md);
  -webkit-app-region: drag;
  flex-shrink: 0;
}

.toolbar * {
  -webkit-app-region: no-drag;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.toolbar-center {
  flex: 1;
  justify-content: center;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  -webkit-app-region: drag;
}

.brand-icon {
  font-size: 18px;
}

.brand-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 var(--sp-xs);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toolbar-btn.active {
  background: var(--accent-primary);
  color: white;
}

.toolbar-btn.primary {
  background: var(--accent-primary);
  color: white;
}

.toolbar-btn.primary:hover {
  background: var(--accent-primary-hover);
}

.toolbar-btn.danger {
  color: #ff5252;
}

.toolbar-btn.danger:hover {
  background: rgba(255, 82, 82, 0.12);
  color: #ff5252;
}

.icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  font-size: 16px;
}

.btn-icon {
  font-size: 14px;
}

.toolbar-select {
  padding: 5px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.toolbar-select:hover {
  border-color: var(--accent-primary);
}

.slider-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

.grid-slider {
  width: 60px;
  height: 4px;
  -webkit-appearance: none;
  background: var(--border-color);
  border-radius: 2px;
  cursor: pointer;
}

.grid-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-primary);
  cursor: pointer;
}

.slider-value {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  min-width: 16px;
  text-align: center;
}

.selection-info {
  font-size: var(--font-size-sm);
  color: var(--accent-secondary);
  padding: 4px 8px;
  background: rgba(0, 210, 255, 0.1);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.view-toggle {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 2px;
}

.view-toggle .toolbar-btn {
  border-radius: var(--radius-sm);
}
</style>
