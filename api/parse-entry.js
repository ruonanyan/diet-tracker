function parseServingQty(serving) {
  if (!serving) return null;
  const m = serving.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
  if (!m) return null;
  const qty = parseFloat(m[1]);
  return qty > 1 ? { qty, unit: m[2].trim() } : null;
}

function buildFoodsBlock(frequentFoods) {
  if (!frequentFoods?.length) return '';
  const lines = frequentFoods.map(f => {
    const parsed = parseServingQty(f.serving);
    if (parsed) {
      const r = 1 / parsed.qty;
      const cal   = Math.round(f.calories * r);
      const prot  = Math.round(parseFloat(f.protein) * r * 10) / 10;
      const carbs = Math.round((f.carbs ?? 0) * r);
      const fat   = Math.round((f.fat ?? 0) * r);
      return `- ${f.name} (per 1 ${parsed.unit}): ${cal} cal, ${prot}g protein, ${carbs}g carbs, ${fat}g fat`;
    }
    const info = f.serving_grams ? ` (per ${f.serving_grams}g)` : f.serving ? ` (per ${f.serving})` : '';
    return `- ${f.name}${info}: ${f.calories} cal, ${f.protein}g protein, ${f.carbs ?? 0}g carbs, ${f.fat ?? 0}g fat`;
  });

  return `
Frequent foods list — macros are normalized to ONE unit. Use EXACT values; scale only by quantity.
Scaling: if list shows "per 1 cup" and user says "2 cups", multiply ×2. If grams, scale by gram ratio. "half" = ×0.5.
${lines.join('\n')}
`;
}

function buildPrompt({ gender, age, weight_lbs, weight_kg, height_str, tdee, foodsBlock, description }) {
  return `You are a nutrition and fitness expert. Determine if the following is about FOOD/DRINK or a WORKOUT/EXERCISE, then return ONLY a JSON object — no explanation, no markdown.

User stats: ${gender}, age ${age}, ${weight_lbs} lbs (${weight_kg} kg), ${height_str}. TDEE baseline: ${tdee} kcal/day.${foodsBlock}
If it's FOOD, return:
{"type":"food","item":"concise description","items":[{"name":"item","calories":0,"protein":0,"carbs":0,"fat":0}],"calories":0,"protein":0,"carbs":0,"fat":0,"reasoning":"2-3 sentences on sources, scaling, assumptions"}

Rules for items array:
- Break down every distinct ingredient into its own entry. Top-level totals must equal sum of items.
- Match frequent foods list exactly (including "MY [food]" shorthand). Scale by quantity.
- If image provided, identify all visible foods and estimate portions visually.

If it's a WORKOUT, return:
{"type":"workout","notes":"concise description","burn_value":0,"reasoning":"exact calc: e.g. strength: 60×3.5=210, cardio: 1×8.99+13×6.95+7×3.32=122, total: 332×1.10=365"}

Workout rules:
- burn_value = exercise_calories × 1.10 (EPOC). Apply ×1.10 once at the end.
- Do NOT include ${tdee} kcal TDEE. Use NET additional calories only. Do not use MET estimates.
- Karvonen cal/min (net, calibrated): Peak=8.99, Vigorous=6.95, Moderate=3.32.
- Strength cal/min (${weight_lbs} lbs, ${gender}): upper=3.5, lower=4.5, full body=4.0.
- If HR zones cover only the cardio portion, add strength and cardio separately.
- If HR zones cover the ENTIRE workout (e.g. "total heart rate zone"), use zones as the base PLUS a strength bonus for the calories HR misses:
    strength_bonus = strength_minutes × (strength_cal_min − 3.32)
    total = (zone_calories + strength_bonus) × 1.10
- Example (zones for cardio only) — "1hr upper body + 1min peak + 13min vigorous + 7min moderate":
  strength: 60×3.5=210, cardio: (1×8.99)+(13×6.95)+(7×3.32)=122, total: 332×1.10=365
- Example (zones for entire workout) — "50min lower body + 20min run. Total HR zone: 11min peak, 9min vigorous, 40min moderate":
  zones: (11×8.99)+(9×6.95)+(40×3.32)=294, strength bonus: 50×(4.5−3.32)=59, total: (294+59)×1.10=389

Calories/carbs/fat are integers. Protein may have one decimal (e.g. 0.3).
${description ? `\nText: "${description}"` : ''}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description, userStats, frequentFoods, images } = req.body || {};
  if (!description && !images?.length) return res.status(400).json({ error: 'Description or image required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const age        = userStats?.age ?? 35;
  const gender     = userStats?.gender ?? 'female';
  const weight_lbs = userStats?.weight_lbs ?? 156;
  const height_in  = userStats?.height_in ?? 64;
  const tdee       = userStats?.tdee ?? 1717;
  const height_str = `${Math.floor(height_in / 12)}'${height_in % 12}"`;
  const weight_kg  = (weight_lbs * 0.453592).toFixed(1);

  const prompt = buildPrompt({
    gender, age, weight_lbs, weight_kg, height_str, tdee,
    foodsBlock: buildFoodsBlock(frequentFoods),
    description,
  });

  const content = images?.length
    ? [...images.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.mediaType || 'image/jpeg', data: img.base64 } })), { type: 'text', text: prompt }]
    : prompt;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1500, messages: [{ role: 'user', content }] }),
  });

  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: data.error?.message || 'Claude API error' });

  try {
    const text  = data.content[0].text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    const parsed = JSON.parse(match[0]);
    if (!parsed.type) throw new Error('Missing type');
    return res.status(200).json(parsed);
  } catch {
    return res.status(500).json({ error: 'Could not parse response' });
  }
}
