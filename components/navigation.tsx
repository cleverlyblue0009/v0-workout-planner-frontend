"use client"

import { Button } from "@/components/ui/button"
import { Dumbbell, Home, Target, TrendingUp, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/nutrition", label: "Nutrition", icon: Target },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn("flex flex-col items-center gap-1 h-auto py-2 px-3", isActive && "text-primary")}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function DesktopNavigation() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href}>
            <Button variant={isActive ? "default" : "ghost"} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
      <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </nav>
  )
}
