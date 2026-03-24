import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Tag } from '@renderer/types'
import * as dbOps from '@renderer/db'

export const useTagStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])

  async function loadFromDB(): Promise<void> {
    tags.value = await dbOps.getAllTags()
  }

  async function createTag(name: string, color: string): Promise<Tag> {
    const tag: Tag = {
      id: uuidv4(),
      name,
      color
    }
    await dbOps.addTag(tag)
    tags.value.push(tag)
    return tag
  }

  async function removeTag(id: string): Promise<void> {
    await dbOps.deleteTag(id)
    tags.value = tags.value.filter((t) => t.id !== id)
  }

  function getTagById(id: string): Tag | undefined {
    return tags.value.find((t) => t.id === id)
  }

  return {
    tags,
    loadFromDB,
    createTag,
    removeTag,
    getTagById
  }
})
