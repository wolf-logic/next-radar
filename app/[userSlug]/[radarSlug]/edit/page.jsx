import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getRadar, updateRadar } from "@/app/actions/radar";
import ContextActionsPortal from "@/components/custom/context-actions-portal";
import { NotFoundMessage } from "@/components/custom/not-found-message";
import { RadarForm } from "@/components/custom/radar-form";

export default async function Page({ params }) {
  const { userId } = await auth();
  const requestParams = await params;
  const radar = await getRadar(requestParams.userSlug, requestParams.radarSlug);

  if (!radar) {
    return <NotFoundMessage />;
  }

  const handleUpdate = async formData => {
    "use server";
    await updateRadar(formData, requestParams.radarSlug);
  };

  return (
    <>
      <Suspense fallback={null}>
        <ContextActionsPortal params={requestParams} />
      </Suspense>
      <div style={{ height: "60px", backgroundColor: "#edf1f3" }}></div>
      <div className="container mx-auto py-10">
        <h1 className="mb-8 text-2xl font-bold">Edit Radar</h1>
        <RadarForm 
          radar={radar} 
          onSubmit={handleUpdate} 
          userSlug={requestParams.userSlug}
          isOwner={radar.createdBy === userId}
        />
      </div>
    </>
  );
}
