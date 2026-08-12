export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description, userStats, frequentFoods, images } = req.body || {};
  if (!description && (!images || images.length === 0)) {
    return res.status(400).json({ error: 'Description or image required' });
  }

  const age = userStats?.age ?? 35;
  const gender = userStats?.gender ?? 'female';
  const weight_lbs = userStats?.weight_lbs ?? 156;
  const height_in = userStats?.height_in ?? 64;
  const tdee = userStats?.tdee ?? 1717;
  const height_str = `${Math.floor(height_in / 12)}'${height_in % 12}"`;
  const weight_kg = (weight_lbs * 0.453592).toFixed(1);

  const frequentFoodsBlock = frequentFoods?.length
    ? `\nFrequent foods list — if ANY food mentioned closely matches an item here (including "MY [food]" shorthand, casual names, or abbreviations), use EXACT macros from the list rather than estimating.\nScaling rules:\n- If a gram amount is specified and the entry has a serving size in grams, scale: (user_grams ÷ serving_grams) × macros_per_serving.\n- For fractions/multiples with no gram amount: "half" = ÷2, "2x" = ×2, etc.\n${frequentFoods.map(f => {
        const servingInfo = f.serving_grams ? ` (per ${f.serving_grams}g)` : f.serving ? ` (per ${f.serving})` : '';
        return `- ${f.name}${servingInfo}: ${f.calories} cal, ${f.protein}g protein, ${f.carbs ?? 0}g carbs, ${f.fat ?? 0}g fat`;
      }).join('\n')}\n`
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
        content: (() => {
          const prompt = `You are a nutrition and fitness expert. Determine if the following is about FOOD/DRINK or a WORKOUT/EXERCISE, then return ONLY a JSON object — no explanation, no markdown.

User stats: ${gender}, age ${age}, ${weight_lbs} lbs (${weight_kg} kg), ${height_str}. TDEE baseline: ${tdee} kcal/day.${frequentFoodsBlock}

If it's FOOD, return:
{"type": "food", "item": "concise overall description", "items": [{"name": "item name", "calories": number, "protein": number, "carbs": number, "fat": number}], "calories": number, "protein": number, "carbs": number, "fat": number}

Rules for the "items" array:
- Break down EVERY distinct ingredient or component into its own entry.
- The top-level calories/protein/carbs/fat MUST equal the sum of all items.
- If only one food is mentioned, items has exactly one entry.
- If a food matches or closely resembles any item in the frequent foods list above, use those EXACT macros (including for "MY [food]" shorthand). Scale proportionally for fractions or multiples.
- If an image is provided, identify all visible food items and estimate portions from visual cues.

If it's a WORKOUT, return:
{"type": "workout", "notes": "concise workout description", "burn_value": number}

Workout calculation rules:
- burn_value = workout calories × 1.10 (EPOC afterburn). Always include the ×1.10 multiplier in your final number.
- Do NOT include the ${tdee} kcal TDEE baseline — only the workout's contribution.
- If heart-rate zone minutes are given, use Karvonen to get exercise calories first: Peak (~168 bpm) = 8.99 cal/min, Vigorous (~149 bpm) = 6.95 cal/min, Moderate (~115 bpm) = 3.32 cal/min. Then multiply total by 1.10.
- For strength/resistance training without HR zone data, estimate for this user (${weight_lbs} lbs, ${gender}): light lifting ~3.5 cal/min, moderate lifting ~4.5 cal/min, heavy compound lifts ~5.5 cal/min. Then multiply by 1.10.
- If a session includes both cardio (with HR zones) AND strength training, calculate each separately, sum the exercise calories, then multiply the total by 1.10.
- If no zone or activity detail is given, estimate based on type, duration, and intensity, then apply ×1.10.

All numbers are integers.
${description ? `\nText description: "${description}"` : ''}`;

          if (images?.length > 0) {
            return [
              ...images.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.mediaType || 'image/jpeg', data: img.base64 } })),
              { type: 'text', text: prompt },
            ];
          }
          return prompt;
        })()
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
