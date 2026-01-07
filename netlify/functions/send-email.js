const nodemailer = require('nodemailer');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, message, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer } = body;
  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
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

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Send email error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send' }) };
  }
};
