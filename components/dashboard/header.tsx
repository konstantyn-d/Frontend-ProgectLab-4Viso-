'use client'

import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  return (
    <header className="h-14 border-b border-[#222222] bg-[#0A0A0A] flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3D3D3D]" />
        <Input
          type="search"
          placeholder="Search lanes, shipments, carriers..."
          className="pl-9 h-8 text-[13px] bg-[#111111] border-[#222222] placeholder:text-[#3D3D3D] focus:border-[#2E2E2E]"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8 text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E53E3E] rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-[#111111] border-[#222222]">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 border-l-2 border-[#E53E3E] rounded-none">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#E53E3E]">Temperature Alert</span>
              <span className="text-[12px] text-[#A0A0A0]">
                Lane LN-003: Temperature exceeded 8°C threshold
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 border-l-2 border-[#C97B1A] rounded-none">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#C97B1A]">Customs Delay</span>
              <span className="text-[12px] text-[#A0A0A0]">
                Lane LN-008: Shipment delayed at customs
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            <DropdownMenuItem className="justify-center text-[12px] text-[#6B6B6B] hover:text-[#F5F5F5]">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2.5 px-2 h-8 hover:bg-[#1A1A1A]"
            >
              <div className="w-6 h-6 rounded bg-[#1A1A1A] flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#6B6B6B]" />
              </div>
              <div className="text-left">
                <p className="text-[12px] text-[#F5F5F5]">Sarah Chen</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-[#222222]">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
              Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            <DropdownMenuItem className="text-[13px] text-[#A0A0A0]">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px] text-[#A0A0A0]">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            <DropdownMenuItem className="text-[13px] text-[#E53E3E]">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
