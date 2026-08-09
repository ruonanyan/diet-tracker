import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const TDEE = 1717;
const PROTEIN_TARGET = 120;
const DEFICIT_TARGET = 300;
const MEAL_TIMES = ["morning", "midday", "lunch", "afternoon", "dinner", "evening", "night"];
const EPOC = 1.10;

// Known gram weights per serving for smoothie calculator
const SERVING_GRAMS = {
  "Lactaid Whole Milk": 240,
  "Naked Whey Protein Powder": 44,
  "Wyman's Frozen Mixed Berries": 140,
  "Frozen Mango chunks": 227,
  "Cocojune Organic Coconut Yogurt": 114,
  "Daisy 2% Cottage Cheese": 113,
  "Siggi's Vanilla Yogurt (0% fat)": 170,
  "Bob Evans Egg Whites": 46,
  "Fage 0% Greek Yogurt": 170,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d) => d.toISOString().split("T")[0];
function parseLocal(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function shiftDate(str, n) {
  const d = parseLocal(str);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}
function displayShort(str) {
  return parseLocal(str).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function displayFull(str) {
  return parseLocal(str).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f7f4ef; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }

  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.8rem; font-weight: 400; color: #2c2418; }
  .subtitle { font-family: 'DM Mono', monospace; font-size: 0.63rem; color: #9a8f7e; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; margin-bottom: 0.5rem; }

  /* Nav links */
  .page-links { display: flex; gap: 1.25rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
  .rules-link { font-family: 'DM Mono', monospace; font-size: 0.63rem; letter-spacing: 0.06em; color: #b07d3a; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0; }
  .rules-link:hover { color: #8a5f28; }
  .log-today-btn { font-family: 'DM Mono', monospace; font-size: 0.63rem; letter-spacing: 0.08em; text-transform: uppercase; background: none; border: 1px solid #3d3228; color: #3d3228; padding: 0.35rem 0.8rem; border-radius: 2px; cursor: pointer; margin-left: auto; }
  .log-today-btn:hover { background: #3d3228; color: #f7f4ef; }

  /* Summary table */
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl thead th { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; padding: 0 0.5rem 0.6rem; text-align: right; }
  .tbl thead th:first-child { text-align: left; }
  .tbl tbody tr { border-top: 1px solid #e8e2d8; cursor: pointer; transition: background 0.1s; }
  .tbl tbody tr:hover { background: #eee9e0; }
  .tbl tbody td { padding: 0.65rem 0.5rem; font-family: 'DM Mono', monospace; text-align: right; color: #6b5f52; vertical-align: middle; }
  .tbl tbody td:first-child { text-align: left; }
  .date-str { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #3d3228; }
  .cell-main { font-size: 1rem; color: #2c2418; font-weight: 500; line-height: 1.2; display: inline; }
  .cell-sub { font-size: 0.78rem; color: #b5a898; line-height: 1.2; display: block; margin-top: 0.1rem; }
  .deficit-pos { color: #3a7d44; font-weight: 500; font-size: 1rem; }
  .deficit-neg { color: #b84040; font-weight: 500; font-size: 1rem; }

  /* Back link */
  .back-link { font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #9a8f7e; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 1.25rem; display: inline-block; }
  .back-link:hover { color: #b07d3a; }

  /* Rules / info pages */
  .rules-page h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.15rem; font-weight: 400; color: #2c2418; margin: 1.25rem 0 0.4rem; }
  .rules-page h2:first-of-type { margin-top: 0; }
  .rules-page p { font-size: 0.88rem; line-height: 1.55; color: #4a4036; margin-bottom: 0.5rem; }
  .rules-page ul { margin: 0.3rem 0 0.5rem 1.1rem; }
  .rules-page li { font-size: 0.85rem; line-height: 1.55; color: #4a4036; margin-bottom: 0.25rem; }
  .rules-page .num { font-family: 'DM Mono', monospace; color: #b07d3a; }

  /* Sheet overlay */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 10; transition: opacity 0.3s ease; }
  .overlay.hidden { opacity: 0; }
  .sheet { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 16px 16px 0 0; z-index: 20; max-height: 82vh; overflow: hidden; box-shadow: 0 -4px 24px rgba(0,0,0,0.1); }
  .sheet-handle-zone { padding: 16px 0 12px; touch-action: none; cursor: grab; }
  .sheet-handle { width: 36px; height: 4px; background: #d6cfc4; border-radius: 2px; margin: 0 auto; }
  .sheet-panel { width: 50%; flex-shrink: 0; box-sizing: border-box; padding: 0 1.25rem 2.5rem; overflow-y: auto; max-height: calc(82vh - 36px); }
  .sheet-date { font-family: 'Playfair Display', Georgia, serif; font-size: 1.15rem; font-style: italic; color: #2c2418; margin-bottom: 0.9rem; }
  .sheet-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem; }
  .sheet-nav-btn { font-family: 'DM Mono', monospace; background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #9a8f7e; padding: 0 0.4rem; }
  .sheet-nav-btn:disabled { opacity: 0.2; cursor: default; }

  /* Stat cards */
  .sheet-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.25rem; }
  .stat-card { background: #f7f4ef; border-radius: 6px; padding: 0.6rem 0.75rem; }
  .stat-label { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; margin-bottom: 0.2rem; }
  .stat-val { font-family: 'Playfair Display', Georgia, serif; font-size: 1.3rem; color: #2c2418; line-height: 1.1; }
  .stat-val.amber { color: #b07d3a; }
  .stat-val.green { color: #3a7d44; }
  .stat-val.red { color: #b84040; }
  .stat-sub { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: #b5a898; margin-top: 0.1rem; }

  /* Workout row */
  .workout-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; padding: 0.6rem 0.75rem; background: #eaf2eb; border-radius: 6px; }
  .workout-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #3a7d44; flex: 1; letter-spacing: 0.04em; }
  .workout-edit-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: transparent; border: none; color: #3a7d44; cursor: pointer; text-decoration: underline; }
  .log-workout-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; border: 1px solid #3d3228; color: #3d3228; padding: 0.45rem 1rem; cursor: pointer; border-radius: 2px; margin-bottom: 1.25rem; }
  .log-workout-btn:hover { background: #3d3228; color: #f7f4ef; }

  /* Food entries */
  .section-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: #b5a898; margin-bottom: 0.6rem; }
  .meal-label { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase; color: #d6cfc4; margin: 0.65rem 0 0.2rem; }
  .sheet-entry { display: flex; align-items: baseline; gap: 0.5rem; padding: 0.6rem 0; border-bottom: 1px solid #f0ebe3; }
  .sheet-name { flex: 1; font-size: 0.86rem; color: #3d3228; line-height: 1.4; padding-right: 0.5rem; }
  .sheet-cal { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #b07d3a; white-space: nowrap; }
  .sheet-protein { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #6b5f52; white-space: nowrap; }
  .sheet-del { background: none; border: none; color: #d6cfc4; cursor: pointer; font-size: 1rem; padding: 0 0.1rem; line-height: 1; }
  .sheet-del:hover { color: #c0392b; }
  .sheet-empty { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #d6cfc4; padding: 1rem 0; }
  .sheet-add-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; background: transparent; border: 1px solid #d6cfc4; color: #9a8f7e; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; margin-top: 1rem; }
  .sheet-add-btn:hover { border-color: #b07d3a; color: #b07d3a; }

  /* Add form */
  .form { background: #f7f4ef; border: 1px solid #e8e2d8; border-radius: 3px; padding: 1rem; margin-top: 0.75rem; display: grid; gap: 0.65rem; }
  .form input, .form select { font-family: 'DM Mono', monospace; font-size: 0.78rem; background: #fff; border: 1px solid #d6cfc4; color: #2c2418; padding: 0.5rem 0.65rem; border-radius: 2px; width: 100%; }
  .form input:focus, .form select:focus { outline: none; border-color: #b07d3a; }
  .form-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; }
  .form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  .form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .btn-primary { font-family: 'DM Mono', monospace; font-size: 0.7rem; background: #b07d3a; color: #fff; border: none; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; }
  .btn-cancel { font-family: 'DM Mono', monospace; font-size: 0.7rem; background: transparent; color: #9a8f7e; border: 1px solid #d6cfc4; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; }

  /* Smoothie */
  .smth-search { position: relative; margin-top: 1.25rem; margin-bottom: 1.5rem; }
  .smth-input { width: 100%; padding: 0.55rem 0.75rem; font-family: 'DM Mono', monospace; font-size: 0.82rem; border: 1px solid #d8d0c4; border-radius: 6px; background: #faf8f5; color: #3d3228; outline: none; }
  .smth-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff; border: 1px solid #d8d0c4; border-radius: 6px; z-index: 100; max-height: 220px; overflow-y: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .smth-option { padding: 0.5rem 0.75rem; font-family: 'DM Mono', monospace; font-size: 0.78rem; color: #3d3228; cursor: pointer; border-bottom: 1px solid #f5f2ee; display: flex; justify-content: space-between; align-items: center; }
  .smth-option:hover { background: #f7f4ef; }
  .smth-option-sub { color: #b5a898; font-size: 0.68rem; margin-left: 0.75rem; flex-shrink: 0; }
  .smth-tbl { width: 100%; border-collapse: collapse; }
  .smth-tbl th { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; padding: 0 0.4rem 0.6rem; text-align: right; }
  .smth-tbl th:first-child { text-align: left; }
  .smth-tbl td { padding: 0.5rem 0.4rem; font-family: 'DM Mono', monospace; font-size: 0.76rem; color: #3d3228; vertical-align: middle; }
  .smth-tbl tr.entry-row { border-top: 1px solid #f0ebe3; }
  .smth-divider { border-top: 2px solid #d8d0c4; }
  .smth-total-row { background: #f7f4ef; }
  .smth-after-row { background: #eaf2eb; }
  .smth-num-input { width: 52px; font-family: 'DM Mono', monospace; font-size: 0.72rem; background: #fff; border: 1px solid #d6cfc4; color: #2c2418; padding: 0.18rem 0.3rem; border-radius: 2px; text-align: right; }
  .smth-unit { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #b5a898; margin-left: 0.2rem; }
  .smth-add-row-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.06em; color: #6b5f52; background: none; border: 1px solid #d6cfc4; border-radius: 3px; cursor: pointer; padding: 0.25rem 0.65rem; }
  .smth-add-row-btn:hover { border-color: #b07d3a; color: #b07d3a; }
  .smth-custom-input { width: 100%; font-family: 'DM Mono', monospace; font-size: 0.72rem; border: 1px solid #d8d0c4; border-radius: 3px; padding: 0.3rem 0.4rem; background: #faf8f5; }
  .smth-confirm-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: #2c2418; color: #fff; border: none; border-radius: 3px; padding: 0.25rem 0.4rem; cursor: pointer; margin-right: 0.2rem; }
  .smth-cancel-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: none; border: 1px solid #d6cfc4; color: #9a8f7e; border-radius: 3px; padding: 0.25rem 0.4rem; cursor: pointer; }
  .smth-generate-btn { font-family: 'DM Mono', monospace; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; border: none; padding: 0.55rem 1.25rem; border-radius: 3px; cursor: pointer; }
  .smth-copy-area { width: 100%; font-family: 'DM Mono', monospace; font-size: 0.75rem; background: #f5f0ea; border: 1px solid #d6cfc4; border-radius: 3px; padding: 0.5rem; color: #2c2418; resize: none; cursor: text; }

  /* Frequent foods table */
  .freq-tbl { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .freq-tbl th { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #b5a898; padding: 0 0.5rem 0.6rem; text-align: right; }
  .freq-tbl th:first-child { text-align: left; }
  .freq-tbl tr { border-top: 1px solid #e8e2d8; }
  .freq-tbl td { padding: 0.65rem 0.5rem; font-family: 'DM Mono', monospace; font-size: 0.82rem; color: #3d3228; }
  .freq-tbl td:not(:first-child) { text-align: right; }

  /* Workout form */
  .wk-form { background: #eaf2eb; border-radius: 6px; padding: 0.85rem; margin-bottom: 1rem; }
  .wk-karvonen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.6rem; }
  .wk-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: #5a9b64; display: block; margin-bottom: 0.2rem; }
  .wk-input { font-family: 'DM Mono', monospace; font-size: 0.78rem; background: #fff; border: 1px solid #a8d4ad; color: #2c2418; padding: 0.35rem 0.5rem; border-radius: 2px; width: 100%; }
  .wk-calc-btn { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: transparent; border: 1px solid #3a7d44; color: #3a7d44; padding: 0.3rem 0.75rem; border-radius: 2px; cursor: pointer; }
  .wk-save-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; background: #3a7d44; color: #fff; border: none; padding: 0.4rem 0.9rem; border-radius: 2px; cursor: pointer; }
  .wk-delete-btn { font-family: 'DM Mono', monospace; font-size: 0.68rem; background: none; border: 1px solid #c0392b; color: #c0392b; padding: 0.4rem 0.75rem; border-radius: 2px; cursor: pointer; }
`;

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const today = fmtDate(new Date());
  const [page, setPage] = useState(null); // null | "calc" | "frequent" | "smoothie"
  const [dayOpen, setDayOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [summaries, setSummaries] = useState([]);
  const [workoutsMap, setWorkoutsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [frequentFoods, setFrequentFoods] = useState([]);

  const fetchHome = useCallback(async () => {
    setLoading(true);
    const [{ data: food }, { data: work }] = await Promise.all([
      supabase.from("food_log").select("date, calories, protein").order("date", { ascending: false }),
      supabase.from("workouts").select("date, burn_value, notes"),
    ]);
    const byDate = {};
    for (const e of food || []) {
      if (!byDate[e.date]) byDate[e.date] = { calories: 0, protein: 0 };
      byDate[e.date].calories += e.calories || 0;
      byDate[e.date].protein += e.protein || 0;
    }
    setSummaries(Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])));
    const wm = {};
    for (const w of work || []) wm[w.date] = w;
    setWorkoutsMap(wm);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHome(); }, [fetchHome]);
  useEffect(() => {
    supabase.from("frequent_foods").select("*").order("name")
      .then(({ data }) => setFrequentFoods(data || []));
  }, []);

  function openDay(date) { setSelectedDate(date); setDayOpen(true); }

  // Today's context for smoothie calculator
  const todaySummary = summaries.find(([d]) => d === today);
  const todayCals = todaySummary ? todaySummary[1].calories : 0;
  const todayProtein = todaySummary ? todaySummary[1].protein : 0;
  const todayWorkout = workoutsMap[today];
  const todayBurn = TDEE + (todayWorkout ? todayWorkout.burn_value : 0);

  if (page === "calc") return <CalcPage onBack={() => setPage(null)} />;
  if (page === "frequent") return <FrequentPage frequentFoods={frequentFoods} onBack={() => setPage(null)} />;
  if (page === "smoothie") return (
    <SmoothiePage
      frequentFoods={frequentFoods}
      todayCals={todayCals} todayProtein={todayProtein} todayBurn={todayBurn}
      onBack={() => setPage(null)}
      onSaved={() => { setPage(null); fetchHome(); }}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef", fontFamily: "Georgia, serif", color: "#2c2418" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <h1>Calorie Tracker</h1>
        <p className="subtitle">Ruonan · 35F · 5'4" · 156 lbs</p>
        <div className="page-links">
          <button className="rules-link" onClick={() => setPage("calc")}>Calculation rule</button>
          <button className="rules-link" onClick={() => setPage("frequent")}>Frequently eat</button>
          <button className="rules-link" onClick={() => setPage("smoothie")}>Smoothie calculator</button>
        </div>

        <HomeAIBox onLogged={fetchHome} />

        {loading ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#b5a898" }}>Loading…</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Date</th>
                <th>Eaten</th>
                <th>Burn</th>
                <th>Deficit</th>
                <th>Protein</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map(([date, { calories, protein }]) => {
                const wk = workoutsMap[date];
                const burn = TDEE + (wk ? wk.burn_value : 0);
                const deficit = burn - calories; // positive = under = good
                return (
                  <tr key={date} onClick={() => openDay(date)}>
                    <td><span className="date-str">{displayShort(date)}</span></td>
                    <td>
                      <span className="cell-main">{calories.toLocaleString()}</span>
                      <span className="cell-sub">{(burn - DEFICIT_TARGET).toLocaleString()}</span>
                    </td>
                    <td>
                      {wk && <span style={{ fontSize: "15px", marginRight: "4px" }}>💪</span>}
                      <span className="cell-main">{burn.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={deficit >= 0 ? "deficit-pos" : "deficit-neg"}>
                        {deficit >= 0 ? "−" : "+"}{Math.abs(deficit)}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.88rem" }}>{protein}g</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {dayOpen && (
        <DaySheet
          date={selectedDate}
          workoutsMap={workoutsMap}
          frequentFoods={frequentFoods}
          onClose={() => { setDayOpen(false); fetchHome(); }}
        />
      )}
    </div>
  );
}

// ─── Day Sheet ────────────────────────────────────────────────────────────────
function DaySheet({ date: initialDate, workoutsMap, frequentFoods, onClose }) {
  const today = fmtDate(new Date());
  const [date, setDate] = useState(initialDate);
  const [entries, setEntries] = useState([]);
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subPage, setSubPage] = useState(null); // null | "food" | "workout"
  const [subPageActive, setSubPageActive] = useState(false);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const dragCurrentY = useRef(null);

  // Slide up on mount
  useEffect(() => { requestAnimationFrame(() => setOpen(true)); }, []);

  function closeSheet() {
    setOpen(false);
    setTimeout(onClose, 320);
  }

  function openSubPage(type) {
    setSubPage(type);
    requestAnimationFrame(() => setSubPageActive(true));
  }

  function closeSubPage() {
    setSubPageActive(false);
    setTimeout(() => setSubPage(null), 320);
  }

  function onTouchStart(e) {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (dragStartY.current === null) return;
    e.preventDefault();
    dragCurrentY.current = e.touches[0].clientY;
    const dy = dragCurrentY.current - dragStartY.current;
    if (dy > 0) {
      sheetRef.current.style.transform = `translateY(${dy}px)`;
      sheetRef.current.style.transition = "none";
    }
  }
  function onTouchEnd() {
    if (dragStartY.current === null) return;
    const dy = dragCurrentY.current - dragStartY.current;
    sheetRef.current.style.transition = "";
    if (dy > 80) {
      closeSheet();
    } else {
      sheetRef.current.style.transform = "translateY(0)";
    }
    dragStartY.current = null;
  }

  const fetchDay = useCallback(async (d) => {
    setLoading(true);
    const [{ data: food }, { data: work }] = await Promise.all([
      supabase.from("food_log").select("*").eq("date", d).order("id"),
      supabase.from("workouts").select("*").eq("date", d).maybeSingle(),
    ]);
    setEntries(food || []);
    setWorkout(work || null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDay(date); }, [date, fetchDay]);

  const totalCals = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const totalProtein = entries.reduce((s, e) => s + (e.protein || 0), 0);
  const burn = TDEE + (workout ? workout.burn_value : 0);
  const deficit = burn - totalCals;

  const grouped = {};
  for (const e of entries) {
    const t = e.time || "other";
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(e);
  }
  const activeMeals = [...MEAL_TIMES, "other"].filter(m => grouped[m]);
  const showMealLabels = activeMeals.length > 1;

  async function deleteEntry(id) {
    if (!window.confirm("Remove this entry?")) return;
    await supabase.from("food_log").delete().eq("id", id);
    fetchDay(date);
  }

  return (
    <>
      <div className={`overlay${open ? "" : " hidden"}`} onClick={closeSheet} />
      <div className="sheet" ref={sheetRef} style={{ transform: open ? "translateY(0)" : "translateY(100%)", transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)" }}>
        <div className="sheet-handle-zone"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="sheet-handle" />
        </div>

        {/* Horizontal slide container */}
        <div style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", width: "200%", transform: subPageActive ? "translateX(-50%)" : "translateX(0)", transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)", willChange: "transform" }}>

            {/* Panel 1: Main content */}
            <div className="sheet-panel">
              <div className="sheet-nav">
                <button className="sheet-nav-btn" onClick={() => setDate(d => shiftDate(d, -1))}>‹</button>
                <div className="sheet-date">{displayFull(date)}</div>
                <button className="sheet-nav-btn" disabled={date >= today} onClick={() => setDate(d => shiftDate(d, 1))}>›</button>
              </div>

              <div className="sheet-stats">
                <div className="stat-card">
                  <div className="stat-label">Eaten</div>
                  <div className="stat-val amber">{totalCals.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Burn</div>
                  <div className="stat-val amber">{burn.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Deficit</div>
                  <div className={`stat-val ${deficit >= 0 ? "green" : "red"}`}>
                    {deficit >= 0 ? "−" : "+"}{Math.abs(deficit)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Protein</div>
                  <div className="stat-val">{totalProtein}g</div>
                  <div className="stat-sub">{PROTEIN_TARGET}–{PROTEIN_TARGET + 10}g</div>
                </div>
              </div>

              {workout ? (
                <div className="workout-row">
                  <span className="workout-label">💪 +{workout.burn_value} cal{workout.notes ? ` · ${workout.notes}` : ""}</span>
                  <button className="workout-edit-btn" onClick={() => openSubPage("workout")}>Edit</button>
                </div>
              ) : (
                <button className="log-workout-btn" onClick={() => openSubPage("workout")}>+ Log Workout</button>
              )}

              {loading ? (
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#b5a898", padding: "0.75rem 0" }}>Loading…</div>
              ) : (
                <>
                  {entries.length > 0 && <div className="section-label">Food Entries</div>}
                  {activeMeals.map(meal => (
                    <div key={meal}>
                      {showMealLabels && <div className="meal-label">{meal}</div>}
                      {grouped[meal].map(e => (
                        <div key={e.id} className="sheet-entry">
                          <div className="sheet-name">{e.item}</div>
                          <span className="sheet-protein">{e.protein}g</span>
                          <span className="sheet-cal">{e.calories}</span>
                          <button className="sheet-del" onClick={() => deleteEntry(e.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  ))}
                  {entries.length === 0 && <div className="sheet-empty">No entries yet</div>}
                </>
              )}

              <button className="sheet-add-btn" onClick={() => openSubPage("food")}>+ Add Entry</button>
            </div>

            {/* Panel 2: Sub-page form */}
            <div className="sheet-panel">
              <button className="back-link" onClick={closeSubPage} style={{ marginBottom: "1.25rem" }}>← Back</button>
              {subPage === "food" && (
                <AddFormContent date={date} frequentFoods={frequentFoods}
                  onSaved={() => { closeSubPage(); fetchDay(date); }} />
              )}
              {subPage === "workout" && (
                <WorkoutFormContent date={date} existing={workout}
                  onSaved={() => { closeSubPage(); fetchDay(date); }} />
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// ─── Add Food Form Content ────────────────────────────────────────────────────
function AddFormContent({ date, frequentFoods, onSaved }) {
  const [tab, setTab] = useState("ai");
  const [mealTime, setMealTime] = useState("lunch");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState("1");
  const [custom, setCustom] = useState({ item: "", calories: "", protein: "", carbs: "", fat: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // AI tab state
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [aiError, setAiError] = useState("");

  const filtered = frequentFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const s = Math.max(0.01, Number(servings) || 1);
  const previewCal = selected ? Math.round((selected.calories || 0) * s) : 0;
  const previewProt = selected ? Math.round((selected.protein || 0) * s) : 0;

  async function logFrequent() {
    if (!selected) return;
    setSaving(true);
    const suffix = s !== 1 ? ` ×${s}` : "";
    await supabase.from("food_log").insert({
      date, time: mealTime,
      item: `${selected.name}${suffix}${selected.serving ? ` (${selected.serving})` : ""}`,
      calories: previewCal, protein: previewProt,
      carbs: Math.round((selected.carbs || 0) * s),
      fat: Math.round((selected.fat || 0) * s),
    });
    onSaved();
  }

  async function logCustom() {
    if (!custom.item.trim()) { setError("Description is required"); return; }
    setSaving(true);
    await supabase.from("food_log").insert({
      date, time: mealTime, item: custom.item.trim(),
      calories: parseInt(custom.calories) || 0, protein: parseInt(custom.protein) || 0,
      carbs: parseInt(custom.carbs) || 0, fat: parseInt(custom.fat) || 0,
    });
    onSaved();
  }

  async function parseWithAI() {
    if (!aiText.trim()) return;
    setParsing(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch('/api/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');
      setAiResult(data);
    } catch (e) {
      setAiError(e.message);
    }
    setParsing(false);
  }

  async function logAiResult() {
    if (!aiResult) return;
    setSaving(true);
    await supabase.from("food_log").insert({
      date, time: mealTime,
      item: aiResult.item,
      calories: aiResult.calories || 0,
      protein: aiResult.protein || 0,
      carbs: aiResult.carbs || 0,
      fat: aiResult.fat || 0,
    });
    onSaved();
  }

  return (
    <>
      <div className="section-label" style={{ marginBottom: "0.75rem" }}>Add Entry</div>

      <div className="section-label">Meal Time</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
        {MEAL_TIMES.map(t => (
          <button key={t} onClick={() => setMealTime(t)}
            style={{ padding: "0.28rem 0.65rem", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", background: mealTime === t ? "#3d3228" : "#e8e2d8", color: mealTime === t ? "#fff" : "#6b5f52" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", border: "1px solid #d8d0c4", marginBottom: "1rem" }}>
        {[["ai", "✦ AI"], ["frequent", "Frequent"], ["custom", "Custom"]].map(([t, lbl]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: "0.5rem", border: "none", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", fontWeight: tab === t ? 600 : 400, background: tab === t ? "#3d3228" : "#faf9f7", color: tab === t ? "#fff" : "#9a8f7e" }}>
            {lbl}
          </button>
        ))}
      </div>

      {tab === "ai" && (
        <>
          <textarea
            placeholder="Describe what you ate in plain English…&#10;e.g. 2 scrambled eggs with cheddar on sourdough"
            value={aiText}
            onChange={e => { setAiText(e.target.value); setAiResult(null); setAiError(""); }}
            rows={3}
            style={{ width: "100%", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", background: "#faf8f5", border: "1px solid #d8d0c4", color: "#3d3228", padding: "0.6rem 0.75rem", borderRadius: 4, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }}
          />
          <button
            onClick={parseWithAI}
            disabled={!aiText.trim() || parsing}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.06em", background: aiText.trim() && !parsing ? "#b07d3a" : "#d6cfc4", color: "#fff", border: "none", padding: "0.55rem 1.25rem", borderRadius: 2, cursor: aiText.trim() && !parsing ? "pointer" : "not-allowed", marginBottom: "1rem" }}>
            {parsing ? "Parsing…" : "✦ Parse with AI"}
          </button>

          {aiError && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#c0392b", marginBottom: "0.75rem" }}>{aiError}</div>
          )}

          {aiResult && (
            <div style={{ background: "#f0ebe3", borderRadius: 6, padding: "0.85rem", marginBottom: "0.75rem" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#3d3228", marginBottom: "0.5rem", fontWeight: 600 }}>{aiResult.item}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "0.75rem" }}>
                {[["Cal", aiResult.calories], ["Protein", `${aiResult.protein}g`], ["Carbs", `${aiResult.carbs}g`], ["Fat", `${aiResult.fat}g`]].map(([lbl, val]) => (
                  <div key={lbl} style={{ background: "#fff", borderRadius: 4, padding: "0.4rem", textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lbl}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", color: "#2c2418", fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setAiResult(null)}>Re-parse</button>
                <button className="btn-primary" onClick={logAiResult} disabled={saving}
                  style={{ opacity: saving ? 0.4 : 1 }}>{saving ? "Saving…" : "Log"}</button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "frequent" ? (
        <>
          <input placeholder="Search foods…" value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); }}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", background: "#faf8f5", border: "1px solid #d8d0c4", color: "#3d3228", padding: "0.5rem 0.65rem", borderRadius: 4, width: "100%", outline: "none", marginBottom: "0.5rem" }} />
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: "0.75rem" }}>
            {filtered.length === 0 ? (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#b5a898", padding: "1rem 0", textAlign: "center" }}>No results</div>
            ) : filtered.map(f => (
              <div key={f.id} onClick={() => { setSelected(f); setServings("1"); }}
                style={{ padding: "0.55rem 0.65rem", borderRadius: 4, marginBottom: "0.25rem", cursor: "pointer", background: selected?.id === f.id ? "#eee9e0" : "#fff", border: `1px solid ${selected?.id === f.id ? "#b89880" : "transparent"}` }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#3d3228" }}>{f.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "#b5a898", marginTop: "0.1rem" }}>
                  {f.serving && <>{f.serving} · </>}{f.calories} cal · {f.protein}g protein
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{ background: "#f0ebe3", borderRadius: 4, padding: "0.65rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", flex: 1 }}>{selected.name}</div>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.63rem", color: "#9a8f7e" }}>×</label>
              <input type="number" value={servings} onChange={e => setServings(e.target.value)}
                min="0.25" max="20" step="0.25" style={{ width: 60, fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", border: "1px solid #d6cfc4", borderRadius: 2, padding: "0.25rem 0.4rem", background: "#fff", textAlign: "right" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#b07d3a", whiteSpace: "nowrap" }}>{previewCal} cal · {previewProt}g</span>
            </div>
          )}
          <div className="form-actions">
            <button className="btn-primary" onClick={logFrequent} disabled={!selected || saving}
              style={{ opacity: (!selected || saving) ? 0.4 : 1 }}>
              {saving ? "Saving…" : "Log"}
            </button>
          </div>
        </>
      ) : tab === "custom" ? (
        <div className="form">
          <input placeholder="Description*" value={custom.item}
            onChange={e => { setCustom(p => ({ ...p, item: e.target.value })); setError(""); }} />
          <div className="form-row">
            {[["calories", "Cal"], ["protein", "Protein (g)"], ["carbs", "Carbs (g)"], ["fat", "Fat (g)"]].map(([k, lbl]) => (
              <input key={k} type="number" placeholder={lbl} value={custom[k]}
                onChange={e => setCustom(p => ({ ...p, [k]: e.target.value }))} min="0" />
            ))}
          </div>
          {error && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#c0392b" }}>{error}</div>}
          <div className="form-actions">
            <button className="btn-primary" onClick={logCustom} disabled={saving}
              style={{ opacity: saving ? 0.4 : 1 }}>{saving ? "Saving…" : "Log"}</button>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ─── Home AI Box ──────────────────────────────────────────────────────────────
function HomeAIBox({ onLogged }) {
  const today = fmtDate(new Date());
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mealTime, setMealTime] = useState("dinner");
  const [date, setDate] = useState(today);

  async function parseWithAI() {
    if (!aiText.trim()) return;
    setParsing(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch('/api/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');
      setAiResult(data);
    } catch (e) {
      setAiError(e.message);
    }
    setParsing(false);
  }

  async function logAiResult() {
    if (!aiResult) return;
    setSaving(true);
    await supabase.from("food_log").insert({
      date, time: mealTime,
      item: aiResult.item,
      calories: aiResult.calories || 0,
      protein: aiResult.protein || 0,
      carbs: aiResult.carbs || 0,
      fat: aiResult.fat || 0,
    });
    setSaving(false);
    setAiText("");
    setAiResult(null);
    onLogged();
  }

  return (
    <div style={{ marginBottom: "1.5rem", background: "#fff", border: "1px solid #e8e2d8", borderRadius: 8, padding: "1rem 1.1rem" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#b5a898", marginBottom: "0.6rem" }}>✦ Quick Log</div>

      <textarea
        placeholder="Describe what you ate…"
        value={aiText}
        onChange={e => { setAiText(e.target.value); setAiResult(null); setAiError(""); }}
        rows={2}
        style={{ width: "100%", fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", background: "#faf8f5", border: "1px solid #d8d0c4", color: "#3d3228", padding: "0.55rem 0.7rem", borderRadius: 4, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: "0.6rem" }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", flex: 1 }}>
          {MEAL_TIMES.map(t => (
            <button key={t} onClick={() => setMealTime(t)}
              style={{ padding: "0.2rem 0.5rem", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", background: mealTime === t ? "#3d3228" : "#e8e2d8", color: mealTime === t ? "#fff" : "#6b5f52" }}>
              {t}
            </button>
          ))}
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", border: "1px solid #d8d0c4", borderRadius: 3, padding: "0.2rem 0.4rem", background: "#faf8f5", color: "#6b5f52", outline: "none" }} />
      </div>

      <button
        onClick={parseWithAI}
        disabled={!aiText.trim() || parsing}
        style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.06em", background: aiText.trim() && !parsing ? "#b07d3a" : "#d6cfc4", color: "#fff", border: "none", padding: "0.45rem 1rem", borderRadius: 2, cursor: aiText.trim() && !parsing ? "pointer" : "not-allowed" }}>
        {parsing ? "Parsing…" : "✦ Parse"}
      </button>

      {aiError && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#c0392b", marginTop: "0.5rem" }}>{aiError}</div>
      )}

      {aiResult && (
        <div style={{ background: "#f0ebe3", borderRadius: 6, padding: "0.75rem", marginTop: "0.75rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#3d3228", marginBottom: "0.45rem", fontWeight: 600 }}>{aiResult.item}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "0.6rem" }}>
            {[["Cal", aiResult.calories], ["Prot", `${aiResult.protein}g`], ["Carbs", `${aiResult.carbs}g`], ["Fat", `${aiResult.fat}g`]].map(([lbl, val]) => (
              <div key={lbl} style={{ background: "#fff", borderRadius: 4, padding: "0.35rem", textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.52rem", color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lbl}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#2c2418", fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button className="btn-cancel" onClick={() => setAiResult(null)}>Re-parse</button>
            <button className="btn-primary" onClick={logAiResult} disabled={saving}
              style={{ opacity: saving ? 0.4 : 1 }}>{saving ? "Saving…" : "Log"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workout Form Content ─────────────────────────────────────────────────────
function WorkoutFormContent({ date, existing, onSaved }) {
  const [burnValue, setBurnValue] = useState(existing ? String(existing.burn_value) : "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [saving, setSaving] = useState(false);
  const [peak, setPeak] = useState("");
  const [vigorous, setVigorous] = useState("");
  const [moderate, setModerate] = useState("");

  function calcKarvonen() {
    const raw = (Number(peak) * 8.99 + Number(vigorous) * 6.95 + Number(moderate) * 3.32) * EPOC;
    setBurnValue(String(Math.round(raw)));
  }

  async function save() {
    if (!burnValue) return;
    setSaving(true);
    if (existing) {
      await supabase.from("workouts").update({ burn_value: Number(burnValue), notes }).eq("id", existing.id);
    } else {
      await supabase.from("workouts").insert({ date, burn_value: Number(burnValue), notes });
    }
    onSaved();
  }

  async function remove() {
    if (!existing || !window.confirm("Remove this workout?")) return;
    await supabase.from("workouts").delete().eq("id", existing.id);
    onSaved();
  }

  return (
    <>
      <div className="section-label" style={{ marginBottom: "0.75rem" }}>{existing ? "Edit Workout" : "Log Workout"}</div>

      <div className="wk-form">
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a9b64", marginBottom: "0.5rem" }}>
          Karvonen HR zones (minutes)
        </div>
        <div className="wk-karvonen">
          {[["Peak ~168bpm", peak, setPeak], ["Vigorous ~149", vigorous, setVigorous], ["Moderate ~115", moderate, setModerate]].map(([lbl, val, set]) => (
            <div key={lbl}>
              <label className="wk-label" style={{ fontSize: "0.57rem" }}>{lbl}</label>
              <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="0" min="0" className="wk-input" />
            </div>
          ))}
        </div>
        <button className="wk-calc-btn" onClick={calcKarvonen}>→ Calculate burn</button>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#9a8f7e", marginTop: "0.45rem" }}>
          Peak ×8.99 + Vigorous ×6.95 + Moderate ×3.32, ×1.10 EPOC
        </div>
      </div>

      <div className="form" style={{ background: "transparent", border: "none", padding: 0, marginBottom: "0.5rem" }}>
        <div>
          <label className="wk-label">Extra burn (cal above TDEE {TDEE})</label>
          <input type="number" value={burnValue} onChange={e => setBurnValue(e.target.value)}
            placeholder="e.g. 400" className="wk-input" />
        </div>
        <div>
          <label className="wk-label">Notes (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. 45 min upper body + 2km run" className="wk-input" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button className="wk-save-btn" onClick={save} disabled={!burnValue || saving}>
          {saving ? "Saving…" : existing ? "Update" : "Log Workout"}
        </button>
        {existing && <button className="wk-delete-btn" onClick={remove}>Delete</button>}
      </div>
    </>
  );
}

// ─── Calculation Rule Page ────────────────────────────────────────────────────
function CalcPage({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap rules-page">
        <button className="back-link" onClick={onBack}>← Back</button>
        <h1>Calculation rule</h1>
        <p className="subtitle">How Eaten, Burn, Deficit & targets are calculated</p>

        <h2>Rest-day baseline</h2>
        <p>Your rest-day baseline is <span className="num">1,717 kcal/day</span> — this is your estimated maintenance energy with no workout, made up of your RMR (Katch-McArdle, ~1,288 kcal) plus non-exercise activity (~258 kcal). On days with no logged workout, this is your full "Burn" for the day.</p>

        <h2>Workout days</h2>
        <p>When you log a workout, its estimated burn (kcal) is added on top of the baseline — scaled up by <span className="num">×1.10</span> to account for EPOC (the "afterburn" effect where your metabolism stays elevated for hours after exercise).</p>
        <p><span className="num">Burn = 1,717 + (workout burn × 1.10)</span></p>
        <p>Workout burn itself is estimated using your heart-rate zone minutes via the Karvonen HR formula.</p>

        <h2>Eaten & target</h2>
        <p>"Eaten" is the sum of calories from everything logged for the day. The grey number underneath is your target intake, calculated as:</p>
        <p><span className="num">Target = Burn − 300</span></p>
        <p>The 300 kcal gap is your daily goal deficit.</p>

        <h2>Deficit</h2>
        <p><span className="num">Deficit = Burn − Eaten</span></p>
        <ul>
          <li><strong>Green (−):</strong> you're under your burn — on track for fat loss, aiming for ≥300/day.</li>
          <li><strong>Red (+):</strong> you ate more than you burned (a surplus) that day.</li>
        </ul>
        <p>Goal deficit of 300 kcal/day corresponds to roughly 0.6 lbs/week of fat loss, on average over time (single-day numbers will vary).</p>

        <h2>Protein</h2>
        <p>Daily target is <span className="num">120–130g</span>, prioritized ahead of carbs/fat.</p>

        <h2>Notes on accuracy</h2>
        <ul>
          <li>Food calories are mostly visual/portion estimates, not weighed — expect ±15–20% error per meal.</li>
          <li>Workout burns rely on Fitbit HR-zone minutes; actual zone averages may differ from assumptions used.</li>
          <li>The baseline (1,717) is a formula estimate — if weight trends don't match predictions after a few weeks, it should be recalibrated.</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Frequently Eat Page ──────────────────────────────────────────────────────
function FrequentPage({ frequentFoods, onBack }) {
  const [search, setSearch] = useState("");
  const filtered = frequentFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={onBack}>← Back</button>
        <h1>Frequently eat</h1>
        <p className="subtitle">Common foods, serving sizes & macros</p>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search foods..."
          style={{ width: "100%", boxSizing: "border-box", padding: "0.5rem 0.65rem", fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", border: "1px solid #d8d0c4", borderRadius: 6, background: "#faf8f5", color: "#3d3228", outline: "none", marginTop: "0.75rem" }} />
        <table className="freq-tbl">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Food</th>
              <th>1 Serving</th>
              <th>Cal</th>
              <th>Protein</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td style={{ color: "#9a8f7e", fontSize: "0.75rem" }}>{f.serving}</td>
                <td style={{ fontWeight: 500 }}>{f.calories}</td>
                <td style={{ color: "#6b5f52" }}>{f.protein}g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Smoothie Calculator Page ─────────────────────────────────────────────────
function SmoothiePage({ frequentFoods, todayCals, todayProtein, todayBurn, onBack, onSaved }) {
  const today = fmtDate(new Date());
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCustomRow, setShowCustomRow] = useState(false);
  const [customRow, setCustomRow] = useState({ name: "", amount: "", cal: "", protein: "" });
  const [customRowError, setCustomRowError] = useState(false);
  const [logged, setLogged] = useState(false);
  const [copyText, setCopyText] = useState("");
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);

  const allFoods = frequentFoods;
  const searchFiltered = allFoods.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  const smoothieCals = items.reduce((s, item) => {
    if (item.customAmount) return s + (item.customCal || 0);
    return s + (item.servingG ? Math.round((item.grams / item.servingG) * item.calsPerServing) : Math.round(item.servings * item.calsPerServing));
  }, 0);
  const smoothieProtein = items.reduce((s, item) => {
    if (item.customAmount) return s + (item.customProtein || 0);
    return s + (item.servingG ? Math.round((item.grams / item.servingG) * item.proteinPerServing) : Math.round(item.servings * item.proteinPerServing));
  }, 0);

  const calDeficitAfter = todayBurn - (todayCals + smoothieCals);
  const proteinAfter = todayProtein + smoothieProtein;

  function addFromDropdown(f) {
    const sG = SERVING_GRAMS[f.name] || (f.serving_grams || null);
    setItems(prev => [...prev, {
      id: Date.now(), name: f.name, servingLabel: f.serving,
      servingG: sG, grams: sG || 0, servings: 1,
      calsPerServing: f.calories, proteinPerServing: f.protein,
    }]);
    setSearch("");
    setDropdownOpen(false);
  }

  function submitCustomRow() {
    if (!customRow.name.trim() || !customRow.amount.trim()) { setCustomRowError(true); return; }
    setCustomRowError(false);
    const cal = customRow.cal.trim() !== "" ? parseInt(customRow.cal) : null;
    const protein = customRow.protein.trim() !== "" ? parseInt(customRow.protein) : null;
    setItems(prev => [...prev, {
      id: Date.now(), name: customRow.name.trim(),
      servingG: null, grams: 0, servings: 1,
      calsPerServing: cal || 0, proteinPerServing: protein || 0,
      customCal: cal, customProtein: protein, customAmount: customRow.amount.trim(),
    }]);
    setCustomRow({ name: "", amount: "", cal: "", protein: "" });
    setShowCustomRow(false);
  }

  function removeItem(id) { setItems(prev => prev.filter(i => i.id !== id)); }
  function updateGrams(id, val) { setItems(prev => prev.map(i => i.id === id ? { ...i, grams: Number(val) || 0 } : i)); }
  function updateServings(id, val) { setItems(prev => prev.map(i => i.id === id ? { ...i, servings: Number(val) || 0 } : i)); }

  async function generate() {
    if (!items.length) return;
    const desc = items.map(item =>
      item.customAmount ? `${item.name} (${item.customAmount})` : item.servingG ? `${item.name} (${item.grams}g)` : `${item.name} (${item.servings} srv)`
    ).join(" + ");
    const suffix = (smoothieCals > 0 || smoothieProtein > 0) ? ` — ${smoothieCals} cal, ${smoothieProtein}g protein` : "";
    const text = `Smoothie: ${desc}${suffix}`;
    setCopyText(text);
    setLogged(true);
    // Also log to Supabase
    setSaving(true);
    await supabase.from("food_log").insert({ date: today, time: "morning", item: text, calories: smoothieCals, protein: smoothieProtein, carbs: 0, fat: 0 });
    setSaving(false);
  }

  const defColor = calDeficitAfter >= DEFICIT_TARGET ? "#3a7d44" : calDeficitAfter >= 0 ? "#b07d3a" : "#b84040";
  const protColor = proteinAfter >= PROTEIN_TARGET ? "#3a7d44" : "#b07d3a";

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }} onClick={() => setDropdownOpen(false)}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={onBack}>← Back</button>
        <h1>Smoothie calculator</h1>
        <p className="subtitle">Build your recipe · {today}</p>

        {/* Search with dropdown */}
        <div className="smth-search" onClick={e => e.stopPropagation()}>
          <input
            className="smth-input"
            placeholder="Search & add ingredient…"
            value={search}
            onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          />
          {dropdownOpen && (
            <div className="smth-dropdown" ref={dropdownRef}>
              {searchFiltered.length === 0 ? (
                <div style={{ padding: "0.75rem", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#b5a898", textAlign: "center" }}>Not found</div>
              ) : searchFiltered.map(f => (
                <div key={f.id} className="smth-option"
                  onMouseDown={() => addFromDropdown(f)}>
                  <span>{f.name}</span>
                  <span className="smth-option-sub">{f.serving}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingredient table */}
        <table className="smth-tbl">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Ingredient</th>
              <th>Amount</th>
              <th>Cal</th>
              <th>Protein</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !showCustomRow && (
              <tr><td colSpan={5} style={{ padding: "0.75rem 0" }}></td></tr>
            )}
            {items.map(item => {
              const cal = item.customAmount ? (item.customCal ?? "") : item.servingG
                ? Math.round((item.grams / item.servingG) * item.calsPerServing)
                : Math.round(item.servings * item.calsPerServing);
              const prot = item.customAmount ? (item.customProtein ?? "") : item.servingG
                ? Math.round((item.grams / item.servingG) * item.proteinPerServing)
                : Math.round(item.servings * item.proteinPerServing);
              return (
                <tr key={item.id} className="entry-row">
                  <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</td>
                  <td style={{ textAlign: "right" }}>
                    {item.customAmount ? (
                      <span style={{ color: "#6b5f52" }}>{item.customAmount}</span>
                    ) : item.servingG ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                        <input type="number" value={item.grams} onChange={e => updateGrams(item.id, e.target.value)} className="smth-num-input" />
                        <span className="smth-unit">g</span>
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.2rem" }}>
                        <input type="number" value={item.servings} step="0.5" min="0" onChange={e => updateServings(item.id, e.target.value)} className="smth-num-input" style={{ width: 40 }} />
                        <span className="smth-unit">srv</span>
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", color: "#b07d3a" }}>{cal}</td>
                  <td style={{ textAlign: "right", color: "#6b5f52" }}>{prot !== "" ? `${prot}g` : ""}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="sheet-del" onClick={() => removeItem(item.id)}>×</button>
                  </td>
                </tr>
              );
            })}

            {/* + add ingredient */}
            {!showCustomRow && (
              <tr>
                <td colSpan={5} style={{ padding: "0.4rem 0.4rem 0.6rem" }}>
                  <button className="smth-add-row-btn" onClick={() => setShowCustomRow(true)}>+ add ingredient</button>
                </td>
              </tr>
            )}

            {/* Custom row inputs */}
            {showCustomRow && (
              <>
                <tr style={{ borderTop: "1px solid #f0ebe3" }}>
                  <td style={{ padding: "0.4rem 0.3rem" }}>
                    <input autoFocus value={customRow.name} onChange={e => setCustomRow(p => ({ ...p, name: e.target.value }))} placeholder="*" className="smth-custom-input" />
                  </td>
                  <td style={{ padding: "0.4rem 0.3rem" }}>
                    <input value={customRow.amount} onChange={e => setCustomRow(p => ({ ...p, amount: e.target.value }))} placeholder="*" className="smth-custom-input" style={{ textAlign: "right" }} />
                  </td>
                  <td style={{ padding: "0.4rem 0.3rem" }}>
                    <input type="number" value={customRow.cal} onChange={e => setCustomRow(p => ({ ...p, cal: e.target.value }))} placeholder="" className="smth-custom-input" style={{ textAlign: "right" }} />
                  </td>
                  <td style={{ padding: "0.4rem 0.3rem" }}>
                    <input type="number" value={customRow.protein} onChange={e => setCustomRow(p => ({ ...p, protein: e.target.value }))} placeholder="" onKeyDown={e => e.key === "Enter" && submitCustomRow()} className="smth-custom-input" style={{ textAlign: "right" }} />
                  </td>
                  <td style={{ padding: "0.4rem 0.2rem", whiteSpace: "nowrap" }}>
                    <button className="smth-confirm-btn" onClick={submitCustomRow}>✓</button>
                    <button className="smth-cancel-btn" onClick={() => { setShowCustomRow(false); setCustomRow({ name: "", amount: "", cal: "", protein: "" }); setCustomRowError(false); }}>✕</button>
                  </td>
                </tr>
                {customRowError && (
                  <tr>
                    <td colSpan={5} style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "#c0392b", padding: "0.2rem 0.4rem 0.4rem" }}>
                      Ingredient and amount are required.
                    </td>
                  </tr>
                )}
              </>
            )}

            {/* Divider */}
            <tr className="smth-divider"><td colSpan={5} style={{ padding: 0 }}></td></tr>

            {/* Smoothie total */}
            <tr className="smth-total-row">
              <td colSpan={2} style={{ fontWeight: 600, fontSize: "0.88rem", padding: "0.7rem 0.4rem", letterSpacing: "0.04em" }}>Smoothie total</td>
              <td style={{ textAlign: "right", color: "#b07d3a", fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{smoothieCals}</td>
              <td style={{ textAlign: "right", fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{smoothieProtein}g</td>
              <td></td>
            </tr>

            {/* After smoothie */}
            <tr className="smth-after-row">
              <td colSpan={2} style={{ fontWeight: 600, fontSize: "0.88rem", padding: "0.7rem 0.4rem", letterSpacing: "0.04em" }}>After smoothie</td>
              <td style={{ textAlign: "right", color: defColor, fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{calDeficitAfter} def</td>
              <td style={{ textAlign: "right", color: protColor, fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{proteinAfter}g</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Generate / logged state */}
        <div style={{ marginTop: "1.25rem" }}>
          {logged ? (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#3a7d44", marginBottom: "0.75rem" }}>
                Smoothie logged ✓
              </div>
              <div style={{ textAlign: "right" }}>
                <button onClick={() => { setLogged(false); setItems([]); }}
                  style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", background: "none", border: "1px solid #d6cfc4", color: "#9a8f7e", padding: "0.3rem 0.75rem", borderRadius: 3, cursor: "pointer" }}>
                  New smoothie
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "right" }}>
              <button
                onClick={generate}
                disabled={items.length === 0 || saving}
                className="smth-generate-btn"
                style={{ background: items.length > 0 ? "#2c2418" : "#d6cfc4", cursor: items.length > 0 ? "pointer" : "not-allowed" }}>
                {saving ? "Logging…" : "Log"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
