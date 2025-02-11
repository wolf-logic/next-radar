import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ContextActionsPortal from "@/components/custom/context-actions-portal";
import { NotFoundMessage } from "@/components/custom/not-found-message";
import { RadarEntryForm } from "@/components/custom/radar-entry-form";

async function getEntryWithRadar(entryId) {
  return prisma.radarEntry.findUnique({
    where: {
      id: entryId
    },
    include: {
      radar: true
    }
  });
}

export default async function Page({ params }) {
  const requestParams = await params;
  const entry = await getEntryWithRadar(requestParams["entryId"]);

  if (!entry) {
    return <NotFoundMessage />;
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
        <RadarEntryForm entry={entry} ringOptions={ringOptions} quadrantOptions={quadrantOptions} />
      </div>
    </>
  );
}
