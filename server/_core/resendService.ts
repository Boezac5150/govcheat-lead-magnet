/**
 * Resend email service for sending transactional emails
 * Uses the Resend HTTP API directly (no npm package needed)
 */

import { ENV } from './env';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    if (!ENV.resendApiKey) {
      console.warn('[Resend] API key not configured');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from || 'noreply@govcheat.com',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || payload.subject,
        reply_to: payload.replyTo || 'support@govcheat.com',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Resend] Failed to send email:", response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.error("[Resend] Error details:", errorJson);
      } catch (jsonError) {
        console.error("[Resend] Could not parse error response as JSON.");
      }
      return false;
    }

    const result = await response.json() as { id?: string };
    console.log('[Resend] Successfully sent email to:', payload.to, 'ID:', result.id);
    return true;
  } catch (error) {
    console.error('[Resend] Error sending email:', error);
    return false;
  }
}

/**
 * Send signup confirmation email
 */
export async function sendSignupConfirmation(email: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0A0E17 0%, #1a1f2e 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #00FF88; margin: 0; font-size: 32px;">GOVCHEAT</h1>
        <p style="color: #00FF88; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">THE ULTIMATE GOVCON CHEAT SHEET</p>
      </div>
      <div style="background: #f5f5f5; padding: 40px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0;">Welcome to GovCheat!</h2>
        <p style="color: #666; line-height: 1.6;">
          You're now part of the fastest-growing community of government contractors winning contracts.
        </p>
        <p style="color: #666; line-height: 1.6;">
          Your exclusive GovCon Cheat Sheet is ready. Inside you'll find:
        </p>
        <ul style="color: #666; line-height: 1.8;">
          <li>✓ The 10 easiest government contracts to win in 2026</li>
          <li>✓ Step-by-step bidding playbook</li>
          <li>✓ Real contract opportunities updated daily</li>
          <li>✓ AI-powered bid analysis and win probability scoring</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://govcheatlm-rclhfn9a.manus.space/manus-storage/govcheat_cheatsheet_4ae045b5.pdf" style="background: #00FF88; color: #0A0E17; padding: 12px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-right: 10px;">
            Download Cheat Sheet
          </a>
          <a href="https://govcheat.com/contracts" style="background: #333; color: #00FF88; padding: 12px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; border: 2px solid #00FF88;">
            View Live Contracts
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          This is an automated message. Do not reply to this email. For support, visit govcheat.com
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '✓ Welcome to GovCheat - Your Cheat Sheet is Ready',
    html,
    text: 'Welcome to GovCheat! Your exclusive GovCon Cheat Sheet is ready. Visit https://govcheat.com/contracts to view live opportunities.',
  });
}

/**
 * Send new contract alert email
 */
export async function sendContractAlert(email: string, contractTitle: string, contractValue: number): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0A0E17 0%, #1a1f2e 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #00FF88; margin: 0; font-size: 32px;">GOVCHEAT</h1>
      </div>
      <div style="background: #f5f5f5; padding: 40px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0;">🔥 New Contract Match!</h2>
        <p style="color: #666; line-height: 1.6;">
          A new contract matching your criteria just posted:
        </p>
        <div style="background: white; padding: 20px; border-left: 4px solid #00FF88; margin: 20px 0;">
          <h3 style="color: #0A0E17; margin-top: 0;">${contractTitle}</h3>
          <p style="color: #666; margin: 10px 0;">
            <strong>Estimated Value:</strong> $${(contractValue / 1000).toFixed(0)}K
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://govcheat.com/contracts" style="background: #00FF88; color: #0A0E17; padding: 12px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            View Contract Details
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🔥 New Contract: ${contractTitle}`,
    html,
    text: `New contract: ${contractTitle} - Estimated value: $${(contractValue / 1000).toFixed(0)}K`,
  });
}
