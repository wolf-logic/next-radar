'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma'

async function checkRadarAccess(radarId, userId) {
  const radar = await prisma.radar.findUnique({
    where: {
      id: radarId
    },
    select: {
      createdBy: true,
      users: {
        where: {
          userId: userId
        }
      }
    }
  });

  if (!radar) {
    throw new Error("Radar not found");
  }

  const hasAccess = radar.createdBy === userId || radar.users.length > 0;
  if (!hasAccess) {
    throw new Error("You don't have access to this radar");
  }

  return true;
}

export async function createEntry(radarId, data) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if user has access to the radar
    await checkRadarAccess(radarId, userId);

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
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // First get the entry to find its radar
    const entry = await prisma.radarEntry.findUnique({
      where: { id: entryId },
      select: { radarId: true }
    });

    if (!entry) {
      throw new Error("Entry not found");
    }

    // Check if user has access to the radar
    await checkRadarAccess(entry.radarId, userId);

    const updatedEntry = await prisma.radarEntry.update({
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
    return { success: true, entry: updatedEntry }
  } catch (error) {
    console.error('Error updating entry:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteEntry(entryId) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // First get the entry to find its radar
    const entry = await prisma.radarEntry.findUnique({
      where: { id: entryId },
      select: { radarId: true }
    });

    if (!entry) {
      throw new Error("Entry not found");
    }

    // Check if user has access to the radar
    await checkRadarAccess(entry.radarId, userId);

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
