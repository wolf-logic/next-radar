import { createRadar } from "@/app/actions/radar";
import { RadarForm } from "@/components/custom/radar-form";
import { Suspense } from "react";
import ContextActionsPortal from "@/components/custom/context-actions-portal";

export default async function Page({ params }) {
  const requestParams = await params;
  return (
    <>
      <Suspense fallback={null}>
        <ContextActionsPortal params={requestParams} />
      </Suspense>
      <div style={{ height: "60px", backgroundColor: "#edf1f3" }}></div>
      <div className="container mx-auto py-10">
        <h1 className="mb-8 text-2xl font-bold">Create Radar</h1>
        <RadarForm onSubmit={createRadar} />
      </div>
    </>
  );
}
