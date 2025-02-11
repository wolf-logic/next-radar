import { Suspense } from "react";
import ContextActionsPortal from "@/components/custom/context-actions-portal";
import { EntriesTable } from "@/app/[userSlug]/[radarSlug]/entries/entries-table";

export default async function Page({ params }) {
  const requestParams = await params;
  return (
    <>
      <Suspense fallback={null}>
        <ContextActionsPortal params={requestParams} />
      </Suspense>
      <div style={{ height: "60px", backgroundColor: "#edf1f3" }}></div>
      <EntriesTable />
    </>
  );
}
