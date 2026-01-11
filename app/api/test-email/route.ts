import { NextResponse } from 'next/server';
import { sendWaitlistConfirmation } from '@/lib/email-service';
import { getAdminEmails } from '@/lib/admin';

export async function GET() {
  const adminEmails = getAdminEmails();
  const testEmail = adminEmails[0] || 'test@example.com'; // Usando primeiro email admin

  console.log('='.repeat(80));
  console.log('[TEST] Starting email test...');
  console.log('[TEST] RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
  console.log('[TEST] EMAIL_FROM:', process.env.EMAIL_FROM || 'Using default');
  console.log('='.repeat(80));

  const result = await sendWaitlistConfirmation(testEmail);

  console.log('[TEST] Email send result:', JSON.stringify(result, null, 2));
  console.log('='.repeat(80));

  return NextResponse.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error,
    config: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'Apimentadas <onboarding@resend.dev>',
    }
  });
}
