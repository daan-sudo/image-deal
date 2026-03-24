<script setup lang="ts">
</script>

<template>
  <div class="dropzone-overlay">
    <div class="dropzone-content">
      <div class="dropzone-icon">📥</div>
      <div class="dropzone-text">松开鼠标导入图片</div>
      <div class="dropzone-hint">支持 JPG / PNG / WebP / SVG / GIF / BMP 格式</div>
    </div>
  </div>
</template>

<style scoped>
.dropzone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(108, 99, 255, 0.15);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-2xl);
  border: 3px dashed var(--accent-primary);
  border-radius: var(--radius-xl);
  background: rgba(108, 99, 255, 0.08);
  animation: pulse 2s ease infinite;
}

.dropzone-icon {
  font-size: 56px;
  animation: bounce 1s ease infinite;
}

.dropzone-text {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.dropzone-hint {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
