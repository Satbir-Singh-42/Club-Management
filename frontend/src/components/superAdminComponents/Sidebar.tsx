import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { BarChart3, Users, FolderPlus, UserPlus } from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/superadmin/",
  },
  {
    title: "Register Club",
    icon: FolderPlus,
    href: "/superadmin/register-club",
  },
  {
    title: "Register User",
    icon: UserPlus,
    href: "/superadmin/register-user",
  },
  {
    title: "All Users",
    icon: Users,
    href: "/superadmin/users",
  },
  {
    title: "All Clubs",
    icon: FolderPlus,
    href: "/superadmin/clubs",
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = useLocation().pathname;

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all",
        isCollapsed ? "w-20" : "w-64", // Adjusted collapsed width to 20
      )}>
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/profile.png" alt="Club Hub" className="h-8 w-8" />
          {/* Render "Club Hub" text only if the sidebar is not collapsed */}
          {!isCollapsed && (
            <div>
              <div className="font-semibold text-lg text-black">Club Hub</div>
              {/* <div className="text-xs text-muted-foreground">
                Clubs & Societies
              </div> */}
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="space-y-6 py-4">
        <nav className="grid gap-1 px-3">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-700"
                    : "hover:bg-gray-100 text-gray-700",
                )}
                title={isCollapsed ? item.title : undefined} // Tooltip for collapsed sidebar
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive ? "text-blue-700" : "text-gray-500",
                  )}
                />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-4 w-full px-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">
          {isCollapsed ? "→" : "←"}
        </button>
      </div>
    </div>
  );
}
