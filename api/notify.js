export default async function handler(req, res) {
  // CORSヘッダーの設定（管理画面からのリクエストを許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // プリフライトリクエスト（OPTIONS）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, number } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'LINE User ID is required' });
  }

  // LINE Messaging API への送信処理
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: `【お呼び出し】\n整理券番号 ${number} 番のお客様、順番が来ましたので受付までお越しください。`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE API Error:', errorData);
      return res.status(response.status).json(errorData);
    }

    return res.status(200).json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
