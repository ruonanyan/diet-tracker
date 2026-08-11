import { useState, useRef } from "react";
import { supabase } from "../supabase.js";
import { fmtMacro, fmtDate, TDEE } from "../constants.js";

export default function HomeAIBox({ onLogged, profile, tdee, frequentFoods = [] }) {
  const today = fmtDate(new Date());
  const [aiResult, setAiResult] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [date, setDate] = useState(today);
  const [atMatch, setAtMatch] = useState(null);
  const [chipReplacing, setChipReplacing] = useState(null);
  const [chipQuery, setChipQuery] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const editorRef = useRef(null);

  const atFiltered = atMatch
    ? frequentFoods.filter(f =>
        atMatch.query === "" || f.name.toLowerCase().includes(atMatch.query.toLowerCase())
      ).slice(0, 6)
    : [];

  const chipReplaceFiltered = chipReplacing
    ? frequentFoods.filter(f =>
        chipQuery === "" || f.name.toLowerCase().includes(chipQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  function checkHasContent() {
    const ed = editorRef.current;
    if (!ed) return;
    setHasContent(ed.textContent.trim().length > 0 || !!ed.querySelector(".food-chip"));
  }

  function handleInput() {
    checkHasContent();
    const sel = window.getSelection();
    if (!sel?.rangeCount) { setAtMatch(null); return; }
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) { setAtMatch(null); return; }
    const textBefore = node.textContent.slice(0, range.startOffset);
    const atIdx = textBefore.lastIndexOf("@");
    if (atIdx !== -1) {
      const query = textBefore.slice(atIdx + 1);
      if (!query.includes(" ") && !query.includes("\n")) {
        setAtMatch({ node, atIdx, query });
        return;
      }
    }
    setAtMatch(null);
  }

  function createChipEl(f) {
    const chip = document.createElement("span");
    chip.className = "food-chip";
    chip.contentEditable = "false";
    chip.dataset.name = f.name;
    chip.dataset.calories = String(f.calories);
    chip.dataset.protein = String(f.protein);
    chip.dataset.carbs = String(f.carbs ?? 0);
    chip.dataset.fat = String(f.fat ?? 0);
    Object.assign(chip.style, {
      display: "inline-flex", alignItems: "center", background: "#f0ebe3",
      border: "1px solid #d8c9b8", borderRadius: "12px", padding: "1px 8px",
      verticalAlign: "middle", lineHeight: "1.8", margin: "0 1px", userSelect: "none",
    });
    const nameBtn = document.createElement("button");
    nameBtn.textContent = f.name;
    Object.assign(nameBtn.style, {
      fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#b07d3a",
      background: "none", border: "none", cursor: "pointer", padding: "0",
      textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "2px",
    });
    nameBtn.addEventListener("click", () => {
      const rect = chip.getBoundingClientRect();
      setChipReplacing({ el: chip, top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      setChipQuery("");
    });
    chip.appendChild(nameBtn);
    return chip;
  }

  function insertFood(f) {
    if (!atMatch) return;
    const { node, atIdx, query } = atMatch;
    const range = document.createRange();
    range.setStart(node, atIdx);
    range.setEnd(node, Math.min(atIdx + 1 + query.length, node.textContent.length));
    range.deleteContents();
    const chip = createChipEl(f);
    range.insertNode(chip);
    const space = document.createTextNode(" ");
    chip.after(space);
    const newRange = document.createRange();
    newRange.setStart(space, 1);
    newRange.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(newRange);
    setAtMatch(null);
    checkHasContent();
    editorRef.current?.focus();
  }

  function replaceChip(newFood) {
    if (!chipReplacing?.el) return;
    const newChip = createChipEl(newFood);
    chipReplacing.el.replaceWith(newChip);
    setChipReplacing(null);
    setChipQuery("");
  }

  function getDescription() {
    const ed = editorRef.current;
    if (!ed) return "";
    let text = "";
    function walk(n) {
      if (n.nodeType === Node.TEXT_NODE) {
        text += n.textContent;
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        if (n.classList.contains("food-chip")) {
          const { name, calories, protein, carbs, fat } = n.dataset;
          text += `${name} (${calories} cal, ${protein}g protein, ${carbs}g carbs, ${fat}g fat)`;
        } else if (n.tagName === "BR") {
          text += "\n";
        } else {
          for (const c of n.childNodes) walk(c);
          if (n.tagName === "DIV" || n.tagName === "P") text += "\n";
        }
      }
    }
    for (const c of ed.childNodes) walk(c);
    return text.trim();
  }

  async function parseWithAI() {
    const description = getDescription();
    if (!description) return;
    setParsing(true); setAiError(""); setAiResult(null); setSavedMsg(""); setAtMatch(null);
    try {
      const body = { description, userStats: profile };
      if (frequentFoods.length > 0) body.frequentFoods = frequentFoods;
      const res = await fetch("/api/parse-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse");
      setAiResult(data);
    } catch (e) { setAiError(e.message); }
    setParsing(false);
  }

  function reset() {
    if (editorRef.current) editorRef.current.innerHTML = "";
    setAiResult(null); setSavedMsg(""); setHasContent(false);
    setAtMatch(null); setChipReplacing(null);
  }

  async function logToday() {
    if (!aiResult) return;
    setSaving(true);
    if (aiResult.type === "workout") {
      await supabase.from("workouts").insert({ date, burn_value: aiResult.burn_value, notes: aiResult.notes });
    } else {
      await supabase.from("food_log").insert({
        date, item: aiResult.item,
        calories: aiResult.calories || 0, protein: aiResult.protein || 0,
        carbs: aiResult.carbs || 0, fat: aiResult.fat || 0,
      });
    }
    setSaving(false);
    reset();
    onLogged();
  }

  async function saveToFrequent() {
    if (!aiResult || aiResult.type === "workout") return;
    setSaving(true);
    await supabase.from("frequent_foods").insert({
      name: aiResult.item, serving: null,
      calories: aiResult.calories || 0, protein: aiResult.protein || 0,
      carbs: aiResult.carbs || 0, fat: aiResult.fat || 0,
    });
    setSaving(false);
    setSavedMsg(`"${aiResult.item}" added to frequent foods`);
    setAiResult(null);
  }

  const isWorkout = aiResult?.type === "workout";

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.6rem" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#b5a898" }}>✦ Quick Log</span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", border: "1px solid #d8d0c4", borderRadius: 3, padding: "0.2rem 0.4rem", background: "#faf8f5", color: "#6b5f52", outline: "none" }} />
      </div>

      {chipReplacing && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => { setChipReplacing(null); setChipQuery(""); }} />
        <div style={{ position: "fixed", top: chipReplacing.top + 4, left: chipReplacing.left, background: "#fff", border: "1px solid #d8d0c4", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 200, minWidth: 260, maxHeight: 260, overflowY: "auto" }}>
          <input type="text" value={chipQuery} onChange={e => setChipQuery(e.target.value)}
            autoFocus placeholder="Search…"
            style={{ width: "100%", padding: "0.5rem 0.75rem", border: "none", borderBottom: "1px solid #f0ebe3", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", outline: "none", background: "#faf8f5", boxSizing: "border-box" }} />
          {chipReplaceFiltered.map(f => (
            <button key={f.id}
              onMouseDown={e => { e.preventDefault(); replaceChip(f); }}
              style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", width: "100%", textAlign: "left", padding: "0.55rem 0.75rem", background: "none", border: "none", borderBottom: "1px solid #f0ebe3", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f7f4ef"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <span style={{ fontSize: "0.78rem", color: "#3d3228", fontWeight: 600 }}>{f.name}</span>
              <span style={{ fontSize: "0.65rem", color: "#b5a898", marginLeft: "auto", flexShrink: 0 }}>{f.calories} cal · {fmtMacro(f.protein)}g protein</span>
            </button>
          ))}
        </div>
      </>}

      <div style={{ position: "relative", marginBottom: "0.6rem" }}>
        <div
          ref={editorRef}
          contentEditable="true"
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onKeyDown={e => {
            if (e.key === "Escape") { setAtMatch(null); return; }
            if (e.key === "Backspace") {
              const sel = window.getSelection();
              if (!sel?.rangeCount) return;
              const range = sel.getRangeAt(0);
              if (!range.collapsed) return;
              if (range.startOffset === 0) {
                const node = range.startContainer;
                const prev = node.previousSibling ?? node.parentNode?.previousSibling;
                if (prev?.nodeType === Node.ELEMENT_NODE && prev.classList?.contains("food-chip")) {
                  e.preventDefault();
                  prev.remove();
                  checkHasContent();
                }
              }
            }
          }}
          style={{ width: "100%", fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", background: "#faf8f5", border: "1px solid #d8d0c4", color: "#3d3228", padding: "0.55rem 0.7rem", borderRadius: 4, outline: "none", boxSizing: "border-box", minHeight: "7.8rem", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: "text" }}
        />
        {!hasContent && (
          <div style={{ position: "absolute", top: "0.55rem", left: "0.7rem", fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", color: "#b5a898", pointerEvents: "none", userSelect: "none", lineHeight: "1.6" }}>
            Describe food or a workout… type @ to pick from frequent foods
          </div>
        )}
        {atMatch && atFiltered.length > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: "100%", background: "#fff", border: "1px solid #d8d0c4", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 200, maxHeight: 220, overflowY: "auto" }}>
            {atFiltered.map(f => (
              <button key={f.id} onMouseDown={e => { e.preventDefault(); insertFood(f); }}
                style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", width: "100%", textAlign: "left", padding: "0.55rem 0.75rem", background: "none", border: "none", borderBottom: "1px solid #f0ebe3", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f7f4ef"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <span style={{ fontSize: "0.78rem", color: "#3d3228", fontWeight: 600 }}>{f.name}</span>
                <span style={{ fontSize: "0.65rem", color: "#b5a898", marginLeft: "auto", flexShrink: 0 }}>{f.calories} cal · {fmtMacro(f.protein)}g protein</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={parseWithAI} disabled={!hasContent || parsing}
        style={{ width: "100%", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", letterSpacing: "0.06em", background: hasContent && !parsing ? "#b07d3a" : "#d6cfc4", color: "#fff", border: "none", padding: "0.75rem 1rem", borderRadius: 4, cursor: hasContent && !parsing ? "pointer" : "not-allowed" }}>
        {parsing ? "Thinking…" : "✦ Submit"}
      </button>

      {aiError && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#c0392b", marginTop: "0.5rem" }}>{aiError}</div>}
      {savedMsg && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#3a7d44", marginTop: "0.5rem" }}>✓ {savedMsg}</div>}

      {aiResult && (
        <div style={{ background: isWorkout ? "#eaf2eb" : "#f0ebe3", borderRadius: 6, padding: "0.75rem", marginTop: "0.75rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: isWorkout ? "#3a7d44" : "#b07d3a", marginBottom: "0.35rem" }}>
            {isWorkout ? "💪 Workout" : "🍽 Food"}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#3d3228", marginBottom: "0.5rem", fontWeight: 600 }}>
            {isWorkout ? aiResult.notes : aiResult.item}
          </div>
          {isWorkout ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.6rem" }}>
              {[["Extra Burn", `+${aiResult.burn_value} cal`], ["Total Burn", `${(tdee ?? TDEE) + aiResult.burn_value} cal`]].map(([lbl, val]) => (
                <div key={lbl} style={{ background: "#fff", borderRadius: 4, padding: "0.35rem", textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.52rem", color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lbl}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#3a7d44", fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: "0.6rem" }}>
              {aiResult.items && aiResult.items.length > 1 && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem" }}>
                    <thead>
                      <tr>
                        {["Item", "Cal", "Prot", "Carbs", "Fat"].map(h => (
                          <th key={h} style={{ textAlign: h === "Item" ? "left" : "right", color: "#b5a898", fontSize: "0.58rem", letterSpacing: "0.06em", textTransform: "uppercase", paddingBottom: "0.3rem", fontWeight: 400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aiResult.items.map((it, i) => (
                        <tr key={i} style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                          <td style={{ padding: "0.25rem 0.3rem 0.25rem 0", color: "#4a4036", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</td>
                          <td style={{ textAlign: "right", padding: "0.25rem 0 0.25rem 0.3rem", color: "#2c2418" }}>{it.calories}</td>
                          <td style={{ textAlign: "right", padding: "0.25rem 0 0.25rem 0.3rem", color: "#2c2418" }}>{fmtMacro(it.protein)}g</td>
                          <td style={{ textAlign: "right", padding: "0.25rem 0 0.25rem 0.3rem", color: "#2c2418" }}>{fmtMacro(it.carbs)}g</td>
                          <td style={{ textAlign: "right", padding: "0.25rem 0 0.25rem 0.3rem", color: "#2c2418" }}>{fmtMacro(it.fat)}g</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ borderTop: "1px solid #d8d0c4", marginTop: "0.25rem" }} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem" }}>
                {[["Cal", aiResult.calories], ["Prot", `${fmtMacro(aiResult.protein)}g`], ["Carbs", `${fmtMacro(aiResult.carbs)}g`], ["Fat", `${fmtMacro(aiResult.fat)}g`]].map(([lbl, val]) => (
                  <div key={lbl} style={{ background: "#fff", borderRadius: 4, padding: "0.35rem", textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.52rem", color: "#b5a898", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lbl}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#2c2418", fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button className="btn-cancel" onClick={() => setAiResult(null)}>Re-submit</button>
            {!isWorkout && (
              <button className="btn-cancel" onClick={saveToFrequent} disabled={saving} style={{ opacity: saving ? 0.4 : 1, borderColor: "#b07d3a", color: "#b07d3a" }}>
                Save to frequent
              </button>
            )}
            <button className="btn-primary" onClick={logToday} disabled={saving} style={{ opacity: saving ? 0.4 : 1 }}>{saving ? "Saving…" : "Log today"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
