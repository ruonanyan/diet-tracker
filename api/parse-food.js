export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description } = req.body || {};
  if (!description) {
    return res.status(400).json({ error: 'Description required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `You are a nutrition expert. Parse this food description and return ONLY a JSON object — no explanation, no markdown.

Required fields:
{"item": "concise food description", "calories": number, "protein": number, "carbs": number, "fat": number}

All numbers are integers. Estimate based on typical serving sizes.

Food: "${description}"`
      }]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(500).json({ error: data.error?.message || 'Claude API error' });
  }

  try {
    const text = data.content[0].text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');
    const parsed = JSON.parse(match[0]);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'Could not parse response' });
  }
}
