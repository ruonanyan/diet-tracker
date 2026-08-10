export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description, userStats, frequentFoods } = req.body || {};
  if (!description) {
    return res.status(400).json({ error: 'Description required' });
  }

  const age = userStats?.age ?? 35;
  const gender = userStats?.gender ?? 'female';
  const weight_lbs = userStats?.weight_lbs ?? 156;
  const height_in = userStats?.height_in ?? 64;
  const tdee = userStats?.tdee ?? 1717;
  const height_str = `${Math.floor(height_in / 12)}'${height_in % 12}"`;
  const weight_kg = (weight_lbs * 0.453592).toFixed(1);

  const frequentFoodsBlock = frequentFoods?.length
    ? `\nFrequent foods list (use EXACT macros for "MY [food]" references, scale proportionally for fractions):\n${frequentFoods.map(f => `- ${f.name}: ${f.calories} cal, ${f.protein}g protein, ${f.carbs ?? 0}g carbs, ${f.fat ?? 0}g fat`).join('\n')}\n`
    : '';

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
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a nutrition and fitness expert. Determine if the following description is about FOOD/DRINK or a WORKOUT/EXERCISE, then return ONLY a JSON object — no explanation, no markdown.

User stats: ${gender}, age ${age}, ${weight_lbs} lbs (${weight_kg} kg), ${height_str}. TDEE baseline: ${tdee} kcal/day.${frequentFoodsBlock}

If it's FOOD, return:
{"type": "food", "item": "concise overall description", "items": [{"name": "item name", "calories": number, "protein": number, "carbs": number, "fat": number}], "calories": number, "protein": number, "carbs": number, "fat": number}

Rules for the "items" array:
- Break down EVERY distinct ingredient or component into its own entry.
- The top-level calories/protein/carbs/fat MUST equal the sum of all items.
- If only one food is mentioned, items has exactly one entry.
- For "MY [food]" references, use the exact macros from the frequent foods list above.

If it's a WORKOUT, return:
{"type": "workout", "notes": "concise workout description", "burn_value": number}

Workout calculation rules:
- burn_value = calories burned FROM THE WORKOUT ONLY, not including the ${tdee} kcal TDEE baseline.
- The app will apply ×1.10 EPOC multiplier on top of your estimate, so do NOT include EPOC in your number.
- If heart-rate zone minutes are given, use the Karvonen formula: Peak (~168 bpm) = 8.99 cal/min, Vigorous (~149 bpm) = 6.95 cal/min, Moderate (~115 bpm) = 3.32 cal/min.
- If no zone data is given, estimate based on activity type, duration, and intensity.

All numbers are integers.

Description: "${description}"`
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
    if (!parsed.type) throw new Error('Missing type field');
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'Could not parse response' });
  }
}
