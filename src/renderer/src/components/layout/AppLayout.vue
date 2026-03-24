<script setup lang="ts">
import { useImageImport } from '@renderer/composables/useImageImport'
import { useUiStore } from '@renderer/stores/uiStore'
import { useImageStore } from '@renderer/stores/imageStore'
import { ViewMode } from '@renderer/types'
import TopToolbar from '@renderer/components/toolbar/TopToolbar.vue'
import Sidebar from '@renderer/components/sidebar/Sidebar.vue'
import GridView from '@renderer/components/gallery/GridView.vue'
import ListView from '@renderer/components/gallery/ListView.vue'
import CompareView from '@renderer/components/compare/CompareView.vue'
import DetailPanel from '@renderer/components/detail/DetailPanel.vue'
import ImagePreview from '@renderer/components/preview/ImagePreview.vue'
import DropZone from '@renderer/components/common/DropZone.vue'

const uiStore = useUiStore()
const imageStore = useImageStore()
const { importFromDrop } = useImageImport()

function handleDragOver(e: DragEvent): void {
  e.preventDefault()
  uiStore.showImportDropzone = true
}

function handleDragLeave(e: DragEvent): void {
  // Only hide dropzone if leaving the app area
  const related = e.relatedTarget as HTMLElement
  if (!related || !document.getElementById('app-layout')?.contains(related)) {
    uiStore.showImportDropzone = false
  }
}

async function handleDrop(e: DragEvent): Promise<void> {
  uiStore.showImportDropzone = false
  await importFromDrop(e)
}
</script>

<template>
  <div
    id="app-layout"
    class="app-layout"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <TopToolbar />
    <div class="app-body">
      <Sidebar />
      <main class="main-content">
        <!-- 没有图片时显示空状态 -->
        <div v-if="imageStore.totalCount === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <h2>开始使用图片工作台</h2>
          <p>拖拽图片或文件夹到此处，或点击上方「导入」按钮</p>
          <div class="empty-shortcuts">
            <div class="shortcut-hint">
              <kbd>A</kbd> 通过
              <kbd>D</kbd> 淘汰
              <kbd>S</kbd> 待定
              <kbd>Space</kbd> 预览
            </div>
          </div>
        </div>

        <!-- 网格视图 -->
        <GridView v-else-if="uiStore.viewMode === ViewMode.Grid" />

        <!-- 列表视图 -->
        <ListView v-else-if="uiStore.viewMode === ViewMode.List" />

        <!-- 对比视图 -->
        <CompareView v-else-if="uiStore.viewMode === ViewMode.Compare" />
      </main>

      <!-- 右侧详情面板 -->
      <transition name="slide">
        <DetailPanel v-if="uiStore.showDetailPanel && uiStore.activeImage" />
      </transition>
    </div>

    <!-- 大图预览 -->
    <ImagePreview v-if="uiStore.showPreview" />

    <!-- 拖拽导入提示 -->
    <DropZone v-if="uiStore.showImportDropzone" />

    <!-- 导入进度条 -->
    <div v-if="imageStore.loading" class="import-progress-bar">
      <div class="progress-fill" :style="{ width: imageStore.importProgress + '%' }"></div>
      <span class="progress-text">导入中... {{ Math.round(imageStore.importProgress) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-primary);
  position: relative;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--sp-lg);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state p {
  font-size: var(--font-size-md);
  color: var(--text-muted);
}

.empty-shortcuts {
  margin-top: var(--sp-xl);
}

.shortcut-hint {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.shortcut-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.import-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  z-index: 100;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--accent-gradient);
  opacity: 0.3;
  transition: width 0.3s ease;
}

.progress-text {
  position: relative;
  padding-left: var(--sp-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
</style>
