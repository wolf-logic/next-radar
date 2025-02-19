'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma'

async function createAuditLog(entityType, entityId, action, changes, userId) {
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      changes,
      userId
    }
  });
}

async function checkRadarAccess(radarId, userId, requireOwner = false) {
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

  const isOwner = radar.createdBy === userId;
  const hasAccess = isOwner || radar.users.length > 0;

  if (requireOwner && !isOwner) {
    throw new Error("Only the radar owner can perform this action");
  } else if (!hasAccess) {
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

    // Log the creation
    await createAuditLog(
      'entry',
      entry.id,
      'create',
      {
        name: data.name,
        ring: parseInt(data.ring),
        quadrant: data.quadrant,
        status: data.status || "New",
        description: data.description,
        radarId: radarId
      },
      userId
    )

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

    // Get current state before update
    const currentEntry = await prisma.radarEntry.findUnique({
      where: { id: entryId },
      select: {
        name: true,
        ring: true,
        quadrant: true,
        status: true,
        description: true
      }
    });

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

    // Compare and log changes
    const changes = {};
    const newState = {
      name: data.name,
      ring: parseInt(data.ring),
      quadrant: data.quadrant,
      status: data.status,
      description: data.description
    };

    for (const [key, newValue] of Object.entries(newState)) {
      if (currentEntry[key] !== newValue) {
        changes[key] = {
          from: currentEntry[key],
          to: newValue
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      await createAuditLog('entry', entryId, 'update', changes, userId);
    }

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

    // Check if user is the radar owner
    await checkRadarAccess(entry.radarId, userId, true);

    // Get current state before deletion
    const entryToDelete = await prisma.radarEntry.findUnique({
      where: { id: entryId },
      select: {
        name: true,
        ring: true,
        quadrant: true,
        status: true,
        description: true,
        radarId: true
      }
    });

    await prisma.radarEntry.delete({
      where: {
        id: entryId,
      },
    })

    // Log the deletion
    await createAuditLog('entry', entryId, 'delete', entryToDelete, userId);

    revalidatePath('/[userSlug]/[radarSlug]/entries')
    return { success: true }
  } catch (error) {
    console.error('Error deleting entry:', error)
    return { success: false, error: error.message }
  }
}
