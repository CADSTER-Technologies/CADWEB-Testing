import type { Request, Response } from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const OWNER_EMAIL = 'services@cadster.in';              // your inbox
const SENDER = 'noreply@cadster.in'; // Must be verified in Resend dashboard
export async function contactHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, company, message, website } = (req.body || {}) as {
      name?: string; email?: string; company?: string; message?: string; website?: string;
    };

    // Honeypot: if 'website' has a value, silently accept (likely a bot)
    if (website) {
      return res.json({ success: true, message: 'Thanks! We will contact you soon.' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid payload.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // 1) Auto‑reply to client
    try {
      await resend.emails.send({
        from: SENDER,
        to: email,
        subject: 'Thanks for contacting Cadster Technologies',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hello ${escapeHtml(name)},</h2>
            <p>Thank you for reaching out to Cadster Technologies. We've received your inquiry and will get back to you shortly.</p>
            ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ''}
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Best regards,<br/>
              <strong>Cadster Technologies Team</strong>
            </p>
          </div>
        `,
      });
    } catch (e: any) {
      console.error('Resend auto-reply failed:', e?.response?.data || e?.message || e);
      return res.status(502).json({ success: false, message: 'Email send failed (customer reply).' });
    }

    // 2) Lead notification to you
    try {
      await resend.emails.send({
        from: SENDER,
        to: OWNER_EMAIL,
        subject: `New lead — ${name} (${email})`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>🎯 New Contact Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; font-weight: bold; width: 30%;">Name:</td>
                <td style="padding: 10px;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Email:</td>
                <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              ${company ? `
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; font-weight: bold;">Company:</td>
                <td style="padding: 10px;">${escapeHtml(company)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; font-weight: bold;">Time:</td>
                <td style="padding: 10px;">${new Date().toISOString()}</td>
              </tr>
            </table>
            <h3 style="margin-top: 20px;">Message:</h3>
            <p style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #00E1FF;">
              ${escapeHtml(message).replace(/\n/g, '<br/>')}
            </p>
          </div>
        `,
      });
    } catch (e: any) {
      console.error('Resend lead notification failed:', e?.response?.data || e?.message || e);
      return res.status(502).json({ success: false, message: 'Email send failed (lead notification).' });
    }

    return res.status(200).json({ success: true, message: 'Thanks! We will contact you soon.' });
  } catch (err: any) {
    console.error('Contact API error:', err?.message || err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again later.',
    });
  }
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
