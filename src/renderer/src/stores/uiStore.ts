import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  ViewMode,
  SortField,
  SortOrder,
  ImageStatus,
  type ImageItem
} from '@renderer/types'
import { useImageStore } from './imageStore'

export const useUiStore = defineStore('ui', () => {
  // 视图模式
  const viewMode = ref<ViewMode>(ViewMode.Grid)

  // 排序
  const sortField = ref<SortField>(SortField.ImportedTime)
  const sortOrder = ref<SortOrder>(SortOrder.Desc)

  // 筛选
  const filterStatus = ref<ImageStatus | 'all'>('all')
  const filterTagId = ref<string | null>(null)
  const filterGroupId = ref<string | null>(null)

  // 选中
  const selectedImageIds = ref<Set<string>>(new Set())
  const activeImageId = ref<string | null>(null)

  // 对比
  const compareImageIds = ref<string[]>([])

  // UI 状态
  const showDetailPanel = ref(true)
  const showPreview = ref(false)
  const previewImageId = ref<string | null>(null)
  const gridColumns = ref(4)
  const showImportDropzone = ref(false)

  // 侧栏活跃项
  const sidebarActiveItem = ref<string>('all')

  // 经过筛选和排序的图片列表
  const filteredAndSortedImages = computed(() => {
    const imageStore = useImageStore()
    let items = [...imageStore.images]

    // 筛选
    if (filterStatus.value !== 'all') {
      items = items.filter((img) => img.status === filterStatus.value)
    }
    if (filterTagId.value) {
      items = items.filter((img) => img.tags.includes(filterTagId.value!))
    }
    if (filterGroupId.value) {
      items = items.filter((img) => img.groupId === filterGroupId.value)
    }

    // 排序
    items = imageStore.getSortedImages(items, sortField.value, sortOrder.value)

    return items
  })

  // 当前活跃图片
  const activeImage = computed((): ImageItem | null => {
    if (!activeImageId.value) return null
    const imageStore = useImageStore()
    return imageStore.images.find((i) => i.id === activeImageId.value) || null
  })

  // 选择操作
  function selectImage(id: string, multi = false): void {
    if (multi) {
      if (selectedImageIds.value.has(id)) {
        selectedImageIds.value.delete(id)
        if (activeImageId.value === id) {
          activeImageId.value = selectedImageIds.value.size > 0
            ? [...selectedImageIds.value][0]
            : null
        }
      } else {
        selectedImageIds.value.add(id)
        activeImageId.value = id
      }
    } else {
      selectedImageIds.value.clear()
      selectedImageIds.value.add(id)
      activeImageId.value = id
    }
  }

  function selectAll(): void {
    const ids = filteredAndSortedImages.value.map((img) => img.id)
    selectedImageIds.value = new Set(ids)
    if (ids.length > 0) {
      activeImageId.value = ids[0]
    }
  }

  function clearSelection(): void {
    selectedImageIds.value.clear()
    activeImageId.value = null
  }

  // 导航
  function navigateImage(direction: 'prev' | 'next'): void {
    const list = filteredAndSortedImages.value
    if (list.length === 0) return
    const currentIndex = list.findIndex((img) => img.id === activeImageId.value)
    let newIndex: number
    if (currentIndex === -1) {
      newIndex = 0
    } else if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1
    } else {
      newIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0
    }
    selectImage(list[newIndex].id)
  }

  // 预览
  function openPreview(id: string): void {
    previewImageId.value = id
    showPreview.value = true
  }

  function closePreview(): void {
    showPreview.value = false
    previewImageId.value = null
  }

  // 对比
  function enterCompareMode(): void {
    compareImageIds.value = [...selectedImageIds.value].slice(0, 4)
    viewMode.value = ViewMode.Compare
  }

  function exitCompareMode(): void {
    compareImageIds.value = []
    viewMode.value = ViewMode.Grid
  }

  // 侧栏筛选
  function setSidebarFilter(item: string): void {
    sidebarActiveItem.value = item
    filterTagId.value = null
    filterGroupId.value = null

    switch (item) {
      case 'all':
        filterStatus.value = 'all'
        break
      case 'approved':
        filterStatus.value = ImageStatus.Approved
        break
      case 'rejected':
        filterStatus.value = ImageStatus.Rejected
        break
      case 'pending':
        filterStatus.value = ImageStatus.Pending
        break
      default:
        // Tag or Group filter - handled by caller
        filterStatus.value = 'all'
        break
    }
  }

  function setTagFilter(tagId: string | null): void {
    filterTagId.value = tagId
    filterGroupId.value = null
    filterStatus.value = 'all'
    sidebarActiveItem.value = tagId ? `tag-${tagId}` : 'all'
  }

  function setGroupFilter(groupId: string | null): void {
    filterGroupId.value = groupId
    filterTagId.value = null
    filterStatus.value = 'all'
    sidebarActiveItem.value = groupId ? `group-${groupId}` : 'all'
  }

  return {
    viewMode,
    sortField,
    sortOrder,
    filterStatus,
    filterTagId,
    filterGroupId,
    selectedImageIds,
    activeImageId,
    compareImageIds,
    showDetailPanel,
    showPreview,
    previewImageId,
    gridColumns,
    showImportDropzone,
    sidebarActiveItem,
    filteredAndSortedImages,
    activeImage,
    selectImage,
    selectAll,
    clearSelection,
    navigateImage,
    openPreview,
    closePreview,
    enterCompareMode,
    exitCompareMode,
    setSidebarFilter,
    setTagFilter,
    setGroupFilter
  }
})
