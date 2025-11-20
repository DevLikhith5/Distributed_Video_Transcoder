import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserAvatar } from "@daveyplate/better-auth-ui";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

import { authClient } from "@/lib/auth-client";
import { redirect } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Settings, LogOut, CreditCard } from "lucide-react";
import type { Session, User } from "better-auth";

export function DashboardNavbar({
    session,
}: {
    session: { user: User; session: Session } | null;
}) {
    const navigate = useNavigate();


    if (!session) redirect("/");

    const handleSignOut = async () => {
        await authClient.signOut({

            fetchOptions: {
                onSuccess: () => {
                    navigate("/");
                },
            },
        });
    };

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-card/95 px-6 backdrop-blur-2xl transition-all duration-300">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="hover:bg-accent/50 hover:text-accent-foreground transition-colors h-9 w-9" />

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md items-center">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                            type="search"
                            placeholder="Search videos..."
                            className="pl-10 bg-background/50 border-border/40 h-9 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all duration-300 group-hover:bg-background/70"
                        />
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full hover:bg-accent/50 transition-all duration-300 hover:scale-105"
                >
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="absolute top-2.5 right-2.5 block h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-background animate-pulse"></span>
                </Button>

                <div className="h-6 w-[1px] bg-border/40 mx-1" />

                {/* <ModeToggle /> */}

                <div className="ml-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-transparent focus-visible:ring-0">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                    <UserAvatar user={session?.user} className="h-8 w-8 ring-2 ring-border/40 transition-transform duration-300 hover:scale-105" />
                                </div>
                            </Button>

                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 bg-card/95 backdrop-blur-2xl border-border/40 p-2 shadow-xl" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-2">
                                <div className="flex flex-col space-y-1.5">
                                    <p className="text-sm font-semibold leading-none text-foreground">{session?.user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/40 my-1" />
                            <div className="space-y-1">
                                <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-accent/50 focus:text-accent-foreground py-2">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-accent/50 focus:text-accent-foreground py-2">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-accent/50 focus:text-accent-foreground py-2">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Billing</span>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator className="bg-border/40 my-1" />
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="cursor-pointer rounded-lg focus:bg-destructive/10 focus:text-destructive py-2 mt-1 text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}