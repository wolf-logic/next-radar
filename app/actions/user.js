"use server";

import { prisma } from "@/lib/prisma";

export async function getUser(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId
    }
  });
}

/**
 * Check if a user has access to the radar
 * @param userId {string}
 * @param radarSlug {string}
 * @returns {Promise<boolean>}
 */
export async function userHasAccessToRadar(userId, radarSlug) {
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

  return radar !== null;
}
