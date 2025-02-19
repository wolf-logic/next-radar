import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ContextActionsPortal from "@/components/custom/context-actions-portal";
import { NotFoundMessage } from "@/components/custom/not-found-message";
import { NotAuthorisedMessage } from "@/components/custom/not-authorised-message";
import { RadarEntryForm } from "@/components/custom/radar-entry-form";

async function getEntryWithRadar(entryId, userId) {
  const entry = await prisma.radarEntry.findUnique({
    where: {
      id: entryId
    },
    include: {
      radar: {
        include: {
          users: {
            where: {
              userId: userId
            }
          }
        }
      }
    }
  });

  if (!entry) return null;

  // Check if user has access (either creator or in RadarUser table)
  const hasAccess = entry.radar.createdBy === userId || entry.radar.users.length > 0;
  if (!hasAccess) return 'unauthorized';

  return entry;
}

export default async function Page({ params }) {
  const { userId } = await auth();
  if (!userId) {
    return <NotAuthorisedMessage />;
  }

  const requestParams = await params;
  const entry = await getEntryWithRadar(requestParams["entryId"], userId);

  if (entry === null) {
    return <NotFoundMessage />;
  }

  if (entry === 'unauthorized') {
    return <NotAuthorisedMessage />;
  }

  const ringOptions = [
    { value: 1, label: entry.radar.ring1 },
    { value: 2, label: entry.radar.ring2 },
    { value: 3, label: entry.radar.ring3 },
    { value: 4, label: entry.radar.ring4 }
  ];

  const quadrantOptions = [
    { value: "ne", label: entry.radar.quadrantNE },
    { value: "nw", label: entry.radar.quadrantNW },
    { value: "se", label: entry.radar.quadrantSE },
    { value: "sw", label: entry.radar.quadrantSW }
  ];

  return (
    <>
      <Suspense fallback={null}>
        <ContextActionsPortal params={requestParams} />
      </Suspense>
      <div style={{ height: "60px", backgroundColor: "#edf1f3" }}></div>
      <div className="container mx-auto py-10">
        <h1 className="mb-8 text-2xl font-bold">Edit Radar Entry</h1>
        <RadarEntryForm 
          entry={entry} 
          ringOptions={ringOptions} 
          quadrantOptions={quadrantOptions} 
          isOwner={entry.radar.createdBy === userId}
        />
      </div>
    </>
  );
}
