import type { Request, Response } from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const OWNER_EMAIL = 'services@cadster.in';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@cadster.in';

export async function contactHandler(req: Request, res: Response): Promise<void> {
  console.log('📨 [CONTACT] Request received:', {
    method: req.method,
    path: req.path,
    bodySize: JSON.stringify(req.body).length,
  });

  if (req.method !== 'POST') {
    console.log('❌ [CONTACT] Invalid method:', req.method);
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, company, message, website } = req.body;

    console.log('📋 [CONTACT] Form data received:', { name, email, company, website });

    if (website) {
      console.log('🤖 [CONTACT] Honeypot triggered');
      res.status(200).json({ success: true, message: 'Thanks! We will contact you soon.' });
      return;
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      console.log('❌ [CONTACT] Missing required fields');
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [CONTACT] Invalid email:', email);
      res.status(400).json({ success: false, message: 'Invalid email format.' });
      return;
    }

    console.log(`📧 [CONTACT] Starting email send: from="${SENDER_EMAIL}" to_customer="${email}" to_owner="${OWNER_EMAIL}"`);

    // Auto-reply
    try {
      console.log(`📤 [CONTACT] Sending auto-reply...`);
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: 'We Received Your Message - Cadster Technologies',
        html: `<div style="font-family: Arial, sans-serif;">
          <h2>Hi ${name},</h2>
          <p>Thanks for reaching out to Cadster! We'll get back to you soon.</p>
          <p style="color: #666; font-size: 12px;">Best regards,<br/>Cadster Team</p>
        </div>`,
      });
      console.log(`✅ [CONTACT] Auto-reply sent successfully`);
    } catch (emailErr: any) {
      console.error(`❌ [CONTACT] Auto-reply failed:`, {
        error: emailErr?.message,
        statusCode: emailErr?.statusCode,
      });
    }

    // Owner notification
    try {
      console.log(`📤 [CONTACT] Sending lead notification...`);
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: OWNER_EMAIL,
        subject: `New Lead: ${name} (${email})`,
        html: `<div style="font-family: Arial, sans-serif;">
          <h3>New Contact Submission</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Company:</b> ${company || 'N/A'}</p>
          <p><b>Time:</b> ${new Date().toISOString()}</p>
          <h4>Message:</h4>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>`,
      });
      console.log(`✅ [CONTACT] Lead email sent successfully`);
    } catch (emailErr: any) {
      console.error(`❌ [CONTACT] Lead email failed:`, {
        error: emailErr?.message,
        statusCode: emailErr?.statusCode,
      });
    }

    console.log(`✅ [CONTACT] Completed successfully`);
    res.status(200).json({
      success: true,
      message: 'Thanks for reaching out! We\'ll be in touch soon.',
    });
    return;
  } catch (err: any) {
    console.error(`❌ [CONTACT] Unhandled error:`, {
      message: err?.message,
      stack: err?.stack,
      type: err?.constructor?.name,
    });
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
    return;
  }
}
