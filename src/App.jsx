import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";
import { GLOBAL_CSS } from "./styles.js";
import { TDEE, DEFAULT_PROFILE, fmtDate } from "./constants.js";
import HomeAIBox from "./components/HomeAIBox.jsx";
import SummaryTable from "./components/SummaryTable.jsx";
import DayPage from "./components/DayPage.jsx";
import AllEntriesPage from "./components/AllEntriesPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import CalcPage from "./components/CalcPage.jsx";
import FrequentPage from "./components/FrequentPage.jsx";
import SmoothiePage from "./components/SmoothiePage.jsx";

export default function App() {
  const today = fmtDate(new Date());
  const [page, setPage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [dayOpen, setDayOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [summaries, setSummaries] = useState([]);
  const [workoutsMap, setWorkoutsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [frequentFoods, setFrequentFoods] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const fetchHome = useCallback(async () => {
    setLoading(true);
    const [{ data: food }, { data: work }] = await Promise.all([
      supabase.from("food_log").select("date, calories, protein").order("date", { ascending: false }),
      supabase.from("workouts").select("date, burn_value, notes"),
    ]);
    const byDate = { [today]: { calories: 0, protein: 0 } };
    for (const e of food || []) {
      if (!byDate[e.date]) byDate[e.date] = { calories: 0, protein: 0 };
      byDate[e.date].calories += e.calories || 0;
      byDate[e.date].protein += e.protein || 0;
    }
    setSummaries(Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])));
    const wm = {};
    for (const w of work || []) wm[w.date] = w;
    setWorkoutsMap(wm);
    setLoading(false);
  }, []);

  useEffect(() => { fetchHome(); }, [fetchHome]);
  useEffect(() => {
    supabase.from("frequent_foods").select("*").order("name")
      .then(({ data }) => setFrequentFoods(data || []));
    supabase.from("user_profile").select("*").eq("id", 1).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, []);

  function openDay(date) { setSelectedDate(date); setDayOpen(true); }

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const tdee = profile.tdee;
  const todaySummary = summaries.find(([d]) => d === today);
  const todayCals = todaySummary ? todaySummary[1].calories : 0;
  const todayProtein = todaySummary ? todaySummary[1].protein : 0;
  const todayWorkout = workoutsMap[today];
  const todayBurn = tdee + (todayWorkout ? todayWorkout.burn_value : 0);
  const displayName = profile.name || "there";

  const navItems = [
    { label: "Calculation rule", key: "calc" },
    { label: "My foods",         key: "frequent" },
    { label: "Smoothie calculator", key: "smoothie" },
    { label: "My profile",       key: "profile" },
  ];

  if (page === "calc")     return <CalcPage onBack={() => setPage(null)} tdee={tdee} />;
  if (page === "frequent") return <FrequentPage frequentFoods={frequentFoods} onBack={() => setPage(null)} />;
  if (page === "profile")  return <ProfilePage profile={profile} onBack={() => setPage(null)} onSaved={p => { setProfile(p); setPage(null); }} />;
  if (page === "all")      return <AllEntriesPage summaries={summaries} workoutsMap={workoutsMap} profile={profile} onBack={() => setPage(null)} onOpenDay={openDay} />;
  if (dayOpen)             return <DayPage date={selectedDate} workoutsMap={workoutsMap} frequentFoods={frequentFoods} profile={profile} onClose={() => { setDayOpen(false); fetchHome(); }} />;
  if (page === "smoothie") return <SmoothiePage frequentFoods={frequentFoods} todayCals={todayCals} todayProtein={todayProtein} todayBurn={todayBurn} onBack={() => setPage(null)} onSaved={() => { setPage(null); fetchHome(); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef", fontFamily: "Georgia, serif", color: "#2c2418" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h1>Hi, {displayName}!</h1>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", display: "flex", flexDirection: "column", gap: "5px", marginTop: "0.4rem" }}>
              <span style={{ display: "block", width: 22, height: 2, background: "#6b5f52", borderRadius: 1 }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#6b5f52", borderRadius: 1 }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#6b5f52", borderRadius: 1 }} />
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", border: "1px solid #e8e2d8", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 200, minWidth: 180, overflow: "hidden" }}>
                {navItems.map(({ label, key }) => (
                  <button key={key} onClick={() => { setPage(key); setMenuOpen(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.04em", color: "#3d3228", background: "none", border: "none", borderBottom: "1px solid #f0ebe3", padding: "0.75rem 1rem", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f7f4ef"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <HomeAIBox onLogged={fetchHome} profile={profile} tdee={tdee} frequentFoods={frequentFoods} />

        {loading ? (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#b5a898" }}>Loading…</div>
        ) : (
          <>
            <SummaryTable rows={summaries.slice(0, 10)} workoutsMap={workoutsMap} tdee={tdee} onOpenDay={openDay} />
            {summaries.length > 10 && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button className="rules-link" onClick={() => setPage("all")} style={{ fontSize: "0.72rem" }}>
                  View all {summaries.length} entries →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
