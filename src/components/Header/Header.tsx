import { AuthStatus } from "../AuthStatus";
import Logo from "../Logo";
import HeaderActions from "../HeaderActions/HeaderActions";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center align-middle gap-4 h-16">
          <Logo />
        </div>
        <HeaderActions>
          <AuthStatus userEmail={user?.email ?? null} />
        </HeaderActions>
      </div>
    </nav>
  );
}
