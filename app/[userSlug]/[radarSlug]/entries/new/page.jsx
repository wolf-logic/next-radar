import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { RadarEntryForm } from "@/components/custom/radar-entry-form";
import { Suspense } from "react";
import ContextActionsPortal from "@/components/custom/context-actions-portal";

export default async function NewEntryPage({ params }) {
  const { userId } = await auth();
  const requestParams = await params;
  const { radarSlug } = requestParams;

  const radar = await prisma.radar.findFirst({
    where: {
      slug: radarSlug
    },
    include: {
      users: {
        where: {
          userId: userId
        }
      }
    }
  });

  if (!radar) {
    notFound();
  }

  // Check if user has access (either creator or in RadarUser table)
  const hasAccess = radar.createdBy === userId || radar.users.length > 0;
  if (!hasAccess) {
    notFound();
  }

  const ringOptions = [
    { value: 1, label: radar.ring1 },
    { value: 2, label: radar.ring2 },
    { value: 3, label: radar.ring3 },
    { value: 4, label: radar.ring4 }
  ];

  const quadrantOptions = [
    { value: "ne", label: radar.quadrantNE },
    { value: "nw", label: radar.quadrantNW },
    { value: "se", label: radar.quadrantSE },
    { value: "sw", label: radar.quadrantSW }
  ];

  return (
    <>
      <Suspense fallback={null}>
        <ContextActionsPortal params={requestParams} />
      </Suspense>
      <div style={{ height: "60px", backgroundColor: "#edf1f3" }}></div>
      <div className="container mx-auto py-10">
        <h1 className="mb-8 text-2xl font-bold">Create Radar Entry</h1>
        <RadarEntryForm radarId={radar.id} ringOptions={ringOptions} quadrantOptions={quadrantOptions} />
      </div>
    </>
  );
}
