import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { isAdminEmail } from '@/lib/admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (!isAdminEmail(session.user.email)) {
    // Non-admin users cannot access admin panel
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Navigation */}
      <AdminNav />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
