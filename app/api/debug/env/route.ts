import { NextResponse } from 'next/server';
import { getAdminEmails } from '@/lib/admin';

/**
 * Debug endpoint to check environment variables configuration
 * Access: https://apimentadas.app/api/debug/env
 */
export async function GET() {
  const adminEmails = getAdminEmails();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    config: {
      // Admin configuration
      hasAdminEmails: !!process.env.ADMIN_EMAILS,
      adminEmailsRaw: process.env.ADMIN_EMAILS || '(not set)',
      adminEmailsParsed: adminEmails,
      adminCount: adminEmails.length,

      // Email configuration
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      emailFrom: process.env.EMAIL_FROM || 'Apimentadas <onboarding@resend.dev>',

      // Auth configuration
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL || '(not set)',

      // Database
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
    message: adminEmails.length > 0
      ? '✅ Admin emails configured correctly'
      : '⚠️ ADMIN_EMAILS not configured - admin login will not work',
  });
}
