import { auth } from '@/lib/auth';

export async function getAuthenticatedUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuthentication() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
