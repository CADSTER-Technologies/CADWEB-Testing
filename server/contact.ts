import type { Request, Response } from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const OWNER_EMAIL = 'services@cadster.in';
const SENDER = 'Cadster <noreply@cadster.in>';

/**
 * Contact Form Handler
 * Handles both regular contact form and demo requests
 */
export async function contactHandler(req: Request, res: Response): Promise<void> {
  console.log('📨 [CONTACT] Handler called');

  // Method validation
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, company, message, website } = (req.body || {}) as {
      name?: string;
      email?: string;
      company?: string;
      message?: string;
      website?: string;
    };

    // Honeypot check - silently accept bot submissions
    if (website) {
      console.log('🤖 [CONTACT] Honeypot triggered - bot detected');
      res.status(200).json({
        success: true,
        message: 'Thanks! We will contact you soon.'
      });
      return;
    }

    // Field validation
    if (!name || !email || !message) {
      console.log('❌ [CONTACT] Missing required fields');
      res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
      return;
    }

    // Type validation
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      console.log('❌ [CONTACT] Invalid payload types');
      res.status(400).json({
        success: false,
        message: 'Invalid payload format.'
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [CONTACT] Invalid email format');
      res.status(400).json({
        success: false,
        message: 'Invalid email format.'
      });
      return;
    }

    // Detect if this is a demo request
    const isDemoRequest = message.includes('[DEMO REQUEST]');
    const requestType = isDemoRequest ? 'DEMO' : 'CONTACT';

    console.log(`📋 [${requestType}] Processing request from ${name} (${email})`);

    // Send emails in parallel for better performance
    const [clientEmailResult, ownerEmailResult] = await Promise.allSettled([
      // 1) Auto-reply to client
      resend.emails.send({
        from: SENDER,
        to: email,
        subject: isDemoRequest
          ? 'Demo Request Received - Cadster Technologies'
          : 'Thanks for contacting Cadster Technologies',
        html: isDemoRequest
          ? generateDemoAutoReplyHTML(name, company)
          : generateContactAutoReplyHTML(name, company),
      }),

      // 2) Lead notification to owner
      resend.emails.send({
        from: SENDER,
        to: OWNER_EMAIL,
        subject: isDemoRequest
          ? `🎯 Demo Request — ${name} (${email})`
          : `📬 New Lead — ${name} (${email})`,
        html: generateOwnerNotificationHTML(name, email, company, message, isDemoRequest),
      }),
    ]);

    // Check if client email failed
    if (clientEmailResult.status === 'rejected') {
      console.error('❌ [CONTACT] Client auto-reply failed:',
        clientEmailResult.reason?.message || clientEmailResult.reason
      );
      res.status(502).json({
        success: false,
        message: 'Failed to send confirmation email. Please try again.'
      });
      return;
    }

    // Check if owner notification failed (log but don't block user)
    if (ownerEmailResult.status === 'rejected') {
      console.error('⚠️ [CONTACT] Owner notification failed:',
        ownerEmailResult.reason?.message || ownerEmailResult.reason
      );
      // Continue - user still gets confirmation
    }

    console.log(`✅ [${requestType}] Success - emails sent`);

    res.status(200).json({
      success: true,
      message: isDemoRequest
        ? 'Demo request received! We will contact you shortly to schedule a personalized walkthrough.'
        : 'Thanks for reaching out! We will contact you soon.',
    });

  } catch (err: any) {
    console.error('❌ [CONTACT] Unexpected error:', err?.message || err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}

/**
 * Generate HTML for contact form auto-reply
 */
function generateContactAutoReplyHTML(name: string, company?: string): string {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.6;color:#1e293b">
      <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
      <p>Thanks for reaching out to <strong>Cadster Technologies</strong>. Your message has been received.</p>
      ${company ? `<p>We'll review your request for <strong>${escapeHtml(company)}</strong> and get back to you shortly.</p>` : ''}
      <p style="margin-top:20px">Best regards,<br/><strong>Team Cadster</strong></p>
      <hr style="margin:24px 0;border:0;border-top:1px solid #e2e8f0"/>
      <p style="font-size:12px;color:#64748b">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;
}

/**
 * Generate HTML for demo request auto-reply
 */
function generateDemoAutoReplyHTML(name: string, company?: string): string {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.6;color:#1e293b">
      <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
      <p>Thanks for requesting a <strong>demo of Cadster Technologies</strong>! 🎯</p>
      <p>Your request has been received and our team will reach out to you shortly to schedule a personalized walkthrough.</p>
      ${company ? `<p>We're excited to show you how Cadster can transform <strong>${escapeHtml(company)}</strong>'s design automation workflow.</p>` : ''}
      <p style="margin-top:20px">Best regards,<br/><strong>Team Cadster</strong></p>
      <hr style="margin:24px 0;border:0;border-top:1px solid #e2e8f0"/>
      <p style="font-size:12px;color:#64748b">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;
}

/**
 * Generate HTML for owner notification email
 */
function generateOwnerNotificationHTML(
  name: string,
  email: string,
  company: string | undefined,
  message: string,
  isDemoRequest: boolean
): string {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.6">
      <h3 style="color:#0f172a;margin-bottom:16px">
        ${isDemoRequest ? '🎯 New Demo Request' : '📬 New Contact Submission'}
      </h3>
      
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr style="background:#f1f5f9">
          <td style="padding:12px;border:1px solid #e2e8f0;font-weight:600">Name</td>
          <td style="padding:12px;border:1px solid #e2e8f0">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:12px;border:1px solid #e2e8f0;font-weight:600">Email</td>
          <td style="padding:12px;border:1px solid #e2e8f0">
            <a href="mailto:${escapeHtml(email)}" style="color:#0ea5e9">${escapeHtml(email)}</a>
          </td>
        </tr>
        <tr style="background:#f1f5f9">
          <td style="padding:12px;border:1px solid #e2e8f0;font-weight:600">Company</td>
          <td style="padding:12px;border:1px solid #e2e8f0">${escapeHtml(company || '-')}</td>
        </tr>
        <tr>
          <td style="padding:12px;border:1px solid #e2e8f0;font-weight:600">Time</td>
          <td style="padding:12px;border:1px solid #e2e8f0">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
        </tr>
      </table>

      <div style="margin-top:20px">
        <strong style="color:#0f172a">Message:</strong>
        <pre style="white-space:pre-wrap;background:#0f172a;padding:16px;border-radius:8px;color:#e5e7eb;font-family:monospace;margin-top:8px">${escapeHtml(message)}</pre>
      </div>

      ${isDemoRequest ? `
        <div style="margin-top:24px;padding:16px;background:#dbeafe;border-left:4px solid #3b82f6;border-radius:4px">
          <strong style="color:#1e40af">⚡ Action Required:</strong>
          <p style="margin:8px 0 0 0;color:#1e3a8a">This is a demo request. Please reach out to schedule a walkthrough within 24 hours.</p>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS in email templates
 */
function escapeHtml(str: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(str).replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}
