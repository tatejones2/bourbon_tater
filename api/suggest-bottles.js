export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { profile } = body || {}

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing OpenAI API key' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert bourbon and American whiskey curator. Given a user profile, return a JSON object with a key "suggestions" that is an array of 6-8 bottles. Each item must include: name, distillery, type, reason (1 sentence), msrp (number or null). If unknown, use null. Respond ONLY with valid JSON.',
          },
          {
            role: 'user',
            content: `Suggest bourbon or American whiskey bottles for this wishlist profile. Profile: ${profile || 'General bourbon enthusiast looking for a balanced mix of classics and special releases.'}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return res.status(response.status).json({ error: errorBody })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    return res.status(200).json({ content })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
