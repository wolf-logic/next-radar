import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const { userId } = await auth();
  const { userSlug, radarSlug } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userSlug || !radarSlug) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // First find the radar without checking access
  const radar = await prisma.radar.findFirst({
    where: {
      slug: radarSlug
    },
    select: {
      id: true,
      quadrantNE: true,
      quadrantNW: true,
      quadrantSE: true,
      quadrantSW: true,
      ring1: true,
      ring2: true,
      ring3: true,
      ring4: true,
      createdBy: true,
      users: {
        where: {
          userId: userId
        }
      }
    }
  });

  if (!radar) {
    return NextResponse.json({ error: "Radar not found" }, { status: 404 });
  }

  // Check if user has access (either creator or in RadarUser table)
  const hasAccess = radar.createdBy === userId || radar.users.length > 0;
  if (!hasAccess) {
    return NextResponse.json({ error: "You don't have access to this radar" }, { status: 401 });
  }

  // Extract query parameters
  const url = new URL(request.url);
  const start = parseInt(url.searchParams.get("start") || "0", 10);
  let size = parseInt(url.searchParams.get("size") || "10", 10);
  const sortingParam = url.searchParams.get("sorting") || "[]";

  // Limit the maximum page size to 200
  size = size <= 200 ? size : 200;

  try {
    const totalRowCount = await prisma.radarEntry.count({
      where: {
        radarId: radar.id
      }
    });

    const sorting = JSON.parse(sortingParam);

    // Check if we need custom sorting for quadrantName or ringName
    const needsCustomSort = sorting.some(sort => sort.id === "quadrantName" || sort.id === "ringName");

    if (!needsCustomSort) {
      // Use normal Prisma sorting for standard fields
      const orderBy = sorting.map(sortRule => ({
        [sortRule.id]: sortRule.desc ? "desc" : "asc"
      }));

      const data = await prisma.radarEntry.findMany({
        select: {
          id: true,
          radarId: true,
          name: true,
          quadrant: true,
          ring: true,
          status: true,
          description: true,
          dateCreated: true,
          dateUpdated: true
        },
        where: {
          radar: {
            id: radar.id
          }
        },
        orderBy,
        skip: start,
        take: size
      });

      // Add display names
      const adjustedData = data.map(entry => ({
        ...entry,
        quadrantName: getQuadrantName(entry.quadrant, radar),
        ringName: getRingName(entry.ring, radar)
      }));

      return NextResponse.json({
        data: adjustedData,
        meta: {
          totalRowCount,
          start,
          size,
          sorting: orderBy
        }
      });
    } else {
      // Get all data for custom sorting
      const data = await prisma.radarEntry.findMany({
        select: {
          id: true,
          radarId: true,
          name: true,
          quadrant: true,
          ring: true,
          status: true,
          description: true,
          dateCreated: true,
          dateUpdated: true
        },
        where: {
          radar: {
            id: radar.id
          }
        }
      });

      // Add display names
      let adjustedData = data.map(entry => ({
        ...entry,
        quadrantName: getQuadrantName(entry.quadrant, radar),
        ringName: getRingName(entry.ring, radar)
      }));

      // Apply custom sorting
      adjustedData = adjustedData.sort((a, b) => {
        for (const sort of sorting) {
          const desc = sort.desc ? -1 : 1;
          if (a[sort.id] < b[sort.id]) return -1 * desc;
          if (a[sort.id] > b[sort.id]) return 1 * desc;
        }
        return 0;
      });

      // Apply pagination after sorting
      const paginatedData = adjustedData.slice(start, start + size);

      return NextResponse.json({
        data: paginatedData,
        meta: {
          totalRowCount: data.length,
          start,
          size,
          sorting
        }
      });
    }
  } catch (error) {
    console.error("Caught error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper functions
function getQuadrantName(quadrant, radar) {
  const mapping = {
    ne: radar.quadrantNE,
    nw: radar.quadrantNW,
    se: radar.quadrantSE,
    sw: radar.quadrantSW
  };
  return mapping[quadrant] || quadrant;
}

function getRingName(ring, radar) {
  const mapping = {
    1: radar.ring1,
    2: radar.ring2,
    3: radar.ring3,
    4: radar.ring4
  };
  return mapping[ring] || ring.toString();
}
