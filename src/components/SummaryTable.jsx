import {
  Table, TableHeader, TableHeaderCell,
  TableBody, TableRow, TableCell, Text,
} from "@vibe/core";
import { DEFICIT_TARGET, PROTEIN_TARGET, fmtMacro, displayShort } from "../constants.js";

const COLUMNS = [
  { id: "date",    title: "Date",    width: 95 },
  { id: "eaten",   title: "Eaten",   width: 70 },
  { id: "burn",    title: "Burn",    width: 75 },
  { id: "deficit", title: "Deficit", width: 80 },
  { id: "protein", title: "Protein", width: 75 },
];

export default function SummaryTable({ rows, workoutsMap, tdee, onOpenDay }) {
  return (
    <Table columns={COLUMNS} style={{ width: "100%" }}>
      <TableHeader>
        {COLUMNS.map(col => (
          <TableHeaderCell key={col.id} title={col.title} />
        ))}
      </TableHeader>
      <TableBody>
        {rows.map(([date, { calories, protein }]) => {
          const wk      = workoutsMap[date];
          const burn    = tdee + (wk ? wk.burn_value : 0);
          const deficit = burn - calories;
          const deficitColor  = deficit >= DEFICIT_TARGET ? "positive" : deficit >= 0 ? "primary" : "negative";
          const proteinColor  = protein >= PROTEIN_TARGET ? "positive" : "primary";
          return (
            <TableRow key={date} onClick={() => onOpenDay(date)} style={{ cursor: "pointer" }}>
              <TableCell>
                <Text type="text2">{displayShort(date)}</Text>
              </TableCell>
              <TableCell>
                <Text type="text2">{calories.toLocaleString()}</Text>
              </TableCell>
              <TableCell>
                <Text type="text2">{wk ? "💪 " : ""}{burn.toLocaleString()}</Text>
              </TableCell>
              <TableCell>
                <Text type="text2" color={deficitColor} weight="bold">
                  {deficit >= 0 ? "−" : "+"}{Math.abs(deficit)}
                </Text>
              </TableCell>
              <TableCell>
                <Text type="text2" color={proteinColor} weight="bold">
                  {fmtMacro(protein)}g
                </Text>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
