import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuthentication() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
