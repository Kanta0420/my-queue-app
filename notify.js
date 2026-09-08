export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { lineUserId, shopName, ticketNumber } = req.body;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not set.' });
  }

  if (!lineUserId) {
    return res.status(400).json({ error: 'lineUserId is required.' });
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: `🔔【${shopName || '店舗'}】\n整理券番号: ${ticketNumber} 番のお客さま\n\nまもなく順番です。受付へお越しください！`
          }
        ]
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, result: data });
    } else {
      return res.status(response.status).json({ error: data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}