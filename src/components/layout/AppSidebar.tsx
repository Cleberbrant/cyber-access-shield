import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  Users,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { UserSession } from "@/hooks/useSessionCheck";

interface AppSidebarProps {
  user: UserSession | null;
  onLogout: () => void;
}

const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    title: "Criar Avaliação",
    url: "/create-assessment",
    icon: FilePlus2,
    adminOnly: true,
  },
  {
    title: "Usuários",
    url: "/user-management",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Logs de Fraude",
    url: "/fraud-logs",
    icon: ShieldAlert,
    adminOnly: true,
  },
];

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.isAdmin);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-3">
        <div className="flex items-center group-data-[collapsible=icon]:justify-center">
          <Logo
            size={26}
            className="group-data-[collapsible=icon]:hidden"
          />
          <LogoMark
            size={26}
            className="hidden group-data-[collapsible=icon]:block"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url} className="relative">
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                        )}
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        {user && (
          <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
              {user.email?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {user.email}
              </p>
              <Badge
                variant="outline"
                className="mt-0.5 h-4 border-primary/30 px-1.5 text-[10px] text-primary"
              >
                {user.isAdmin ? "Administrador" : "Aluno"}
              </Badge>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1 px-2 pb-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
