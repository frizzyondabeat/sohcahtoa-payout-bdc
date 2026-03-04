import SohcahtoaSidebar from "@/components/layout/dashboard/app-sidebar";
import { SessionHeartbeat } from "@/components/dashboard/session-heartbeat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FC, PropsWithChildren } from "react";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SidebarProvider>
      <SessionHeartbeat />
      <SohcahtoaSidebar />
      <div className="flex h-dvh flex-1 flex-col">
        <header className="bg-sidebar sticky top-0 z-50 flex h-18 items-center justify-between overflow-hidden border-b pl-5 shadow">
          {/*<NotificationsInitializer />*/}
          <SidebarTrigger className="flex md:hidden" />
          {/* <Navbar /> */}
        </header>
        <ScrollArea
          className={`bg-background-2 h-[calc(100dvh-72px)] flex-1 p-4 md:p-8`}
        >
          {/* Main content area */}
          {children}
        </ScrollArea>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
