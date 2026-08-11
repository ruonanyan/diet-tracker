import { useState } from "react";
import { supabase } from "../supabase.js";
import { EPOC, TDEE } from "../constants.js";

export default function WorkoutFormContent({ date, existing, profile, onSaved }) {
  const tdee = profile?.tdee ?? TDEE;
  const [burnValue, setBurnValue] = useState(existing ? String(existing.burn_value) : "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [saving, setSaving] = useState(false);
  const [peak, setPeak] = useState("");
  const [vigorous, setVigorous] = useState("");
  const [moderate, setModerate] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [aiError, setAiError] = useState("");

  async function parseWorkoutWithAI() {
    if (!aiText.trim()) return;
    setParsing(true); setAiError(""); setAiResult(null);
    try {
      const res = await fetch('/api/parse-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiText.trim(), userStats: profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');
      setAiResult(data);
    } catch (e) { setAiError(e.message); }
    setParsing(false);
  }

  async function logAiWorkout() {
    if (!aiResult) return;
    setSaving(true);
    if (existing) {
      await supabase.from("workouts").update({ burn_value: aiResult.burn_value, notes: aiResult.notes }).eq("id", existing.id);
    } else {
      await supabase.from("workouts").insert({ date, burn_value: aiResult.burn_value, notes: aiResult.notes });
    }
    onSaved();
  }

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

  const wkDivider = (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "1.1rem 0 0.9rem" }}>
      <div style={{ flex: 1, height: 1, background: "#c8e6ca" }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8d4ad" }}>or calculate manually</span>
      <div style={{ flex: 1, height: 1, background: "#c8e6ca" }} />
    </div>
  );

  return (
    <>
      <div className="section-label" style={{ marginBottom: "0.75rem" }}>{existing ? "Edit Workout" : "Log Workout"}</div>

      <textarea
        placeholder="Describe your workout…&#10;e.g. 30 min vigorous bike + 20 min moderate swim"
        value={aiText}
        onChange={e => { setAiText(e.target.value); setAiResult(null); setAiError(""); }}
        rows={3}
        style={{ width: "100%", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", background: "#f4faf5", border: "1px solid #a8d4ad", color: "#3d3228", padding: "0.6rem 0.75rem", borderRadius: 4, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: "0.65rem" }}
      />
      <button onClick={parseWorkoutWithAI} disabled={!aiText.trim() || parsing}
        style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.06em", background: aiText.trim() && !parsing ? "#3a7d44" : "#a8d4ad", color: "#fff", border: "none", padding: "0.5rem 1.1rem", borderRadius: 2, cursor: aiText.trim() && !parsing ? "pointer" : "not-allowed" }}>
        {parsing ? "Calculating…" : "✦ Calculate"}
      </button>
      {aiError && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#c0392b", marginTop: "0.5rem" }}>{aiError}</div>}
      {aiResult && (
        <div style={{ background: "#eaf2eb", borderRadius: 6, padding: "0.85rem", marginTop: "0.75rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#3d3228", marginBottom: "0.5rem", fontWeight: 600 }}>{aiResult.notes}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#fff", borderRadius: 4, padding: "0.5rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>Extra Burn</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1rem", color: "#3a7d44", fontWeight: 700 }}>{aiResult.burn_value}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#b5a898" }}>cal above TDEE</div>
            </div>
            <div style={{ background: "#fff", borderRadius: 4, padding: "0.5rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>Total Burn</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1rem", color: "#2c2418", fontWeight: 700 }}>{tdee + aiResult.burn_value}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#b5a898" }}>kcal for the day</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button className="btn-cancel" onClick={() => setAiResult(null)}>Re-calculate</button>
            <button className="wk-save-btn" onClick={logAiWorkout} disabled={saving} style={{ opacity: saving ? 0.4 : 1 }}>{saving ? "Saving…" : "Log"}</button>
          </div>
        </div>
      )}

      {wkDivider}

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
          <label className="wk-label">Extra burn (cal above TDEE {tdee})</label>
          <input type="number" value={burnValue} onChange={e => setBurnValue(e.target.value)} placeholder="e.g. 400" className="wk-input" />
        </div>
        <div>
          <label className="wk-label">Notes (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. 45 min upper body + 2km run" className="wk-input" />
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
