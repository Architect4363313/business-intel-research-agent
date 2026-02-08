export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { email } = body || {};

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const API_KEY = process.env.ABSTRACT_EMAIL_API_KEY;

  if (!API_KEY) {
    console.error('ABSTRACT_EMAIL_API_KEY not configured');
    return res.status(500).json({ error: 'Email verification API key not configured' });
  }

  try {
    const response = await fetch(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Abstract API error:', errorData);
      return res.status(response.status).json({ error: 'Email verification API error' });
    }

    const data = await response.json();

    const verified = data.deliverability === 'DELIVERABLE';
    const status = data.deliverability || 'UNKNOWN';
    const statusDetail = verified
      ? 'Email address is safe to send to'
      : `Email deliverability: ${status}`;

    return res.status(200).json({
      email,
      verified,
      status,
      statusDetail
    });
  } catch (error) {
    console.error('Email Verification Error:', error);
    return res.status(500).json({
      error: 'Failed to verify email',
      email,
      verified: false,
      status: 'ERROR',
      statusDetail: error.message
    });
  }
}
