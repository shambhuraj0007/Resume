"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "../ThemeSwitch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";
import { motion } from "framer-motion";

interface Settings {
  displayName: string | null | undefined;
  defaultTemplate: string;
}

const navLinks = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Create", href: "/resume/create" },
  { title: "Analyzer", href: "/ats-checker" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    displayName: "",
    defaultTemplate: "modern",
  });

  useEffect(() => {
    setMounted(true);
    setSettings({
      displayName:
        window.localStorage.getItem("resumeitnow_name") || session?.user?.name,
      defaultTemplate:
        window.localStorage.getItem("resumeitnow_template") || "modern",
    });
  }, [session]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    localStorage.clear();
    await signOut({ redirect: false });
    router.push("/");
  };

  const navigateTo = (href: string) => {
    setSheetOpen(false);
    router.push(href);
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-accent/20 rounded-full px-3"
        >
          <User className="h-4 w-4" />
          <span>{settings.displayName || session?.user?.name || "User"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="font-semibold">Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigateTo("/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateTo("/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigateTo("/dashboard")}>
            Dashboard
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500"
          onClick={handleSignOut}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MobileMenu = () => (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full hover:bg-accent/20"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] p-6">
        <nav className="flex flex-col gap-4 mt-6">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-lg font-medium hover:text-primary"
                onClick={() => navigateTo(link.href)}
              >
                {link.title}
              </Button>
            </motion.div>
          ))}
          <div className="mt-6 border-t pt-4">
            {session ? (
              <UserMenu />
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigateTo("/signin")}
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 shadow-sm"
    >
      <div className="mx-auto h-24 max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-bold text-4xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
          >
            ResumeAI
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-lg font-bold text-muted-foreground hover:text-primary transition"
              >
                {link.title}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            <div className="hidden md:flex">
              {session ? (
                <UserMenu />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo("/signin")}
                >
                  Sign In
                </Button>
              )}
            </div>
            <MobileMenu />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
