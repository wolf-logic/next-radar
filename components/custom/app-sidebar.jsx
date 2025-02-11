import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu
} from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { getUser } from "@/app/actions/user";
import { getUserRadars } from "@/app/actions/radar";
import AppSidebarRadarItem from "@/components/custom/app-sidebar-radar-item";

export async function AppSidebar() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await getUser(userId);
  const radars = await getUserRadars(userId);

  return (
    <Sidebar>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Radars</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {radars.map(item => (
                <AppSidebarRadarItem key={item.slug} user={user} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div id="context-actions-portal" />
      </SidebarContent>
    </Sidebar>
  );
}
