import { GLOBAL_CSS } from "../styles.js";
import { TDEE, DEFICIT_TARGET, PROTEIN_TARGET } from "../constants.js";

export default function CalcPage({ onBack, tdee = TDEE }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap rules-page">
        <button className="back-link" onClick={onBack}>← Back</button>
        <h1>Calculation rule</h1>
        <p className="subtitle">How Eaten, Burn, Deficit & targets are calculated</p>

        <h2>Rest-day baseline</h2>
        <p>Your rest-day baseline is <span className="num">{tdee.toLocaleString()} kcal/day</span> — this is your estimated maintenance energy with no workout, made up of your RMR (Katch-McArdle) plus non-exercise activity. On days with no logged workout, this is your full "Burn" for the day.</p>

        <h2>Workout days</h2>
        <p>When you log a workout, its estimated burn (kcal) is added on top of the baseline — scaled up by <span className="num">×1.10</span> to account for EPOC (the "afterburn" effect where your metabolism stays elevated for hours after exercise).</p>
        <p><span className="num">Burn = {tdee.toLocaleString()} + (workout burn × 1.10)</span></p>
        <p>Workout burn itself is estimated using your heart-rate zone minutes via the Karvonen HR formula.</p>

        <h2>Eaten & target</h2>
        <p>"Eaten" is the sum of calories from everything logged for the day. The grey number underneath is your target intake, calculated as:</p>
        <p><span className="num">Target = Burn − {DEFICIT_TARGET}</span></p>
        <p>The {DEFICIT_TARGET} kcal gap is your daily goal deficit.</p>

        <h2>Deficit</h2>
        <p><span className="num">Deficit = Burn − Eaten</span></p>
        <ul>
          <li><strong>Green (−):</strong> you're under your burn — on track for fat loss, aiming for ≥{DEFICIT_TARGET}/day.</li>
          <li><strong>Red (+):</strong> you ate more than you burned (a surplus) that day.</li>
        </ul>
        <p>Goal deficit of {DEFICIT_TARGET} kcal/day corresponds to roughly 0.6 lbs/week of fat loss, on average over time (single-day numbers will vary).</p>

        <h2>Protein</h2>
        <p>Daily target is <span className="num">{PROTEIN_TARGET}–{PROTEIN_TARGET + 10}g</span>, prioritized ahead of carbs/fat.</p>

        <h2>Notes on accuracy</h2>
        <ul>
          <li>Food calories are mostly visual/portion estimates, not weighed — expect ±15–20% error per meal.</li>
          <li>Workout burns rely on Fitbit HR-zone minutes; actual zone averages may differ from assumptions used.</li>
          <li>The baseline ({tdee.toLocaleString()}) is a formula estimate — if weight trends don't match predictions after a few weeks, it should be recalibrated.</li>
        </ul>
      </div>
    </div>
  );
}
