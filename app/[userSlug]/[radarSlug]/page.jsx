"use server";

import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import Radar from "@/components/custom/radar";
import ContextActionsPortal from "@/components/custom/context-actions-portal";
import { NotFoundMessage } from "@/components/custom/not-found-message";
import { userHasAccessToRadar } from "@/app/actions/user";

export default async function Page({ params }) {
  const { userId } = await auth();
  const requestParams = await params;
  const { userSlug, radarSlug } = requestParams;

  // Ensure that the user has access to the radar
  if (!userId || !(await userHasAccessToRadar(userId, radarSlug))) {
    return (
      <>
        <div style={{ height: "60px", backgroundColor: "#edf1f3" }}></div>
        <NotFoundMessage />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <ContextActionsPortal params={requestParams} />
      </Suspense>
      <main>
        <Radar user={userSlug} radar={radarSlug} />
      </main>
    </>
  );
}
