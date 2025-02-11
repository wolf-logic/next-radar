"use client";

import { Suspense } from "react";
import ContextActionsPortal from "@/components/custom/context-actions-portal";
import { NotFoundMessage } from "@/components/custom/not-found-message";

export default function NotFound() {
  return (
    <>
      <Suspense fallback={null}>
        <ContextActionsPortal />
      </Suspense>
      <div style={{ height: "60px", backgroundColor: "#edf1f3" }}></div>
      <NotFoundMessage />
    </>
  );
}
