/**
 * Check if a user is an admin
 * Admins are determined by checking if their email is in the ADMIN_EMAILS environment variable
 */
export function isAdmin(user: { email: string }): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  return adminEmails.includes(user.email);
}
