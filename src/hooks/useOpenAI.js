import { useState } from 'react'
import OpenAI from 'openai'

export default function useOpenAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rawResponse, setRawResponse] = useState(null)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const apiUrl = import.meta.env.VITE_OPENAI_API_URL
  const suggestApiUrl = import.meta.env.VITE_OPENAI_SUGGEST_API_URL
  const client = apiKey
    ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
    : null

  const lookUpBottle = async (bottleName) => {
    if (!apiUrl && !client) {
      setError('OpenAI API key is missing.')
      return null
    }
    setLoading(true)
    setError(null)
    setRawResponse(null)

    try {
      if (apiUrl) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bottleName }),
        })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Lookup failed')
        }
        const payload = await response.json()
        const content = payload.content
        setRawResponse(content || '')
        return content ? { data: JSON.parse(content), raw: content } : null
      }

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

  const suggestWishlist = async (profile) => {
    if (!suggestApiUrl && !client) {
      setError('OpenAI API key is missing.')
      return null
    }
    setLoading(true)
    setError(null)
    setRawResponse(null)

    try {
      if (suggestApiUrl) {
        const response = await fetch(suggestApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Suggestion failed')
        }
        const payload = await response.json()
        const content = payload.content
        setRawResponse(content || '')
        return content ? JSON.parse(content) : null
      }

      const response = await client.chat.completions.create({
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
      })

      const content = response.choices[0]?.message?.content
      setRawResponse(content || '')
      return content ? JSON.parse(content) : null
    } catch (err) {
      setError(err.message || 'Suggestion failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { lookUpBottle, suggestWishlist, loading, error, rawResponse }
}
