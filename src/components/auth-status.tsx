import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const AuthStatus = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </span>
          <Link
            href="/profile"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Profile
          </Link>
        </>
      ) : (
        <Link
          href="/auth/login"
          className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Login
        </Link>
      )}
    </div>
  )
}

