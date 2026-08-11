import { useState, useEffect } from "react";
import { GLOBAL_CSS } from "../styles.js";
import { TDEE } from "../constants.js";
import SummaryTable from "./SummaryTable.jsx";
import DayPage from "./DayPage.jsx";

export default function AllEntriesPage({ summaries, workoutsMap, profile, onBack, onOpenDay }) {
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(0);
  const [dayOpen, setDayOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const tdee = profile?.tdee ?? TDEE;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const totalPages = Math.ceil(summaries.length / PAGE_SIZE);
  const pageRows = summaries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function openDay(date) { setSelectedDate(date); setDayOpen(true); }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <button className="back-link" onClick={onBack}>← Back</button>
        <h1>All entries</h1>
        <p className="subtitle">{summaries.length} days tracked</p>

        <div style={{ marginTop: "1.5rem" }}>
          <SummaryTable rows={pageRows} workoutsMap={workoutsMap} tdee={tdee} onOpenDay={openDay} />
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", marginTop: "1.5rem", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#9a8f7e" }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ background: "none", border: "1px solid #d6cfc4", color: page === 0 ? "#d6cfc4" : "#6b5f52", padding: "0.3rem 0.7rem", borderRadius: 2, cursor: page === 0 ? "default" : "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
              ← Prev
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              style={{ background: "none", border: "1px solid #d6cfc4", color: page === totalPages - 1 ? "#d6cfc4" : "#6b5f52", padding: "0.3rem 0.7rem", borderRadius: 2, cursor: page === totalPages - 1 ? "default" : "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
              Next →
            </button>
          </div>
        )}
      </div>

      {dayOpen && selectedDate && (
        <DayPage date={selectedDate} workoutsMap={workoutsMap} frequentFoods={[]} profile={profile} onClose={() => setDayOpen(false)} />
      )}
    </div>
  );
}
