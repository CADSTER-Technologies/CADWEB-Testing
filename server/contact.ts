import type { Request, Response } from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const OWNER_EMAIL = 'services@cadster.in';
const SENDER = 'noreply@cadster.in';

export async function contactHandler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, company, message, website } = (req.body || {}) as {
      name?: string; email?: string; company?: string; message?: string; website?: string;
    };

    console.log('📨 Received:', { name, email, company });

    // Honeypot check
    if (website) {
      console.log('🤖 Honeypot triggered');
      res.json({ success: true, message: 'Thanks! We will contact you soon.' });
      return;
    }

    // Validation
    if (!name || !email || !message) {
      console.log('❌ Validation failed: missing fields');
      res.status(400).json({ success: false, message: 'Name, email and message are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email:', email);
      res.status(400).json({ success: false, message: 'Invalid email format.' });
      return;
    }

    console.log(`📨 Processing contact from: ${name} (${email})`);

    // Send auto-reply
    try {
      console.log('📧 Sending auto-reply to:', email);
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
      console.log('✅ Auto-reply sent to:', email);
    } catch (e: any) {
      console.error('❌ Auto-reply error:', e?.message || e);
      res.status(502).json({ success: false, message: `Auto-reply failed: ${e?.message}` });
      return;
    }

    // Send lead notification
    try {
      console.log('📧 Sending lead to:', OWNER_EMAIL);
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
      console.log('✅ Lead sent to:', OWNER_EMAIL);
    } catch (e: any) {
      console.error('❌ Lead notification error:', e?.message || e);
      res.status(502).json({ success: false, message: `Lead notification failed: ${e?.message}` });
      return;
    }

    console.log(`✅ Both emails sent successfully`);

    // ALWAYS return JSON with explicit status
    res.status(200).json({
      success: true,
      message: 'Thanks! We will contact you soon.',
    });
  } catch (err: any) {
    console.error('❌ CRITICAL Contact API error:', err?.message || err);
    res.status(500).json({
      success: false,
      message: `Server error: ${err?.message || 'Unknown error'}`,
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
