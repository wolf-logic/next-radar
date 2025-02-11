"use client";

import React, { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { deleteRadar } from "@/app/actions/radar";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AppSidebarActionItem from "@/components/custom/app-sidebar-action-item";
import {
  DiamondPlusIcon,
  PencilIcon,
  PlusCircleIcon,
  SquarePlusIcon,
  TablePropertiesIcon,
  Trash2Icon,
  WrenchIcon
} from "lucide-react";

export default function ContextActionsPortal({ params }) {
  const [mounted, setMounted] = useState(false);
  const userSlug = params && params["userSlug"] ? params["userSlug"] : null;
  const radarSlug = params && params["radarSlug"] ? params["radarSlug"] : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const target = document.getElementById("context-actions-portal");
  if (!target) {
    return null;
  }

  return createPortal(
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {params && params["userSlug"] && params["radarSlug"] && (
              <>
                <AppSidebarActionItem
                  item={{
                    match: `^/${userSlug}/${radarSlug}/entries/new(/.*)?$`,
                    href: `/${userSlug}/${radarSlug}/entries/new`,
                    name: "Create Radar Entry",
                    icon: <SquarePlusIcon />
                  }}
                />
                <AppSidebarActionItem
                  item={{
                    match: `^/${userSlug}/${radarSlug}/entries(?!/new)(/.*)?$`,
                    href: `/${userSlug}/${radarSlug}/entries`,
                    name: "Edit Radar Entries",
                    icon: <TablePropertiesIcon />
                  }}
                />
              </>
            )}
            <AppSidebarActionItem
              item={{
                match: "^/new(/.*)?$",
                href: "/new",
                name: "Create Radar",
                icon: <PlusCircleIcon />
              }}
            />
            {params && params["userSlug"] && params["radarSlug"] && (
              <AppSidebarActionItem
                item={{
                  match: `^/${userSlug}/${radarSlug}/edit(/.*)?$`,
                  href: `/${userSlug}/${radarSlug}/edit`,
                  name: "Edit Radar",
                  icon: <WrenchIcon />
                }}
              />
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>,
    target
  );
}

ContextActionsPortal.propTypes = {
  params: PropTypes.object
};
