"use client";

import React from "react";
import AddEntryButton from "./add-entry-button";

export function EntriesTableToolbar({ totalRowCount }) {
  return (
    <div className="flex h-[49px] w-full shrink-0 gap-x-4 border-b border-gray-200 bg-white px-2 sm:px-3 lg:px-4">
      <div className="flex flex-1 items-center text-xl font-bold">Edit Radar Entries</div>
      <div className="flex flex-1 items-center justify-end">
        <div className="flex items-center">
          <Count count={totalRowCount} />
          <AddEntryButton className="ml-4" />
        </div>
      </div>
    </div>
  );
}

function Count({ count }) {
  return (
    <div className="ml-4 flex items-baseline justify-end text-xl font-semibold text-gray-300">
      {count.toLocaleString()} record{count !== 1 ? "s" : ""}
    </div>
  );
}
