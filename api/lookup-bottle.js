export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bottleName } = req.body || {}
  if (!bottleName) {
    return res.status(400).json({ error: 'Missing bottleName' })
  }

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
              'You are an expert bourbon and American whiskey sommelier with encyclopedic knowledge of distilleries, brands, expressions, and releases. When given a bourbon or whiskey bottle name, return a JSON object with accurate details. Always respond ONLY with valid JSON and nothing else. If a field is unknown, use null. Do not fabricate information.',
          },
          {
            role: 'user',
            content: `Look up this bourbon/whiskey bottle and return a JSON object with the following fields:\nname, distillery, brand, type, age (number or null), proof (number), abv (number), mashbill (string), distillationStyle (string), maturation (string), region (string), msrp (number or null), releaseYear (number or null), limitedRelease (boolean), description (2-3 sentences).\n\nBottle: "${bottleName}"`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
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
