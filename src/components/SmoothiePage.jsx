import { useState, useRef } from "react";
import { supabase } from "../supabase.js";
import { GLOBAL_CSS } from "../styles.js";
import { SERVING_GRAMS, DEFICIT_TARGET, PROTEIN_TARGET, fmtMacro, fmtDate } from "../constants.js";

export default function SmoothiePage({ frequentFoods, todayCals, todayProtein, todayBurn, onBack, onSaved }) {
  const today = fmtDate(new Date());
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCustomRow, setShowCustomRow] = useState(false);
  const [customRow, setCustomRow] = useState({ name: "", amount: "", cal: "", protein: "" });
  const [customRowError, setCustomRowError] = useState(false);
  const [logged, setLogged] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);

  const searchFiltered = frequentFoods.filter(f =>
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
    setSearch(""); setDropdownOpen(false);
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
    setSaving(true);
    await supabase.from("food_log").insert({ date: today, item: text, calories: smoothieCals, protein: smoothieProtein, carbs: 0, fat: 0 });
    setSaving(false);
    setLogged(true);
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

        <div className="smth-search" onClick={e => e.stopPropagation()}>
          <input className="smth-input" placeholder="Search & add ingredient…" value={search}
            onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)} />
          {dropdownOpen && (
            <div className="smth-dropdown" ref={dropdownRef}>
              {searchFiltered.length === 0 ? (
                <div style={{ padding: "0.75rem", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#b5a898", textAlign: "center" }}>Not found</div>
              ) : searchFiltered.map(f => (
                <div key={f.id} className="smth-option" onMouseDown={() => addFromDropdown(f)}>
                  <span>{f.name}</span>
                  <span className="smth-option-sub">{f.serving}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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

            {!showCustomRow && (
              <tr>
                <td colSpan={5} style={{ padding: "0.4rem 0.4rem 0.6rem" }}>
                  <button className="smth-add-row-btn" onClick={() => setShowCustomRow(true)}>+ add ingredient</button>
                </td>
              </tr>
            )}

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

            <tr className="smth-divider"><td colSpan={5} style={{ padding: 0 }}></td></tr>
            <tr className="smth-total-row">
              <td colSpan={2} style={{ fontWeight: 600, fontSize: "0.88rem", padding: "0.7rem 0.4rem", letterSpacing: "0.04em" }}>Smoothie total</td>
              <td style={{ textAlign: "right", color: "#b07d3a", fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{smoothieCals}</td>
              <td style={{ textAlign: "right", fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{smoothieProtein}g</td>
              <td></td>
            </tr>
            <tr className="smth-after-row">
              <td colSpan={2} style={{ fontWeight: 600, fontSize: "0.88rem", padding: "0.7rem 0.4rem", letterSpacing: "0.04em" }}>After smoothie</td>
              <td style={{ textAlign: "right", color: defColor, fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{calDeficitAfter} def</td>
              <td style={{ textAlign: "right", color: protColor, fontWeight: 700, fontSize: "0.95rem", padding: "0.7rem 0.4rem" }}>{proteinAfter}g</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "1.25rem" }}>
          {logged ? (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#3a7d44", marginBottom: "0.75rem" }}>Smoothie logged ✓</div>
              <div style={{ textAlign: "right" }}>
                <button onClick={() => { setLogged(false); setItems([]); }}
                  style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", background: "none", border: "1px solid #d6cfc4", color: "#9a8f7e", padding: "0.3rem 0.75rem", borderRadius: 3, cursor: "pointer" }}>
                  New smoothie
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "right" }}>
              <button onClick={generate} disabled={items.length === 0 || saving} className="smth-generate-btn"
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
