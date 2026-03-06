"use client";

import SohcahtoaLogo from "@/components/common/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import {
  Home,
  Setting2,
  Icon,
  Calculator,
  Receipt21,
  MessageQuestion,
  Repeat,
  Card,
} from "iconsax-react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
    name: "Home",
    href: "/dashboard/home",
    tooltip: "Home",
    icon: Home,
  },
  {
    name: "Calculator",
    href: "/dashboard/calculator",
    tooltip: "Calculator",
    icon: Calculator,
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    tooltip: "Transactions",
    icon: Repeat,
  },
  {
    name: "Cards",
    href: "/dashboard/cards",
    tooltip: "Cards",
    icon: Card,
  },
];

const footerItems: SidebarNavItem[] = [
  {
    name: "Support",
    href: "/auth",
    tooltip: "support",
    icon: MessageQuestion,
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
      className="border-border/50 bg-background absolute top-1/2 -right-3 z-100 h-6 w-6 -translate-y-1/2 rounded-full border shadow-md"
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
            "text-[#8C8C8C] h-10 cursor-pointer gap-3 rounded-lg px-2 font-normal transition-all duration-300",
            active
              ? "bg-[#F9F9F9] text-primary hover:bg-primary-3 hover:text-primary-2 font-semibold"
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
              variant={active ? "Bold" : "Outline"}
              className={cn("fill-[#8C8C8C] size-5", {
                "fill-primary": active,
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
    <Sidebar
      collapsible="icon"
      className="[&_[data-slot=sidebar-inner]]:bg-white z-100"
    >
      <SidebarHeader
        onClick={toggleSidebar}
        className={cn("h-18 relative flex p-2 justify-center border-b")}
      >
        <SohcahtoaLogo className="h-11 w-27" />
        <SidebarKnob />
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
              tooltip="Account"
              className={cn(
                "h-auto cursor-pointer rounded-[15px] border border-[#E4E4E7] bg-white px-3 py-2 shadow-[0px_2px_2px_0px_rgba(35,35,35,0.05)] transition-all duration-300 hover:bg-[#FAFAFA]",
                isCollapsed && !isMobile
                  ? "items-center justify-center px-2.5"
                  : "justify-between",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-11">
                  <AvatarImage src="/avatar.jpg" alt="Emmanuel Israel" />
                  <AvatarFallback>
                    <span className="text-primary-foreground">EI</span>
                  </AvatarFallback>
                </Avatar>
                {(!isCollapsed || isMobile) && (
                  <div className="min-w-0 text-left leading-[1.2]">
                    <p className="truncate text-sm font-semibold text-[#232323]">
                      Emmanuel Israel
                    </p>
                    <p className="truncate text-sm font-normal text-[#666666]">
                      emmanuel.e.israel@gmail.com
                    </p>
                  </div>
                )}
              </div>
              {(!isCollapsed || isMobile) && (
                <ChevronDown className="size-3 text-[#8C8C8C]" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SohcahtoaSidebar;
