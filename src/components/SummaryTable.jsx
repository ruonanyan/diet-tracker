import { DEFICIT_TARGET, PROTEIN_TARGET, fmtMacro, displayShort } from "../constants.js";

const HEADER_STYLE = {
  fontFamily: "var(--font-family, inherit)",
  fontSize: "0.72rem",
  fontWeight: 500,
  color: "var(--secondary-text-color, #676879)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  padding: "0.5rem 0.6rem",
  textAlign: "left",
  borderBottom: "2px solid var(--ui-border-color, #d0d4e4)",
};

const CELL_STYLE = {
  padding: "0.55rem 0.6rem",
  fontSize: "0.82rem",
  color: "var(--primary-text-color, #323338)",
  borderBottom: "1px solid var(--ui-border-color, #d0d4e4)",
  whiteSpace: "nowrap",
};

export default function SummaryTable({ rows, workoutsMap, tdee, onOpenDay }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <colgroup>
        <col style={{ width: "18%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "22%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "20%" }} />
      </colgroup>
      <thead>
        <tr>
          {["Date", "Eaten", "Burn", "Deficit", "Protein"].map(h => (
            <th key={h} style={HEADER_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([date, { calories, protein }]) => {
          const wk      = workoutsMap[date];
          const burn    = tdee + (wk ? wk.burn_value : 0);
          const deficit = burn - calories;
          const deficitColor =
            deficit >= DEFICIT_TARGET
              ? "var(--positive-color, #258750)"
              : deficit >= 0
              ? "var(--primary-text-color, #323338)"
              : "var(--negative-color, #d83a52)";
          const proteinColor =
            protein >= PROTEIN_TARGET
              ? "var(--positive-color, #258750)"
              : "var(--primary-text-color, #323338)";

          return (
            <tr
              key={date}
              onClick={() => onOpenDay(date)}
              style={{ cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-background-hover-color, #f5f6f8)")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}
            >
              <td style={CELL_STYLE}>{displayShort(date)}</td>
              <td style={CELL_STYLE}>{calories.toLocaleString()}</td>
              <td style={CELL_STYLE}>{wk ? "💪 " : ""}{burn.toLocaleString()}</td>
              <td style={{ ...CELL_STYLE, color: deficitColor, fontWeight: 700 }}>
                {deficit >= 0 ? "−" : "+"}{Math.abs(deficit)}
              </td>
              <td style={{ ...CELL_STYLE, color: proteinColor, fontWeight: 700 }}>
                {fmtMacro(protein)}g
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
