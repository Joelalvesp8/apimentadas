import { NextResponse } from 'next/server';
import { sendWaitlistConfirmation } from '@/lib/email-service';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/test-email - Test email sending (ADMIN ONLY)
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const result = await sendWaitlistConfirmation(user.email);

  return NextResponse.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error,
  });
}
