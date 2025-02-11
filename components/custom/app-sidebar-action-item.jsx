"use client";

import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export default function AppSidebarActionItem({ item }) {
  const pathname = usePathname();
  const current = new RegExp(item.match).test(pathname);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={current}>
        <Link href={item.href}>
          {item.icon}
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

AppSidebarActionItem.propTypes = {
  item: PropTypes.object.isRequired
};
