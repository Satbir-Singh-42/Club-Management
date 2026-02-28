import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export function Header() {
  const onLogout = () => {
    localStorage.removeItem("token");

    // Dispatch a custom event to trigger a re-render
    window.dispatchEvent(new Event("storage"));
  };

  return (
    // Main header section, positioned fixed at the top
    <header className="fixed left-64 right-0 top-0 z-50 flex h-16 items-center justify-end border-b bg-white px-6">
      {/* Dropdown menu for user options */}
      <DropdownMenu>
        {/* Trigger for the dropdown menu, wraps the avatar button */}
        <DropdownMenuTrigger asChild>
          {/* Avatar button showing user profile image or initials */}
          <Avatar className="w-10 h-10">
            {" "}
            {/* Adjust size here */}
            <AvatarImage src="/profile.png" />
            <AvatarFallback>SA</AvatarFallback> {/* Placeholder initials */}
          </Avatar>
        </DropdownMenuTrigger>

        {/* Dropdown menu content */}
        <DropdownMenuContent align="end" className="w-56">
          {/* Menu item to log out */}
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> {/* LogOut icon */}
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
