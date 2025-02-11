'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function createEntry(radarId, data) {
  try {
    const entry = await prisma.radarEntry.create({
      data: {
        name: data.name,
        ring: parseInt(data.ring),
        quadrant: data.quadrant,
        status: data.status || "New",
        description: data.description,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        radarId: radarId
      },
    })

    revalidatePath('/[userSlug]/[radarSlug]/entries')
    return { success: true, entry }
  } catch (error) {
    console.error('Error creating entry:', error)
    return { success: false, error: error.message }
  }
}

export async function updateEntry(entryId, data) {
  try {
    const entry = await prisma.radarEntry.update({
      where: {
        id: entryId,
      },
      data: {
        name: data.name,
        ring: parseInt(data.ring),
        quadrant: data.quadrant,
        status: data.status,
        description: data.description,
        dateUpdated: new Date(),
      },
    })

    revalidatePath('/[userSlug]/[radarSlug]/entries')
    return { success: true, entry }
  } catch (error) {
    console.error('Error updating entry:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteEntry(entryId) {
  try {
    await prisma.radarEntry.delete({
      where: {
        id: entryId,
      },
    })

    revalidatePath('/[userSlug]/[radarSlug]/entries')
    return { success: true }
  } catch (error) {
    console.error('Error deleting entry:', error)
    return { success: false, error: error.message }
  }
}
