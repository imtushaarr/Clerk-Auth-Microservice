import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Clerk Auth Microservice
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-purple-100">
          Secure authentication with automatic email notifications
        </p>

        <div className="space-y-4 mb-12">
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="text-left inline-block space-y-2">
              <li className="flex items-center">
                <span className="mr-3">✓</span> Clerk Authentication
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span> Email Notifications via Testmail
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span> Secure User Sessions
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span> Webhook Integration
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/sign-up"
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-purple-100 transition transform hover:scale-105"
          >
            Sign Up
          </Link>
          <Link
            href="/sign-in"
            className="bg-purple-800 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-purple-900 transition transform hover:scale-105"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 text-purple-100">
          <p className="text-sm">
            🚀 Running on port <span className="font-bold">5173</span>
          </p>
        </div>
      </div>
    </div>
  );
}
