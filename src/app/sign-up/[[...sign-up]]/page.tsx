import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { LogoutButton } from "@/components/LogoutButton";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our authentication microservice today</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <SignUp />
        </Suspense>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition text-center"
          >
            Back
          </Link>
          <div className="flex-1">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
