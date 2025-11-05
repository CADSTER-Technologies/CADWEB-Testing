import type { Request, Response } from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const OWNER_EMAIL = 'services@cadster.in';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@cadster.in';

export async function contactHandler(req: Request, res: Response): Promise<void> {
  console.log('📨 [CONTACT] Handler called');

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const { name, email, company, message, website } = req.body;

  // Honeypot
  if (website) {
    console.log('🤖 [CONTACT] Honeypot triggered');
    res.status(200).json({ success: true, message: 'Thanks! We will contact you soon.' });
    return;
  }

  // Validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    console.log('❌ [CONTACT] Missing fields');
    res.status(400).json({ success: false, message: 'All fields required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Invalid email' });
    return;
  }

  try {
    // Send both emails in parallel
    await Promise.all([
      resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: 'Thanks for contacting Cadster',
        html: `<h2>Hi ${name}</h2><p>Thanks for reaching out. We'll respond soon.</p>`,
      }).catch(err => console.error('Auto-reply failed:', err?.message)),

      resend.emails.send({
        from: SENDER_EMAIL,
        to: OWNER_EMAIL,
        subject: `New Lead: ${name}`,
        html: `<h3>New submission</h3><p>From: ${name} (${email})</p><p>Company: ${company || 'N/A'}</p><p>Message: ${message}</p>`,
      }).catch(err => console.error('Lead email failed:', err?.message)),
    ]);

    console.log('✅ [CONTACT] Success');
    res.status(200).json({
      success: true,
      message: 'Thanks for reaching out! We will contact you soon.',
    });
  } catch (err: any) {
    console.error('❌ [CONTACT] Error:', err?.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred',
    });
  }
}
