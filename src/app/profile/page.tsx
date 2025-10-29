import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            User Profile
          </h1>

          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
              <p className="text-lg text-gray-900 dark:text-white font-mono text-sm">
                {user.id}
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-lg text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleString('en-US')}
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last login</p>
              <p className="text-lg text-gray-900 dark:text-white">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString('en-US')
                  : 'Not defined'}
              </p>
            </div>

            <div className="pt-4">
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

