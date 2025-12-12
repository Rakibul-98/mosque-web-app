// components/layout/MobileLayout.tsx
"use client";

import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ReceiptText,
  Users,
  LogIn,
  UserCog,
  PlusCircle,
} from "lucide-react";
import { getUserRole, isAuthenticated } from "../../lib/auth/auth";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  const publicTabs = [
    { id: "home", label: "Home", icon: <Home size={22} />, path: "/" },
    {
      id: "transactions",
      label: "Transactions",
      icon: <ReceiptText size={22} />,
      path: "/transactions",
    },
    {
      id: "committee",
      label: "Committee",
      icon: <Users size={22} />,
      path: "/committee",
    },
  ];

  const authTabs = isAuth
    ? [
        userRole === "cashier"
          ? {
              id: "add-transaction",
              label: "Add",
              icon: <PlusCircle size={22} />,
              path: "/cashier/add-transaction",
            }
          : {
              id: "add-member",
              label: "Add Member",
              icon: <UserCog size={22} />,
              path: "/admin/add-member",
            },
      ]
    : [];

  const allTabs = [
    ...publicTabs,
    ...authTabs,
    {
      id: "login",
      label: isAuth ? "Account" : "Login",
      icon: <LogIn size={22} />,
      path: isAuth
        ? userRole === "admin"
          ? "/admin/committee"
          : "/cashier/transactions"
        : "/login",
    },
  ];

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {allTabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`
                  flex flex-col items-center justify-center
                  w-full h-full p-2
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <div
                  className={`
                  p-1 rounded-lg transition-all
                  ${isActive ? "bg-blue-50" : ""}
                `}
                >
                  {tab.icon}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
