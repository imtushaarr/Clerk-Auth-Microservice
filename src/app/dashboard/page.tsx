import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId, sessionId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            Clerk Auth
          </Link>
          <UserButton />
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>

          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <span className="font-semibold">User ID:</span> {userId}
              </p>
            </div>

            {sessionId && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-semibold">Session ID:</span> {sessionId}
                </p>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <p className="text-green-800">
                ✓ Successfully authenticated with Clerk
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-bold text-blue-900 mb-2">Welcome!</h2>
            <p className="text-blue-800">
              You have successfully signed up and received a welcome email at your registered email address.
            </p>
          </div>

          <Link
            href="/api/auth/logout"
            className="mt-6 inline-block px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
