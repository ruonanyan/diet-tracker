import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://njvbkhhtpmsghggqmbsg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdmJraGh0cG1zZ2hnZ3FtYnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjM4MzksImV4cCI6MjEwMTY5OTgzOX0.Cy12ZdMgCMOkhWZqPhNn0S2SUsFDJP5MF5bt6-arjcg';

function twiml(message) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
}

function fmtMacro(v) {
  const n = parseFloat(v) || 0;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function todayDate() {
  // Returns YYYY-MM-DD in local time
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Twilio sends form-encoded; handle both parsed and raw string body
  const body = typeof req.body === 'string'
    ? Object.fromEntries(new URLSearchParams(req.body))
    : req.body || {};

  const from = body.From || '';
  const text = (body.Body || '').trim();

  // Whitelist: only your number can log
  const allowed = process.env.ALLOWED_PHONE;
  if (allowed && from !== allowed) {
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml('Not authorized.'));
  }

  if (!text) {
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml('Send a food description or workout to log it.'));
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch profile + frequent foods in parallel
  const [{ data: profileData }, { data: frequentFoods }] = await Promise.all([
    supabase.from('user_profile').select('*').eq('id', 1).single(),
    supabase.from('frequent_foods').select('*').order('name'),
  ]);

  const p = profileData || {};
  const age = p.age ?? 35;
  const gender = p.gender ?? 'female';
  const weight_lbs = p.weight_lbs ?? 156;
  const height_in = p.height_in ?? 64;
  const tdee = p.tdee ?? 1717;
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
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml('Server error: API key not configured.'));
  }

  const prompt = `You are a nutrition and fitness expert. Determine if the following is about FOOD/DRINK or a WORKOUT/EXERCISE, then return ONLY a JSON object — no explanation, no markdown.

User stats: ${gender}, age ${age}, ${weight_lbs} lbs (${weight_kg} kg), ${height_str}. TDEE baseline: ${tdee} kcal/day.${frequentFoodsBlock}

If it's FOOD, return:
{"type": "food", "item": "concise overall description", "calories": number, "protein": number, "carbs": number, "fat": number}

If it's a WORKOUT, return:
{"type": "workout", "notes": "concise workout description", "burn_value": number}

Workout calculation rules:
- burn_value = exercise_calories × 1.10 (EPOC afterburn).
- Do NOT include the ${tdee} kcal TDEE baseline. Use NET additional calories only.
- Karvonen cal/min for this user: Peak = 8.99, Vigorous = 6.95, Moderate = 3.32.
- Strength training NET cal/min: upper body = 3.5 cal/min, lower body = 4.5 cal/min, full body = 4.0 cal/min.

If a food matches the frequent foods list, use EXACT macros (scale if grams specified).
Calories, carbs, fat are integers. Protein may have one decimal place.

Text: "${text}"`;

  let parsed;
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await claudeRes.json();
    const raw = data.content?.[0]?.text?.trim() || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    parsed = JSON.parse(match[0]);
    if (!parsed.type) throw new Error('Missing type');
  } catch {
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml("Couldn't parse that. Try again with more detail."));
  }

  const date = todayDate();

  if (parsed.type === 'food') {
    const { error } = await supabase.from('food_log').insert({
      date,
      item: parsed.item,
      calories: parsed.calories || 0,
      protein: parsed.protein || 0,
      carbs: parsed.carbs || 0,
      fat: parsed.fat || 0,
    });
    if (error) {
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml('DB error saving entry.'));
    }
    const reply = `✓ Logged: ${parsed.item}\n${parsed.calories} cal · ${fmtMacro(parsed.protein)}g protein · ${parsed.carbs}g carbs · ${parsed.fat}g fat`;
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml(reply));
  }

  if (parsed.type === 'workout') {
    const { error } = await supabase.from('workouts').insert({
      date,
      burn_value: parsed.burn_value || 0,
      notes: parsed.notes || '',
    });
    if (error) {
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml('DB error saving workout.'));
    }
    const reply = `✓ Workout logged: ${parsed.notes}\n+${parsed.burn_value} cal burn`;
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml(reply));
  }

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml("Couldn't classify that as food or workout."));
}
