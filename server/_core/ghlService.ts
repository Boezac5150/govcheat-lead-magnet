/**
 * HighLevel CRM Service
 * Pushes new leads into HighLevel CRM, creates pipeline opportunities,
 * and triggers the welcome email sequence.
 */
import { ENV } from './env';

const GHL_BASE = 'https://services.leadconnectorhq.com';

function ghlHeaders() {
  return {
    'Authorization': `Bearer ${ENV.ghlApiKey}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

export interface GHLLeadPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
}

/**
 * Upsert a contact into HighLevel CRM, create a pipeline opportunity,
 * and send the welcome email via HighLevel conversations.
 */
export async function pushLeadToGHL(lead: GHLLeadPayload): Promise<string | null> {
  if (!ENV.ghlApiKey) {
    console.warn('[GHL] GHL_API_KEY not set — skipping CRM push');
    return null;
  }

  try {
    // 1. Upsert contact
    const contactPayload = {
      locationId: ENV.ghlLocationId,
      email: lead.email,
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      phone: lead.phone || '',
      source: lead.source || 'GovCheat Lead Magnet',
      tags: ['govcheat-lead', 'cheat-sheet-download', 'free-tier'],
    };

    const contactRes = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: ghlHeaders(),
      body: JSON.stringify(contactPayload),
    });

    const contactData = await contactRes.json();
    const contactId: string | undefined = contactData?.contact?.id;

    if (!contactRes.ok || !contactId) {
      console.error('[GHL] Contact upsert failed:', contactData);
      return null;
    }

    console.log('[GHL] Contact upserted:', contactId, '| New:', !contactData?.contact?.dateAdded);

    // 2. Create pipeline opportunity (only for new contacts)
    if (!contactData?.contact?.dateAdded || contactData?.new) {
      const oppPayload = {
        pipelineId: ENV.ghlPipelineId,
        locationId: ENV.ghlLocationId,
        name: `${lead.email} - GovCheat Lead`,
        pipelineStageId: ENV.ghlStageId,
        status: 'open',
        contactId,
        source: lead.source || 'GovCheat Lead Magnet',
      };

      const oppRes = await fetch(`${GHL_BASE}/opportunities/`, {
        method: 'POST',
        headers: ghlHeaders(),
        body: JSON.stringify(oppPayload),
      });

      const oppData = await oppRes.json();
      console.log('[GHL] Opportunity created:', oppData?.opportunity?.id);
    }

    // 3. Send welcome email via HighLevel
    const displayName = lead.firstName || lead.email.split('@')[0];
    const welcomeEmailPayload = {
      type: 'Email',
      contactId,
      subject: 'Your GovCheat Cheat Sheet is Ready',
      html: buildWelcomeHtml(displayName),
      emailFrom: 'john@boezax.com',
    };

    const msgRes = await fetch(`${GHL_BASE}/conversations/messages`, {
      method: 'POST',
      headers: ghlHeaders(),
      body: JSON.stringify(welcomeEmailPayload),
    });

    const msgData = await msgRes.json();
    console.log('[GHL] Welcome email sent:', msgData?.messageId);

    return contactId;
  } catch (err) {
    console.error('[GHL] Error pushing lead:', err);
    return null;
  }
}

function buildWelcomeHtml(name: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#040609;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#040609;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#080c14;border:1px solid #141c2e;border-radius:12px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#00ff88 0%,#00cc6a 100%);padding:30px;text-align:center;">
          <h1 style="color:#000000;margin:0;font-size:28px;font-weight:900;letter-spacing:-1px;">GOVCHEAT</h1>
          <p style="color:#000000;margin:5px 0 0 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">The Cheat Code for Government Contracts</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#00ff88;margin-top:0;font-size:22px;font-weight:800;">Intel Secured, ${name}.</h2>
          <p style="color:#94a3b8;line-height:1.6;font-size:15px;">You are now inside the fastest-growing community of government contractors. Your exclusive GovCon Cheat Sheet is locked and loaded.</p>
          <div style="background:#0d131f;padding:20px;border-radius:8px;margin:25px 0;border:1px solid #141c2e;">
            <h3 style="color:#ffffff;margin-top:0;font-size:16px;">What is inside your Cheat Sheet:</h3>
            <p style="color:#94a3b8;line-height:1.8;font-size:14px;margin:0;">
              The 10 easiest contract categories for 2026<br/>
              Step-by-step bidding playbook<br/>
              Real-time opportunities updated daily<br/>
              AI-powered win probability scoring
            </p>
          </div>
          <div style="text-align:center;margin:35px 0;">
            <a href="https://govcheat.com/contracts" style="background:#00ff88;color:#000000;padding:16px 36px;text-decoration:none;border-radius:8px;font-weight:900;display:inline-block;font-size:16px;">VIEW LIVE CONTRACTS NOW</a>
          </div>
          <p style="color:#64748b;font-size:13px;line-height:1.6;">Most people spend months trying to figure out government contracting. You just skipped the line. The contracts are live. The intel is fresh. Your move.</p>
          <p style="color:#4a5568;font-size:11px;text-align:center;margin-top:40px;border-top:1px solid #141c2e;padding-top:20px;">GovCheat &bull; Data from SAM.gov &bull; Not affiliated with U.S. Government</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
