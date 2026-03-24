<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@renderer/stores/uiStore'
import { useImageStore } from '@renderer/stores/imageStore'
import { useTagStore } from '@renderer/stores/tagStore'
import { useGroupStore } from '@renderer/stores/groupStore'

const uiStore = useUiStore()
const imageStore = useImageStore()
const tagStore = useTagStore()
const groupStore = useGroupStore()

const showNewTag = ref(false)
const newTagName = ref('')
const newTagColor = ref('#6c63ff')
const showNewGroup = ref(false)
const newGroupName = ref('')

const tagColors = [
  '#6c63ff', '#00d2ff', '#4ecb71', '#ffa726', '#ff5252',
  '#e040fb', '#18ffff', '#ff6e40', '#eeff41', '#69f0ae'
]

async function createTag(): Promise<void> {
  if (!newTagName.value.trim()) return
  await tagStore.createTag(newTagName.value.trim(), newTagColor.value)
  newTagName.value = ''
  showNewTag.value = false
}

async function createGroup(): Promise<void> {
  if (!newGroupName.value.trim()) return
  await groupStore.createGroup(newGroupName.value.trim())
  newGroupName.value = ''
  showNewGroup.value = false
}
</script>

<template>
  <aside class="sidebar">
    <!-- 全部 -->
    <div class="sidebar-section">
      <button
        class="sidebar-item"
        :class="{ active: uiStore.sidebarActiveItem === 'all' }"
        @click="uiStore.setSidebarFilter('all')"
      >
        <span class="item-icon">🖼️</span>
        <span class="item-label">全部图片</span>
        <span class="item-count">{{ imageStore.totalCount }}</span>
      </button>
    </div>

    <!-- 标记状态 -->
    <div class="sidebar-section">
      <div class="section-title">标记状态</div>
      <button
        class="sidebar-item"
        :class="{ active: uiStore.sidebarActiveItem === 'approved' }"
        @click="uiStore.setSidebarFilter('approved')"
      >
        <span class="item-icon status-icon approved">✓</span>
        <span class="item-label">通过</span>
        <span class="item-count">{{ imageStore.approvedCount }}</span>
      </button>
      <button
        class="sidebar-item"
        :class="{ active: uiStore.sidebarActiveItem === 'rejected' }"
        @click="uiStore.setSidebarFilter('rejected')"
      >
        <span class="item-icon status-icon rejected">✕</span>
        <span class="item-label">淘汰</span>
        <span class="item-count">{{ imageStore.rejectedCount }}</span>
      </button>
      <button
        class="sidebar-item"
        :class="{ active: uiStore.sidebarActiveItem === 'pending' }"
        @click="uiStore.setSidebarFilter('pending')"
      >
        <span class="item-icon status-icon pending">?</span>
        <span class="item-label">待定</span>
        <span class="item-count">{{ imageStore.pendingCount }}</span>
      </button>
      <button
        class="sidebar-item"
        :class="{ active: uiStore.sidebarActiveItem === 'none' }"
        @click="uiStore.setSidebarFilter('none')"
      >
        <span class="item-icon status-icon none">○</span>
        <span class="item-label">未标记</span>
        <span class="item-count">{{ imageStore.unmarkedCount }}</span>
      </button>
    </div>

    <!-- 标签 -->
    <div class="sidebar-section">
      <div class="section-title">
        <span>标签</span>
        <button class="section-action" @click="showNewTag = !showNewTag" title="新建标签">+</button>
      </div>

      <!-- 新建标签表单 -->
      <div v-if="showNewTag" class="inline-form">
        <div class="color-picker">
          <button
            v-for="color in tagColors"
            :key="color"
            class="color-dot"
            :class="{ active: newTagColor === color }"
            :style="{ background: color }"
            @click="newTagColor = color"
          />
        </div>
        <div class="form-row">
          <input
            v-model="newTagName"
            class="inline-input"
            placeholder="标签名称"
            @keydown.enter="createTag"
          />
          <button class="inline-btn" @click="createTag">✓</button>
        </div>
      </div>

      <div
        v-for="tag in tagStore.tags"
        :key="tag.id"
        class="sidebar-item"
        :class="{ active: uiStore.sidebarActiveItem === `tag-${tag.id}` }"
        @click="uiStore.setTagFilter(tag.id)"
      >
        <span class="tag-dot" :style="{ background: tag.color }"></span>
        <span class="item-label">{{ tag.name }}</span>
        <button class="item-delete" @click.stop="tagStore.removeTag(tag.id)" title="删除标签">
          ×
        </button>
      </div>
    </div>

    <!-- 分组 -->
    <div class="sidebar-section">
      <div class="section-title">
        <span>分组</span>
        <button class="section-action" @click="showNewGroup = !showNewGroup" title="新建分组">
          +
        </button>
      </div>

      <!-- 新建分组表单 -->
      <div v-if="showNewGroup" class="inline-form">
        <div class="form-row">
          <input
            v-model="newGroupName"
            class="inline-input"
            placeholder="分组名称"
            @keydown.enter="createGroup"
          />
          <button class="inline-btn" @click="createGroup">✓</button>
        </div>
      </div>

      <div
        v-for="group in groupStore.groups"
        :key="group.id"
        class="sidebar-item"
        :class="{ active: uiStore.sidebarActiveItem === `group-${group.id}` }"
        @click="uiStore.setGroupFilter(group.id)"
      >
        <span class="item-icon">📁</span>
        <span class="item-label">{{ group.name }}</span>
        <button
          class="item-delete"
          @click.stop="groupStore.removeGroup(group.id)"
          title="删除分组"
        >
          ×
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: var(--sp-sm) 0;
}

.sidebar-section {
  padding: var(--sp-xs) 0;
}

.sidebar-section + .sidebar-section {
  border-top: 1px solid var(--divider);
  margin-top: var(--sp-xs);
  padding-top: var(--sp-sm);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-xs) var(--sp-lg);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-action {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 16px;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.section-action:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 7px var(--sp-lg);
  gap: var(--sp-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  position: relative;
}

.sidebar-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--bg-active);
  color: var(--text-primary);
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--accent-primary);
}

.item-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.status-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
}

.status-icon.approved { background: var(--status-approved); }
.status-icon.rejected { background: var(--status-rejected); }
.status-icon.pending { background: var(--status-pending); }
.status-icon.none {
  background: transparent;
  border: 1.5px solid var(--text-muted);
  color: var(--text-muted);
}

.item-label {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  min-width: 20px;
  text-align: right;
}

.item-delete {
  opacity: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.sidebar-item:hover .item-delete {
  opacity: 1;
}

.item-delete:hover {
  background: var(--status-rejected);
  color: white;
}

.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Inline form */
.inline-form {
  padding: var(--sp-xs) var(--sp-lg);
}

.form-row {
  display: flex;
  gap: var(--sp-xs);
}

.inline-input {
  flex: 1;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.inline-input:focus {
  border-color: var(--accent-primary);
}

.inline-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--accent-primary);
  color: white;
  font-size: 14px;
}

.inline-btn:hover {
  background: var(--accent-primary-hover);
}

.color-picker {
  display: flex;
  gap: 4px;
  margin-bottom: var(--sp-xs);
  flex-wrap: wrap;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.color-dot.active {
  border-color: white;
  transform: scale(1.2);
}
</style>
