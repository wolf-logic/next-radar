import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
      <SidebarHeader>
        <div className="mx-2 mt-4">Wolf Logic Radar</div>
      </SidebarHeader>
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
      <SidebarFooter>
        <div className="mx-1 text-xs text-gray-400">
          This software is{" "}
          <a className="underline" href="https://github.com/wolf-logic/next-radar">
            open source
          </a>{" "}
          and available for download and self-hosting.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
