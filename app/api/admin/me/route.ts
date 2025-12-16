import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';
import {
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/admin/me - Check if current user is admin
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({ isAdmin: isAdmin(user) });
  } catch (error) {
    console.error('Error in GET /api/admin/me:', error);
    return successResponse({ isAdmin: false });
  }
}
