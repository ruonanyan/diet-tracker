import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase.js";
import { GLOBAL_CSS } from "../styles.js";
import { TDEE, PROTEIN_TARGET, fmtMacro, fmtDate, displayFull, shiftDate } from "../constants.js";
import AddFormContent from "./AddFormContent.jsx";
import WorkoutFormContent from "./WorkoutFormContent.jsx";

export default function DayPage({ date: initialDate, workoutsMap, frequentFoods, profile, onClose }) {
  const today = fmtDate(new Date());
  const [date, setDate] = useState(initialDate);
  const [entries, setEntries] = useState([]);
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subPage, setSubPage] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  const tdee = profile?.tdee ?? TDEE;
  const totalCals = entries.reduce((s, e) => s + (e.calories || 0), 0);
  const totalProtein = entries.reduce((s, e) => s + (parseFloat(e.protein) || 0), 0);
  const burn = tdee + (workout ? workout.burn_value : 0);
  const deficit = burn - totalCals;

  async function deleteEntry(id) {
    if (!window.confirm("Remove this entry?")) return;
    await supabase.from("food_log").delete().eq("id", id);
    fetchDay(date);
  }

  function goBack() { setSubPage(null); fetchDay(date); }

  if (subPage === "food") return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={goBack}>← Back</button>
        <AddFormContent date={date} frequentFoods={frequentFoods} onSaved={goBack} />
      </div>
    </div>
  );

  if (subPage === "workout") return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={goBack}>← Back</button>
        <WorkoutFormContent date={date} existing={workout} profile={profile} onSaved={goBack} />
      </div>
    </div>
  );

  const stats = [
    { label: "Eaten",    val: totalCals.toLocaleString(),                         color: "#b07d3a" },
    { label: "Burn",     val: burn.toLocaleString(),                              color: "#b07d3a" },
    { label: "Deficit",  val: (deficit >= 0 ? "−" : "+") + Math.abs(deficit),    color: deficit >= 0 ? "#3a7d44" : "#b84040" },
    { label: "Protein",  val: fmtMacro(totalProtein) + "g",                       color: "#2c2418", sub: `${PROTEIN_TARGET}–${PROTEIN_TARGET + 10}g` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={onClose}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button className="sheet-nav-btn" onClick={() => setDate(d => shiftDate(d, -1))}>‹</button>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.05rem", flex: 1, textAlign: "center", color: "#2c2418" }}>{displayFull(date)}</div>
          <button className="sheet-nav-btn" disabled={date >= today} onClick={() => setDate(d => shiftDate(d, 1))}>›</button>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
          {stats.map(({ label, val, color, sub }) => (
            <div key={label} style={{ flex: 1, background: "#fff", border: "1px solid #e8e2d8", borderRadius: 6, padding: "0.4rem 0.5rem" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#b5a898", marginBottom: "0.15rem" }}>{label}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.88rem", fontWeight: 600, color }}>{val}</div>
              {sub && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", color: "#b5a898", marginTop: "0.1rem" }}>{sub}</div>}
            </div>
          ))}
        </div>

        {workout ? (
          <div className="workout-row">
            <span className="workout-label">💪 +{workout.burn_value} cal{workout.notes ? ` · ${workout.notes}` : ""}</span>
            <button className="workout-edit-btn" onClick={() => setSubPage("workout")}>Edit</button>
          </div>
        ) : (
          <button className="log-workout-btn" onClick={() => setSubPage("workout")}>+ Log Workout</button>
        )}

        {loading ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#b5a898", padding: "0.75rem 0" }}>Loading…</div>
        ) : (
          <>
            {entries.length > 0 && <div className="section-label">Food Entries</div>}
            {entries.map(e => (
              <div key={e.id} className="sheet-entry">
                <div className="sheet-name">{e.item}</div>
                <span className="sheet-protein">{fmtMacro(e.protein)}g</span>
                <span className="sheet-cal">{e.calories}</span>
                <button className="sheet-del" onClick={() => deleteEntry(e.id)}>×</button>
              </div>
            ))}
            {entries.length === 0 && <div className="sheet-empty">No entries yet</div>}
          </>
        )}

        <button className="sheet-add-btn" onClick={() => setSubPage("food")}>+ Add Entry</button>
      </div>
    </div>
  );
}
