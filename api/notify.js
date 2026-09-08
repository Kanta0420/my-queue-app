export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { shopName, ticketNumber, lineUserId } = req.body;

  if (!lineUserId) {
    return res.status(400).json({ error: 'LINE User IDが届いていません' });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'トークンがVercelで読み込めていません' });
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: `【${shopName || '店舗'}】\nお呼び出しいたします。\n整理券番号: ${ticketNumber}番\n\nお近くの受付までお越しください！`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'LINE送信失敗', detail: data });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: 'サーバー内部エラー', message: error.message });
  }
}
