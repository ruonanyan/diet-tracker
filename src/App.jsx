import { useState, useEffect, useCallback } from "react";
import { Heading, MenuButton, Menu, MenuItem, Button, Loader } from "@vibe/core";
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
      byDate[e.date].calories += parseFloat(e.calories) || 0;
      byDate[e.date].protein += parseFloat(e.protein) || 0;
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

  const tdee = profile.tdee;
  const todaySummary = summaries.find(([d]) => d === today);
  const todayCals = todaySummary ? todaySummary[1].calories : 0;
  const todayProtein = todaySummary ? todaySummary[1].protein : 0;
  const todayWorkout = workoutsMap[today];
  const todayBurn = tdee + (todayWorkout ? todayWorkout.burn_value : 0);
  const displayName = profile.name || "there";

  if (page === "calc")     return <CalcPage onBack={() => setPage(null)} tdee={tdee} />;
  if (page === "frequent") return <FrequentPage frequentFoods={frequentFoods} onBack={() => setPage(null)} />;
  if (page === "profile")  return <ProfilePage profile={profile} onBack={() => setPage(null)} onSaved={p => { setProfile(p); setPage(null); }} />;
  if (page === "all")      return <AllEntriesPage summaries={summaries} workoutsMap={workoutsMap} profile={profile} onBack={() => setPage(null)} onOpenDay={openDay} />;
  if (dayOpen)             return <DayPage date={selectedDate} workoutsMap={workoutsMap} frequentFoods={frequentFoods} profile={profile} onClose={() => { setDayOpen(false); fetchHome(); }} />;
  if (page === "smoothie") return <SmoothiePage frequentFoods={frequentFoods} todayCals={todayCals} todayProtein={todayProtein} todayBurn={todayBurn} onBack={() => setPage(null)} onSaved={() => { setPage(null); fetchHome(); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--secondary-background-color)" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <Heading type="h1">Hi, {displayName}!</Heading>
          <MenuButton aria-label="Navigation" closeMenuOnItemClick>
            <Menu id="app-nav">
              <MenuItem title="Calculation rule" onClick={() => setPage("calc")} />
              <MenuItem title="My foods"         onClick={() => setPage("frequent")} />
              <MenuItem title="Smoothie calculator" onClick={() => setPage("smoothie")} />
              <MenuItem title="My profile"       onClick={() => setPage("profile")} />
            </Menu>
          </MenuButton>
        </div>

        <HomeAIBox onLogged={fetchHome} profile={profile} tdee={tdee} frequentFoods={frequentFoods} />

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
            <Loader size="small" />
          </div>
        ) : (
          <>
            <SummaryTable rows={summaries.slice(0, 10)} workoutsMap={workoutsMap} tdee={tdee} onOpenDay={openDay} />
            {summaries.length > 10 && (
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <Button kind="tertiary" size="small" onClick={() => setPage("all")}>
                  View all {summaries.length} entries →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
