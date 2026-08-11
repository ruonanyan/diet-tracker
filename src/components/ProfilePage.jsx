import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { GLOBAL_CSS } from "../styles.js";

export default function ProfilePage({ profile: fallbackProfile, onBack, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("user_profile").select("*").eq("id", 1).single()
      .then(({ data }) => {
        const p = data || fallbackProfile;
        setForm({
          age: String(p.age),
          gender: p.gender,
          weight_lbs: String(p.weight_lbs),
          height_ft: String(Math.floor(p.height_in / 12)),
          height_in_rem: String(p.height_in % 12),
          tdee: String(p.tdee),
          rhr: String(p.rhr),
        });
      });
  }, []);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setSaved(false); }

  if (!form) return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={onBack}>← Back</button>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#b5a898", marginTop: "2rem" }}>Loading…</p>
      </div>
    </div>
  );

  async function save() {
    setSaving(true);
    const height_in = Number(form.height_ft) * 12 + Number(form.height_in_rem);
    const updated = {
      age: parseInt(form.age) || fallbackProfile.age,
      gender: form.gender,
      weight_lbs: parseFloat(form.weight_lbs) || fallbackProfile.weight_lbs,
      height_in,
      tdee: parseInt(form.tdee) || fallbackProfile.tdee,
      rhr: parseInt(form.rhr) || fallbackProfile.rhr,
      updated_at: new Date().toISOString(),
    };
    await Promise.all([
      supabase.from("user_profile").update(updated).eq("id", 1),
      supabase.from("profile_history").insert({
        age: updated.age, gender: updated.gender,
        weight_lbs: updated.weight_lbs, height_in: updated.height_in,
        tdee: updated.tdee, rhr: updated.rhr,
      }),
    ]);
    setSaving(false);
    setSaved(true);
    onSaved(updated);
  }

  const field = (label, key, type = "number", extra = {}) => (
    <div>
      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a8f7e", display: "block", marginBottom: "0.25rem" }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
        style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", background: "#fff", border: "1px solid #d6cfc4", color: "#2c2418", padding: "0.45rem 0.65rem", borderRadius: 3, width: "100%", outline: "none" }}
        {...extra} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={onBack}>← Back</button>
        <h1>My profile</h1>
        <p className="subtitle">Body stats · used for calorie calculations</p>

        <div style={{ display: "grid", gap: "0.85rem", marginTop: "1.5rem", maxWidth: 380 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            {field("Age", "age")}
            <div>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a8f7e", display: "block", marginBottom: "0.25rem" }}>Gender</label>
              <select value={form.gender} onChange={e => set("gender", e.target.value)}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", background: "#fff", border: "1px solid #d6cfc4", color: "#2c2418", padding: "0.45rem 0.65rem", borderRadius: 3, width: "100%", outline: "none" }}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>

          {field("Weight (lbs)", "weight_lbs")}

          <div>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a8f7e", display: "block", marginBottom: "0.25rem" }}>Height</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="number" value={form.height_ft} onChange={e => set("height_ft", e.target.value)}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", background: "#fff", border: "1px solid #d6cfc4", color: "#2c2418", padding: "0.45rem 0.65rem", borderRadius: 3, width: 70, outline: "none" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#9a8f7e" }}>ft</span>
              <input type="number" value={form.height_in_rem} onChange={e => set("height_in_rem", e.target.value)}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", background: "#fff", border: "1px solid #d6cfc4", color: "#2c2418", padding: "0.45rem 0.65rem", borderRadius: 3, width: 70, outline: "none" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#9a8f7e" }}>in</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e8e2d8", paddingTop: "0.85rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            {field("TDEE baseline (kcal)", "tdee")}
            {field("Resting HR (bpm)", "rhr")}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button onClick={save} disabled={saving}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", background: "#3d3228", color: "#fff", border: "none", padding: "0.55rem 1.25rem", borderRadius: 2, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1 }}>
              {saving ? "Saving…" : "Save"}
            </button>
            {saved && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#3a7d44" }}>✓ Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
