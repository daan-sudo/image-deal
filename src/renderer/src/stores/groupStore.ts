import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Group } from '@renderer/types'
import * as dbOps from '@renderer/db'

export const useGroupStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])

  async function loadFromDB(): Promise<void> {
    groups.value = await dbOps.getAllGroups()
  }

  async function createGroup(name: string, description: string = ''): Promise<Group> {
    const group: Group = {
      id: uuidv4(),
      name,
      description,
      createdTime: Date.now()
    }
    await dbOps.addGroup(group)
    groups.value.push(group)
    return group
  }

  async function updateGroup(id: string, changes: Partial<Group>): Promise<void> {
    await dbOps.updateGroup(id, changes)
    const idx = groups.value.findIndex((g) => g.id === id)
    if (idx >= 0) {
      groups.value[idx] = { ...groups.value[idx], ...changes }
    }
  }

  async function removeGroup(id: string): Promise<void> {
    await dbOps.deleteGroup(id)
    groups.value = groups.value.filter((g) => g.id !== id)
  }

  function getGroupById(id: string): Group | undefined {
    return groups.value.find((g) => g.id === id)
  }

  return {
    groups,
    loadFromDB,
    createGroup,
    updateGroup,
    removeGroup,
    getGroupById
  }
})
