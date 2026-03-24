import Dexie, { type EntityTable } from 'dexie'
import type { ImageItem, Tag, Group } from '@renderer/types'

class ImageWorkbenchDB extends Dexie {
  images!: EntityTable<ImageItem, 'id'>
  tags!: EntityTable<Tag, 'id'>
  groups!: EntityTable<Group, 'id'>

  constructor() {
    super('ImageWorkbenchDB')
    this.version(1).stores({
      images: 'id, fileName, fileSize, modifiedTime, importedTime, status, rating, groupId',
      tags: 'id, name',
      groups: 'id, name, createdTime'
    })
  }
}

export const db = new ImageWorkbenchDB()

// ===== Images CRUD =====
export async function addImages(images: ImageItem[]): Promise<void> {
  await db.images.bulkPut(images)
}

export async function updateImage(id: string, changes: Partial<ImageItem>): Promise<void> {
  await db.images.update(id, changes)
}

export async function deleteImage(id: string): Promise<void> {
  await db.images.delete(id)
}

export async function deleteImages(ids: string[]): Promise<void> {
  await db.images.bulkDelete(ids)
}

export async function getAllImages(): Promise<ImageItem[]> {
  return await db.images.toArray()
}

export async function clearAllImages(): Promise<void> {
  await db.images.clear()
}

// ===== Tags CRUD =====
export async function addTag(tag: Tag): Promise<void> {
  await db.tags.put(tag)
}

export async function deleteTag(id: string): Promise<void> {
  await db.tags.delete(id)
  // Remove tag from all images
  const images = await db.images.filter((img) => img.tags.includes(id)).toArray()
  for (const img of images) {
    await db.images.update(img.id, { tags: img.tags.filter((t) => t !== id) })
  }
}

export async function getAllTags(): Promise<Tag[]> {
  return await db.tags.toArray()
}

// ===== Groups CRUD =====
export async function addGroup(group: Group): Promise<void> {
  await db.groups.put(group)
}

export async function updateGroup(id: string, changes: Partial<Group>): Promise<void> {
  await db.groups.update(id, changes)
}

export async function deleteGroup(id: string): Promise<void> {
  await db.groups.delete(id)
  // Unassign images from this group
  const images = await db.images.where('groupId').equals(id).toArray()
  for (const img of images) {
    await db.images.update(img.id, { groupId: null })
  }
}

export async function getAllGroups(): Promise<Group[]> {
  return await db.groups.toArray()
}
