export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Authentication error
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Something went wrong while trying to log in. Please try again.
        </p>
        <a
          href="/auth/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Return to login
        </a>
      </div>
    </div>
  )
}

