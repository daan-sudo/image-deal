<script setup lang="ts">
import { useUiStore } from '@renderer/stores/uiStore'
import ImageCard from './ImageCard.vue'

const uiStore = useUiStore()

function handleClick(id: string, event: MouseEvent): void {
  uiStore.selectImage(id, event.metaKey || event.ctrlKey || event.shiftKey)
}

function handleDblClick(id: string): void {
  uiStore.openPreview(id)
}
</script>

<template>
  <div class="grid-view" :style="{ '--columns': uiStore.gridColumns }">
    <ImageCard
      v-for="image in uiStore.filteredAndSortedImages"
      :key="image.id"
      :image="image"
      :selected="uiStore.selectedImageIds.has(image.id)"
      :active="uiStore.activeImageId === image.id"
      @click="handleClick(image.id, $event)"
      @dblclick="handleDblClick(image.id)"
    />
  </div>
</template>

<style scoped>
.grid-view {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: var(--sp-sm);
  padding: var(--sp-md);
  overflow-y: auto;
  height: 100%;
  align-content: start;
}
</style>
