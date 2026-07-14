import { redirect } from 'next/navigation'

/**
 * Root route — redirect to login.
 * After successful auth, login page redirects to /dashboard.
 */
export default function RootPage() {
  redirect('/login')
}
