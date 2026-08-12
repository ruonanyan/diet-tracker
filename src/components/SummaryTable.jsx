import { TDEE, DEFICIT_TARGET, PROTEIN_TARGET, fmtMacro, displayShort } from "../constants.js";

export default function SummaryTable({ rows, workoutsMap, tdee, onOpenDay }) {
  return (
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
        {rows.map(([date, { calories, protein }]) => {
          const wk = workoutsMap[date];
          const burn = tdee + (wk ? wk.burn_value : 0);
          const deficit = burn - calories;
          const deficitColor = deficit >= DEFICIT_TARGET ? "#3a7d44" : deficit >= 0 ? "#2c2418" : "#b84040";
          const proteinColor = protein >= PROTEIN_TARGET ? "#3a7d44" : "#2c2418";
          return (
            <tr key={date} onClick={() => onOpenDay(date)}>
              <td><span className="date-str">{displayShort(date)}</span></td>
              <td>
                <span className="cell-small">{calories.toLocaleString()}</span>
              </td>
              <td>
                {wk && <span style={{ fontSize: "13px", marginRight: "3px" }}>💪</span>}
                <span className="cell-small">{burn.toLocaleString()}</span>
              </td>
              <td>
                <span style={{ color: deficitColor, fontWeight: 600, fontSize: "1.05rem" }}>
                  {deficit >= 0 ? "−" : "+"}{Math.abs(deficit)}
                </span>
              </td>
              <td><span className="protein-big" style={{ color: proteinColor }}>{fmtMacro(protein)}g</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
