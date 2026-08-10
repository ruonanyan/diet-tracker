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
        content: `You are a fitness expert. Estimate the extra calorie burn from this workout. Return ONLY a JSON object — no explanation, no markdown.

User stats: female, age 35, 156 lbs (70.8 kg), 5'4" (163 cm).

Calculation rules:
- burn_value = calories burned FROM THE WORKOUT ONLY, not including the TDEE baseline of 1,717 kcal/day.
- The app will apply ×1.10 EPOC multiplier on top of your estimate to account for afterburn effect, so do NOT include EPOC in your number.
- If heart-rate zone minutes are given, use the Karvonen formula: Peak (~168 bpm) = 8.99 cal/min, Vigorous (~149 bpm) = 6.95 cal/min, Moderate (~115 bpm) = 3.32 cal/min.
- If no zone data is given, estimate based on activity type, duration, and intensity described.

Required fields:
{"burn_value": number, "notes": "concise workout description"}

notes = short label like "45 min run + 20 min weights"

Workout: "${description}"`
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
