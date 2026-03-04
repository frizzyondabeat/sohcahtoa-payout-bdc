"use client";

import SohcahtoaLogo from "@/components/common/app-logo";
import { Button } from "@/components/ui/button";
import { logout } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Home, Setting2, Icon, Calculator, Receipt21, Logout } from 'iconsax-react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { type FC } from "react";

type SidebarNavItem = {
  name: string;
  href: string;
  tooltip: string;
  icon: Icon;
};

const visibleItems: SidebarNavItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    tooltip: 'Home',
    icon: Home,
  },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    tooltip: 'Transactions',
    icon: Receipt21,
  },
  {
    name: 'Calculator',
    href: '/dashboard/calculator',
    tooltip: 'Calculator',
    icon: Calculator,
  },
];

const footerItems: SidebarNavItem[] = [
  {
    name: 'Settings',
    href: '/auth',
    tooltip: 'Settings',
    icon: Setting2,
  },
];

const isLinkActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

const SidebarKnob = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      className="border-border/50 bg-background absolute top-1/2 -right-3 z-50 h-6 w-6 -translate-y-1/2 rounded-full border shadow-md"
    >
      {isCollapsed ? (
        <ChevronRight className="h-3 w-3" />
      ) : (
        <ChevronLeft className="h-3 w-3" />
      )}
      <span className="sr-only">
        {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      </span>
    </Button>
  );
};

type MenuItemProps = {
  item: SidebarNavItem;
  isCollapsed: boolean;
};

const MenuItem: FC<MenuItemProps> = ({ item, isCollapsed }) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const active = isLinkActive(pathname, item.href);
  const IconComponent = item.icon;

  return (
    <SidebarMenuItem>
      <Link href={item.href}>
        <SidebarMenuButton
          tooltip={item.tooltip}
          className={cn(
            "text-grey-2 h-10 cursor-pointer gap-3 rounded-lg px-2 font-normal transition-all duration-300",
            active
              ? "bg-primary-3 text-primary-2 hover:bg-primary-3 hover:text-primary-2 font-semibold"
              : "hover:[&_svg]:fill-primary-2 hover:*:scale-105 hover:*:font-medium",
            { "items-center justify-center": isCollapsed && !isMobile },
          )}
        >
          <div
            className={cn("flex items-center justify-center gap-2", {
              "px-4": !isCollapsed,
            })}
          >
            <IconComponent
              size={18}
              variant={active ? "Bulk" : "Outline"}
              className={cn("fill-grey-2 size-5", {
                "fill-primary-2": active,
              })}
            />
            {(!isCollapsed || isMobile) && <span>{item.name}</span>}
          </div>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};

const SohcahtoaSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();

  return (
    <Sidebar collapsible="icon">
      <SidebarKnob />
      <SidebarHeader
        onClick={toggleSidebar}
        className={cn("h-18 items-center justify-center border-b")}
      >
        <SohcahtoaLogo className="h-8 w-full" />
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleItems.map((item) => (
            <MenuItem key={item.name} item={item} isCollapsed={isCollapsed} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t px-2 pb-4">
        <SidebarMenu>
          {footerItems.map((item) => (
            <MenuItem key={item.name} item={item} isCollapsed={isCollapsed} />
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className={cn(
                "text-grey-2 h-10 cursor-pointer gap-3 rounded-lg px-2 font-normal transition-all duration-300 hover:[&_svg]:fill-primary-2",
                { "items-center justify-center": isCollapsed && !isMobile }
              )}
              onClick={() => logout()}
            >
              <div className={cn("flex items-center justify-center gap-2", { "px-4": !isCollapsed })}>
                <Logout size={18} variant="Outline" className="fill-grey-2 size-5" />
                {(!isCollapsed || isMobile) && <span>Logout</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SohcahtoaSidebar;
