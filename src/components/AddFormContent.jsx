import { useState } from "react";
import { supabase } from "../supabase.js";
import { fmtMacro } from "../constants.js";

export default function AddFormContent({ date, frequentFoods, onSaved }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState("1");
  const [custom, setCustom] = useState({ item: "", calories: "", protein: "", carbs: "", fat: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [aiError, setAiError] = useState("");

  const filtered = frequentFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const s = Math.max(0.01, Number(servings) || 1);
  const previewCal = selected ? Math.round((selected.calories || 0) * s) : 0;
  const previewProt = selected ? Math.round((parseFloat(selected.protein) || 0) * s * 10) / 10 : 0;

  async function logFrequent() {
    if (!selected) return;
    setSaving(true);
    const suffix = s !== 1 ? ` ×${s}` : "";
    await supabase.from("food_log").insert({
      date,
      item: `${selected.name}${suffix}${selected.serving ? ` (${selected.serving})` : ""}`,
      calories: previewCal,
      protein: Math.round((parseFloat(selected.protein) || 0) * s * 10) / 10,
      carbs:   Math.round((parseFloat(selected.carbs)   || 0) * s * 10) / 10,
      fat:     Math.round((parseFloat(selected.fat)     || 0) * s * 10) / 10,
    });
    onSaved();
  }

  async function logCustom() {
    if (!custom.item.trim()) { setError("Description is required"); return; }
    setSaving(true);
    await supabase.from("food_log").insert({
      date, item: custom.item.trim(),
      calories: parseInt(custom.calories) || 0, protein: parseInt(custom.protein) || 0,
      carbs: parseInt(custom.carbs) || 0, fat: parseInt(custom.fat) || 0,
    });
    onSaved();
  }

  async function parseWithAI() {
    if (!aiText.trim()) return;
    setParsing(true); setAiError(""); setAiResult(null);
    try {
      const res = await fetch('/api/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');
      setAiResult(data);
    } catch (e) { setAiError(e.message); }
    setParsing(false);
  }

  async function logAiResult() {
    if (!aiResult) return;
    setSaving(true);
    await supabase.from("food_log").insert({
      date, item: aiResult.item,
      calories: aiResult.calories || 0, protein: aiResult.protein || 0,
      carbs: aiResult.carbs || 0, fat: aiResult.fat || 0,
    });
    onSaved();
  }

  const divider = (label) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "1.1rem 0 0.9rem" }}>
      <div style={{ flex: 1, height: 1, background: "#e8e2d8" }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#d6cfc4" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#e8e2d8" }} />
    </div>
  );

  return (
    <>
      <div className="section-label" style={{ marginBottom: "0.75rem" }}>Add Entry</div>

      <textarea
        placeholder="Describe what you ate in plain English…&#10;e.g. 2 scrambled eggs with cheddar on sourdough"
        value={aiText}
        onChange={e => { setAiText(e.target.value); setAiResult(null); setAiError(""); }}
        rows={3}
        style={{ width: "100%", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", background: "#faf8f5", border: "1px solid #d8d0c4", color: "#3d3228", padding: "0.6rem 0.75rem", borderRadius: 4, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: "0.65rem" }}
      />
      <button
        onClick={parseWithAI} disabled={!aiText.trim() || parsing}
        style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.06em", background: aiText.trim() && !parsing ? "#b07d3a" : "#d6cfc4", color: "#fff", border: "none", padding: "0.5rem 1.1rem", borderRadius: 2, cursor: aiText.trim() && !parsing ? "pointer" : "not-allowed" }}>
        {parsing ? "Parsing…" : "✦ Calculate"}
      </button>
      {aiError && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#c0392b", marginTop: "0.5rem" }}>{aiError}</div>}
      {aiResult && (
        <div style={{ background: "#f0ebe3", borderRadius: 6, padding: "0.85rem", marginTop: "0.75rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#3d3228", marginBottom: "0.5rem", fontWeight: 600 }}>{aiResult.item}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "0.75rem" }}>
            {[["Cal", aiResult.calories], ["Protein", `${fmtMacro(aiResult.protein)}g`], ["Carbs", `${fmtMacro(aiResult.carbs)}g`], ["Fat", `${fmtMacro(aiResult.fat)}g`]].map(([lbl, val]) => (
              <div key={lbl} style={{ background: "#fff", borderRadius: 4, padding: "0.4rem", textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lbl}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", color: "#2c2418", fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setAiResult(null)}>Re-parse</button>
            <button className="btn-primary" onClick={logAiResult} disabled={saving} style={{ opacity: saving ? 0.4 : 1 }}>{saving ? "Saving…" : "Log"}</button>
          </div>
        </div>
      )}

      {divider("or from your list")}
      <input placeholder="Search foods…" value={search}
        onChange={e => { setSearch(e.target.value); setSelected(null); }}
        style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", background: "#faf8f5", border: "1px solid #d8d0c4", color: "#3d3228", padding: "0.5rem 0.65rem", borderRadius: 4, width: "100%", outline: "none", marginBottom: "0.5rem" }} />
      <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: "0.5rem" }}>
        {search.length > 0 && filtered.length === 0 ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#b5a898", padding: "0.75rem 0", textAlign: "center" }}>No results</div>
        ) : filtered.map(f => (
          <div key={f.id} onClick={() => { setSelected(f); setServings("1"); }}
            style={{ padding: "0.5rem 0.65rem", borderRadius: 4, marginBottom: "0.2rem", cursor: "pointer", background: selected?.id === f.id ? "#eee9e0" : "#fff", border: `1px solid ${selected?.id === f.id ? "#b89880" : "transparent"}` }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#3d3228" }}>{f.name}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "#b5a898", marginTop: "0.1rem" }}>
              {f.serving && <>{f.serving} · </>}{f.calories} cal · {fmtMacro(f.protein)}g protein
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ background: "#f0ebe3", borderRadius: 4, padding: "0.65rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", flex: 1 }}>{selected.name}</div>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.63rem", color: "#9a8f7e" }}>×</label>
          <input type="number" value={servings} onChange={e => setServings(e.target.value)}
            min="0.25" max="20" step="0.25"
            style={{ width: 60, fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", border: "1px solid #d6cfc4", borderRadius: 2, padding: "0.25rem 0.4rem", background: "#fff", textAlign: "right" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#b07d3a", whiteSpace: "nowrap" }}>{previewCal} cal · {fmtMacro(previewProt)}g</span>
        </div>
      )}
      <div className="form-actions">
        <button className="btn-primary" onClick={logFrequent} disabled={!selected || saving} style={{ opacity: (!selected || saving) ? 0.4 : 1 }}>
          {saving ? "Saving…" : "Log"}
        </button>
      </div>

      {divider("or enter manually")}
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
          <button className="btn-primary" onClick={logCustom} disabled={saving} style={{ opacity: saving ? 0.4 : 1 }}>{saving ? "Saving…" : "Log"}</button>
        </div>
      </div>
    </>
  );
}
