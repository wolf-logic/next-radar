"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { formatDistanceToNow, format } from "date-fns";
import { TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EntriesTableToolbar } from "@/app/[userSlug]/[radarSlug]/entries/entries-table-toolbar";

export function EntriesTable() {
  const { userSlug, radarSlug } = useParams();
  const router = useRouter();
  const scrollingTableRef = useRef(null);
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 350
      },
      {
        accessorKey: "quadrantName",
        header: "Quadrant",
        size: 300
      },
      {
        accessorKey: "ringName",
        header: "Ring",
        size: 200
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 200
      },
      {
        accessorKey: "dateCreated",
        header: "Date Created",
        size: 350,
        cell: item => {
          const value = item.getValue();
          const className = "justify-left flex items-center";
          if (!value) {
            return (
              <div className={className}>
                <span className="text-gray-400">not recorded</span>
              </div>
            );
          } else {
            return (
              <div className={className}>
                {format(value, "yyyy-MM-dd")} ({formatDistanceToNow(value)} ago)
              </div>
            );
          }
        }
      }
    ],
    []
  );

  const handleRowClick = useCallback(
    (e, itemId) => {
      // Don't trigger if user is trying to open in new tab (middle click or ctrl/cmd + click)
      if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        router.push(`/${userSlug}/${radarSlug}/entries/${itemId}`);
      }
    },
    [router, userSlug, radarSlug]
  );

  const { data, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: [userSlug, radarSlug, "entries", sorting],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * fetchSize;
      const params = new URLSearchParams({
        start: start.toString(),
        size: fetchSize.toString(),
        sorting: JSON.stringify(sorting)
      });

      const url = `/${userSlug}/${radarSlug}/entries/get-entries?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("failed request");
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData
  });

  const flatData = useMemo(() => data?.pages?.flatMap(page => page.data) ?? [], [data]);
  const totalRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const fetchedRowCount = flatData.length;

  const fetchMoreOnBottomReached = useCallback(
    containerRefElement => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (scrollHeight - scrollTop - clientHeight < 500 && !isFetching && fetchedRowCount < totalRowCount) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, fetchedRowCount, totalRowCount]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(scrollingTableRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    debugTable: true
  });

  const handleSortingChange = updater => {
    setSorting(updater);
    if (!!table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  };

  table.setOptions(prev => ({ ...prev, onSortingChange: handleSortingChange }));

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33,
    getScrollElement: () => scrollingTableRef.current,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5
  });

  return (
    <>
      <EntriesTableToolbar totalRowCount={totalRowCount} />
      <div className="relative">
        <div
          onScroll={e => fetchMoreOnBottomReached(e.target)}
          ref={scrollingTableRef}
          className="h-[calc(100vh-64px-45px)] divide-y divide-gray-100 overflow-auto shadow-sm ring-1 ring-gray-900/5"
        >
          <table style={{ display: "grid" }}>
            <TableHeader
              style={{
                display: "grid",
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "white"
              }}
            >
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} style={{ display: "flex", width: "100%" }}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          display: "flex",
                          width: header.getSize(),
                          paddingTop: "13px"
                        }}
                      >
                        <div
                          {...{
                            className: `items-center ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`,
                            onClick: header.column.getToggleSortingHandler()
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: " 🔼",
                            desc: " 🔽"
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <tbody
              style={{
                display: "grid",
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative"
              }}
            >
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={node => rowVirtualizer.measureElement(node)}
                    className="cursor-pointer bg-white hover:bg-gray-50"
                    style={{
                      display: "flex",
                      position: "absolute",
                      transform: `translateY(${virtualRow.start}px)`,
                      width: "100%"
                    }}
                    onClick={e => handleRowClick(e, row.original.id)}
                  >
                      {row.getVisibleCells().map(cell => {
                        return (
                          <TableCell
                            key={cell.id}
                            style={{
                              display: "flex",
                              width: cell.column.getSize()
                            }}
                            className="px-4 py-2"
                          >
                            <div className="w-full">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </TableCell>
                        );
                      })}
                  </TableRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const fetchSize = 50;
