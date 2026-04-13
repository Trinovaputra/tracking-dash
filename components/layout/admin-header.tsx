import { LogoutButton } from "@/components/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function AdminHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Placeholder if we want to add a mobile menu toggle here later */}
        <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-medium text-gray-700">
            {session?.user?.name || session?.user?.email || "Admin"}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {session?.user?.role?.toLowerCase() || "Admin"}
          </span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
