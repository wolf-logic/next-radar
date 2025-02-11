"use client";

import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { RadarIcon } from "lucide-react";

export default function AppSidebarRadarItem({ user, item }) {
  const pathname = usePathname();
  const current = new RegExp(`^/${user.slug}/${item.slug}(/.*)?$`).test(pathname);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={current}>
        <Link href={`/${user.slug}/${item.slug}`}>
          <RadarIcon />
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

AppSidebarRadarItem.propTypes = {
  user: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired
};
