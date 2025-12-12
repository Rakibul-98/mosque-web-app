// components/layout/MobileLayout.tsx
"use client";

import React, { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  PlusCircle,
  Bell,
  User,
  MessageSquare,
  Settings,
} from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface MobileLayoutProps {
  children: ReactNode;
  hideTabs?: boolean; // Optional prop to hide tabs on specific pages
}

export default function MobileLayout({
  children,
  hideTabs = false,
}: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  // Define your tabs
  const tabs: TabItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <Home size={24} />,
      path: "/",
    },
    {
      id: "explore",
      label: "Explore",
      icon: <Search size={24} />,
      path: "/explore",
    },
    {
      id: "create",
      label: "Create",
      icon: <PlusCircle size={24} />,
      path: "/create",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={24} />,
      path: "/notifications",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={24} />,
      path: "/profile",
    },
  ];

  const handleTabClick = (path: string) => {
    setActiveTab(path);
    router.push(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header/Status Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 pt-4 pb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
            <h1 className="text-xl font-bold text-gray-900">AppName</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2">
              <MessageSquare size={20} />
            </button>
            <button className="p-2">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      {/* Bottom Navigation Tabs */}
      {!hideTabs && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`
                  flex flex-col items-center justify-center
                  w-full h-full p-2
                  transition-all duration-200
                  ${
                    activeTab === tab.path
                      ? "text-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <div
                  className={`
                  p-2 rounded-lg transition-all
                  ${activeTab === tab.path ? "bg-blue-50" : ""}
                `}
                >
                  {tab.icon}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
