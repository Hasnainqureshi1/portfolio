import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = process.env.TO_EMAIL || 'hasnainqureshi134@gmail.com';

    const meta = `UTM Source: ${utm_source || 'n/a'}\nUTM Medium: ${utm_medium || 'n/a'}\nUTM Campaign: ${utm_campaign || 'n/a'}\nUTM Term: ${utm_term || 'n/a'}\nUTM Content: ${utm_content || 'n/a'}\nReferrer: ${referrer || 'n/a'}\n\n`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Portfolio contact from ${name}`,
      text: `${meta}Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
