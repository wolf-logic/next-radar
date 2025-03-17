"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

export async function getRadar(userSlug, radarSlug) {
  const user = await prisma.user.findUnique({
    where: { slug: userSlug },
    select: { id: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const radar = await prisma.radar.findFirst({
    where: {
      slug: radarSlug,
      OR: [
        { createdBy: user.id },
        {
          users: {
            some: {
              userId: user.id
            }
          }
        }
      ]
    }
  });

  if (!radar) {
    throw new Error("Radar not found");
  }

  return radar;
}

export async function getRadarData(userSlug, radarSlug) {
  const user = await prisma.user.findUnique({
    where: { slug: userSlug },
    select: { id: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const radar = await prisma.radar.findFirst({
    where: {
      slug: radarSlug,
      OR: [
        { createdBy: user.id },
        {
          users: {
            some: {
              userId: user.id
            }
          }
        }
      ]
    },
    select: {
      quadrantNE: true,
      quadrantNW: true,
      quadrantSE: true,
      quadrantSW: true,
      ring1: true,
      ring2: true,
      ring3: true,
      ring4: true,
      entries: {
        select: {
          id: true,
          name: true,
          ring: true,
          quadrant: true,
          status: true,
          description: true
        }
      }
    }
  });

  if (!radar) {
    return {
      entries: [
        {
          name: "Example Technology",
          ring: "Hold",
          quadrant: "Tools",
          status: "New",
          description: "<p>This is an example entry...</p>"
        }
      ],
      quadrants: ["Tools", "Techniques", "Platforms", "Languages & Frameworks"],
      rings: ["Adopt", "Trial", "Assess", "Hold"]
    };
  }

  // Create rings array from radar record, filtering out null values
  const rings = [radar.ring1, radar.ring2, radar.ring3].concat(radar.ring4 ? [radar.ring4] : []);

  // Create ring mapping for translating numeric values to names
  const ringMap = {
    1: radar.ring1,
    2: radar.ring2,
    3: radar.ring3,
    4: radar.ring4
  };

  // Map the entries with both quadrant and ring names
  const mappedEntries = radar.entries.map(entry => ({
    ...entry,
    quadrant:
      {
        ne: radar.quadrantNE,
        nw: radar.quadrantNW,
        se: radar.quadrantSE,
        sw: radar.quadrantSW
      }[entry.quadrant.toLowerCase()] || entry.quadrant,
    ring: ringMap[entry.ring] || entry.ring,
    // Ensure we preserve the entry ID for linking purposes
    id: entry.id
  }));

  // Filter out any empty quadrants
  const quadrants = [radar.quadrantNW, radar.quadrantSW, radar.quadrantNE, radar.quadrantSE]
    .filter(quadrant => quadrant && quadrant.trim() !== '');

  return {
    entries: mappedEntries,
    quadrants,
    rings
  };
}

export async function createRadar(formData) {
  const { userId } = await auth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { slug: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const name = formData.get("name");
  const quadrantNE = formData.get("quadrantNE") || "";
  const quadrantNW = formData.get("quadrantNW") || "";
  const quadrantSE = formData.get("quadrantSE") || "";
  const quadrantSW = formData.get("quadrantSW") || "";
  const ring1 = formData.get("ring1") || null;
  const ring2 = formData.get("ring2") || null;
  const ring3 = formData.get("ring3") || null;
  const ring4 = formData.get("ring4") || null;

  // Generate a slug from the name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Check if a radar with this slug already exists for this user
  const existingRadar = await prisma.radar.findFirst({
    where: {
      slug,
      createdBy: userId
    }
  });

  if (existingRadar) {
    throw new Error("A radar with this name already exists");
  }

  const radar = await prisma.radar.create({
    data: {
      name,
      slug,
      quadrantNE,
      quadrantNW,
      quadrantSE,
      quadrantSW,
      ring1,
      ring2,
      ring3,
      ring4,
      createdBy: userId
    }
  });

  // Log the creation
  await createAuditLog(
    'radar',
    radar.id,
    'create',
    {
      name,
      slug,
      quadrantNE,
      quadrantNW,
      quadrantSE,
      quadrantSW,
      ring1,
      ring2,
      ring3,
      ring4
    },
    userId
  );

  redirect(`/${user.slug}/${slug}`);
}

/**
 * Get all radars where the user is a member through RadarUser
 * @param userId {string}
 * @returns {Promise<*>}
 */
export async function getUserRadars(userId) {
  const radars = await prisma.radar.findMany({
    where: {
      OR: [
        { createdBy: userId },
        {
          users: {
            some: {
              userId: userId
            }
          }
        }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      dateUpdated: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return radars.map(radar => ({
    id: radar.id,
    name: radar.name,
    slug: radar.slug
  }));
}

export async function updateRadar(formData, radarSlug) {
  const { userId } = await auth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { slug: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Find the radar and verify ownership/permissions
  const radar = await prisma.radar.findFirst({
    where: {
      slug: radarSlug,
      OR: [
        { createdBy: userId },
        {
          users: {
            some: {
              userId: userId
            }
          }
        }
      ]
    }
  });

  if (!radar) {
    throw new Error("Radar not found or access denied");
  }

  const name = formData.get("name");
  const quadrantNE = formData.get("quadrantNE") || "";
  const quadrantNW = formData.get("quadrantNW") || "";
  const quadrantSE = formData.get("quadrantSE") || "";
  const quadrantSW = formData.get("quadrantSW") || "";
  const ring1 = formData.get("ring1") || null;
  const ring2 = formData.get("ring2") || null;
  const ring3 = formData.get("ring3") || null;
  const ring4 = formData.get("ring4") || null;

  // Get the current state before update
  const currentRadar = await prisma.radar.findUnique({
    where: { id: radar.id },
    select: {
      name: true,
      quadrantNE: true,
      quadrantNW: true,
      quadrantSE: true,
      quadrantSW: true,
      ring1: true,
      ring2: true,
      ring3: true,
      ring4: true
    }
  });

  const updatedRadar = await prisma.radar.update({
    where: { id: radar.id },
    data: {
      name,
      quadrantNE,
      quadrantNW,
      quadrantSE,
      quadrantSW,
      ring1,
      ring2,
      ring3,
      ring4
    }
  });

  // Compare and log changes
  const changes = {};
  const newState = {
    name,
    quadrantNE,
    quadrantNW,
    quadrantSE,
    quadrantSW,
    ring1,
    ring2,
    ring3,
    ring4
  };

  for (const [key, newValue] of Object.entries(newState)) {
    if (currentRadar[key] !== newValue) {
      changes[key] = {
        from: currentRadar[key],
        to: newValue
      };
    }
  }

  if (Object.keys(changes).length > 0) {
    await createAuditLog('radar', radar.id, 'update', changes, userId);
  }

  redirect(`/${user.slug}/${radarSlug}`);
}

export async function deleteRadar(userSlug, radarSlug) {
  // Get the authenticated user's ID
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Authentication required");
  }

  // Find the user by slug to verify permissions
  const user = await prisma.user.findFirst({
    where: { slug: userSlug },
    select: { id: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Find the radar and verify ownership/permissions
  const radar = await prisma.radar.findFirst({
    where: {
      slug: radarSlug,
      OR: [
        { createdBy: userId },
        {
          users: {
            some: {
              userId: userId
            }
          }
        }
      ]
    },
    select: { id: true, createdBy: true }
  });

  if (!radar) {
    throw new Error("Radar not found or access denied");
  }

  // Only the creator can delete the radar
  if (radar.createdBy !== userId) {
    throw new Error("Only the radar creator can delete it");
  }

  // Delete the radar and all associated records in a transaction
  // Get the current state before deletion for audit log
  const radarToDelete = await prisma.radar.findUnique({
    where: { id: radar.id },
    select: {
      name: true,
      quadrantNE: true,
      quadrantNW: true,
      quadrantSE: true,
      quadrantSW: true,
      ring1: true,
      ring2: true,
      ring3: true,
      ring4: true
    }
  });

  await prisma.$transaction([
    // Delete all radar entries
    prisma.radarEntry.deleteMany({
      where: { radarId: radar.id }
    }),
    // Delete all radar user permissions
    prisma.radarUser.deleteMany({
      where: { radarId: radar.id }
    }),
    // Delete the radar itself
    prisma.radar.delete({
      where: { id: radar.id }
    }),
    // Create audit log
    prisma.auditLog.create({
      data: {
        entityType: 'radar',
        entityId: radar.id,
        action: 'delete',
        changes: radarToDelete,
        userId
      }
    })
  ]);

  // Redirect to the user's profile page
  redirect("/");
}
