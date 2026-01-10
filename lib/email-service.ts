import { Resend } from 'resend';
import { getWaitlistConfirmationEmail, getApprovalEmail } from './email-templates';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'Apimentadas <onboarding@resend.dev>';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmation(email: string): Promise<SendEmailResult> {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('[EMAIL] Resend not configured, skipping email send');
      console.log('='.repeat(80));
      console.log('WAITLIST CONFIRMATION EMAIL');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`Subject: Bem-vindo à Lista de Espera - Apimentadas`);
      console.log('='.repeat(80));
      return { success: true, messageId: 'dev-mode' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bem-vindo à Lista de Espera - Apimentadas 🌶️',
      html: getWaitlistConfirmationEmail({ email }),
    });

    if (error) {
      console.error('[EMAIL] Error sending waitlist confirmation:', error);
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] Waitlist confirmation sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('[EMAIL] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send approval email with registration instructions
 */
export async function sendApprovalEmail(email: string): Promise<SendEmailResult> {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('[EMAIL] Resend not configured, skipping email send');
      console.log('='.repeat(80));
      console.log('APPROVAL EMAIL');
      console.log('='.repeat(80));
      console.log(`To: ${email}`);
      console.log(`Subject: Você foi aprovado! - Apimentadas`);
      console.log(`Registration URL: ${process.env.NEXTAUTH_URL}/register`);
      console.log('='.repeat(80));
      return { success: true, messageId: 'dev-mode' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Você foi aprovado! Crie sua conta agora 🔥',
      html: getApprovalEmail({ email }),
    });

    if (error) {
      console.error('[EMAIL] Error sending approval email:', error);
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] Approval email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('[EMAIL] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}
