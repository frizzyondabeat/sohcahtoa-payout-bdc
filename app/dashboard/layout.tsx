import SohcahtoaSidebar from "@/components/layout/dashboard/app-sidebar";
import { SessionHeartbeat } from "@/components/dashboard/session-heartbeat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FC, PropsWithChildren } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Notification, SearchNormal } from "iconsax-react";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SidebarProvider>
      <SessionHeartbeat />
      <SohcahtoaSidebar />
      <div className="flex h-dvh flex-1 flex-col">
        <header className="bg-white sticky top-0 z-30 flex h-18 items-center justify-between overflow-hidden border-b px-8">
          {/*<NotificationsInitializer />*/}
          <SidebarTrigger className="flex md:hidden" />
          <div className="flex items-center gap-3">
            <Avatar className="size-[44px]">
              <AvatarImage src="/avatar.jpg" alt="Emmanuel Israel" />
              <AvatarFallback>
                <span className="text-primary-foreground">EI</span>
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-secondary-foreground text-sm">
                Good morning ️🌤️
              </p>
              <p className="text-xl font-medium">Emmanuel Israel</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center relative">
              <SearchNormal
                variant="Outline"
                className="size-[24px] fill-[#8C8C8C] absolute left-3 top-1/2 -translate-y-1/2"
              />
              <Input
                placeholder="Search"
                className="w-[15.875rem] h-[44px] pl-12"
              />
              <Kbd className="border border-[#E4E4E7] p-1 rounded-[5px] bg-white absolute right-3 top-1/2 -translate-y-1/2 text-secondary-foreground font-normal! text-xs h-[22px] w-[26px]">
                ⌘K
              </Kbd>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="size-[44px] rounded-[10px] relative shadow-[0px_2px_2px_0px_#2323230D]"
              >
                <Notification
                  variant="Outline"
                  className="size-[24px] fill-primary-foreground"
                />
              </Button>
              <span className="size-[18px] rounded-full bg-primary inline-flex items-center justify-center absolute top-2 right-[3px] ring-1 text-white text-xs font-medium">
                9
              </span>
            </div>
          </div>

          {/* <Navbar /> */}
        </header>
        <ScrollArea
          className={`bg-background-2 h-[calc(100dvh-72px)] flex-1 p-4 md:p-8 bg-sidebar`}
        >
          {/* Main content area */}
          {children}
        </ScrollArea>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
