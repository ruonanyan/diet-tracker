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
    ? `\nFrequent foods list — if ANY food mentioned closely matches an item here (including "MY [food]" shorthand, casual names, or abbreviations), use EXACT macros from the list rather than estimating.\nScaling rules — always use the serving column as the base unit:\n- Match units directly: if serving is "3 cups" and user says "1 cup", scale by 1/3. If serving is "1 oz" and user says "2 oz", scale by 2.\n- If user specifies grams and serving has a gram amount, scale by gram ratio.\n- For relative amounts with no unit: "half" = ÷2, "2x" = ×2, etc.\n- Never guess gram weights from volume units (cups, oz, tbsp) — use the serving ratio instead.\n${frequentFoods.map(f => {
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
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: (() => {
          const prompt = `You are a nutrition and fitness expert. Determine if the following is about FOOD/DRINK or a WORKOUT/EXERCISE, then return ONLY a JSON object — no explanation, no markdown.

User stats: ${gender}, age ${age}, ${weight_lbs} lbs (${weight_kg} kg), ${height_str}. TDEE baseline: ${tdee} kcal/day.${frequentFoodsBlock}

If it's FOOD, return:
{"type": "food", "item": "concise overall description", "items": [{"name": "item name", "calories": number, "protein": number, "carbs": number, "fat": number}], "calories": number, "protein": number, "carbs": number, "fat": number, "reasoning": "2-3 sentences: what source was used for each item (frequent foods list + scaling, general knowledge, image estimate), any assumptions made about portion or preparation"}

Rules for the "items" array:
- Break down EVERY distinct ingredient or component into its own entry.
- The top-level calories/protein/carbs/fat MUST equal the sum of all items.
- If only one food is mentioned, items has exactly one entry.
- If a food matches or closely resembles any item in the frequent foods list above, use those EXACT macros (including for "MY [food]" shorthand). Scale proportionally for fractions or multiples.
- If an image is provided, identify all visible food items and estimate portions from visual cues.

If it's a WORKOUT, return:
{"type": "workout", "notes": "concise workout description", "burn_value": number, "reasoning": "show the exact calculation: list each component's cal/min × minutes, sum, then × 1.10 EPOC, e.g. strength: 60×3.5=210, cardio: 1×8.99+13×6.95+7×3.32=122, total: 332×1.10=365"}

Workout calculation rules:
- burn_value = exercise_calories × 1.10 (EPOC afterburn). Always apply ×1.10 to your final number.
- Do NOT include the ${tdee} kcal TDEE baseline. Do NOT use gross MET-based burn — use NET additional calories above baseline only.
- Karvonen cal/min for this user (already net, already calibrated): Peak = 8.99, Vigorous = 6.95, Moderate = 3.32.
- Strength training NET cal/min for this user (${weight_lbs} lbs, ${gender}): upper body = 3.5 cal/min, lower body = 4.5 cal/min, full body = 4.0 cal/min.
- For mixed sessions, sum each component's exercise_calories first, then apply ×1.10 once at the end.

Worked example — "1 hour upper body strength + 1 min peak + 13 min vigorous + 7 min moderate":
  strength: 60 × 3.5 = 210 cal
  cardio:   (1 × 8.99) + (13 × 6.95) + (7 × 3.32) = 9 + 90 + 23 = 122 cal
  total exercise: 210 + 122 = 332 cal
  burn_value: round(332 × 1.10) = 365

Use this exact method. Do not use internet-sourced calorie estimates.

Calories, carbs, and fat are integers. Protein may have one decimal place (e.g. 0.3) — do not round protein to 0 if the actual value is between 0.1 and 0.9.
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
