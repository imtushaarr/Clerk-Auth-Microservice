"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

export function LogoutButton() {
  return (
    <ClerkSignOutButton>
      <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition cursor-pointer">
        Sign Out
      </button>
    </ClerkSignOutButton>
  );
}
