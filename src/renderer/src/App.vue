<script setup lang="ts">
import { onMounted } from 'vue'
import { useImageStore } from '@renderer/stores/imageStore'
import { useTagStore } from '@renderer/stores/tagStore'
import { useGroupStore } from '@renderer/stores/groupStore'
import { useKeyboard } from '@renderer/composables/useKeyboard'

const imageStore = useImageStore()
const tagStore = useTagStore()
const groupStore = useGroupStore()

// 注册键盘快捷键
useKeyboard()

// 启动时从 IndexedDB 加载数据
onMounted(async () => {
  await Promise.all([imageStore.loadFromDB(), tagStore.loadFromDB(), groupStore.loadFromDB()])
})
</script>

<template>
  <router-view />
</template>

<style scoped>
/* App-level styles handled by main.css */
</style>
