import { useState } from 'react'
import OpenAI from 'openai'

export default function useOpenAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rawResponse, setRawResponse] = useState(null)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const client = apiKey
    ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
    : null

  const lookUpBottle = async (bottleName) => {
    if (!client) {
      setError('OpenAI API key is missing.')
      return null
    }
    setLoading(true)
    setError(null)
    setRawResponse(null)

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert bourbon and American whiskey sommelier with encyclopedic knowledge of distilleries, brands, expressions, and releases. When given a bourbon or whiskey bottle name, return a JSON object with accurate details. Always respond ONLY with valid JSON and nothing else. If a field is unknown, use null. Do not fabricate information.',
          },
          {
            role: 'user',
            content: `Look up this bourbon/whiskey bottle and return a JSON object with the following fields:
name, distillery, brand, type, age (number or null), proof (number), abv (number), mashbill (string), distillationStyle (string), maturation (string), region (string), msrp (number or null), releaseYear (number or null), limitedRelease (boolean), description (2-3 sentences).

Bottle: "${bottleName}"`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      })

      const content = response.choices[0]?.message?.content
      setRawResponse(content || '')
      return content ? { data: JSON.parse(content), raw: content } : null
    } catch (err) {
      setError(err.message || 'Lookup failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { lookUpBottle, loading, error, rawResponse }
}
