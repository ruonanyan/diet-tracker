import { useState } from "react";
import { GLOBAL_CSS } from "../styles.js";
import { fmtMacro } from "../constants.js";

export default function FrequentPage({ frequentFoods, onBack }) {
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
              <th>Serving</th>
              <th>Grams</th>
              <th>Cal</th>
              <th>Protein</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const sg = f.serving_grams != null ? parseFloat(f.serving_grams) : null;
              const sgStr = sg != null ? `${sg}g` : "";
              return (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td style={{ color: "#9a8f7e", fontSize: "0.75rem" }}>{f.serving}</td>
                  <td style={{ color: "#9a8f7e", fontSize: "0.75rem" }}>{sgStr}</td>
                  <td style={{ fontWeight: 500 }}>{f.calories}</td>
                  <td style={{ color: "#6b5f52" }}>{fmtMacro(f.protein)}g</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
