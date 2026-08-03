"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/app/lib/supabase";

type View = "today" | "plan" | "progress" | "profile";
type Workout = { id: number; name: string; focus: string; duration: number; calories: number; completed: boolean; day: string };
type Profile = { name: string; email: string; goal: string; dailySteps: number; dailyWater: number; weeklyWorkouts: number };
type Store = { profile: Profile; water: number; steps: number; workouts: Workout[]; startedWorkout?: number };

const starterWorkouts: Workout[] = [
  { id: 1, name: "Foundation strength", focus: "Full body · beginner friendly", duration: 35, calories: 260, completed: false, day: "Mon" },
  { id: 2, name: "Move & mobilize", focus: "Mobility · recovery", duration: 20, calories: 110, completed: false, day: "Wed" },
  { id: 3, name: "Momentum intervals", focus: "Cardio · endurance", duration: 28, calories: 320, completed: false, day: "Fri" },
];

const defaultStore: Store = {
  profile: { name: "", email: "", goal: "Feel stronger and move consistently", dailySteps: 8000, dailyWater: 8, weeklyWorkouts: 3 },
  water: 0, steps: 0, workouts: starterWorkouts,
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    plan: <><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.5-4 2.8-6 7-6s6.5 2 7 6"/></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6z"/>,
    drop: <path d="M12 2s6 6.1 6 11a6 6 0 0 1-12 0c0-4.9 6-11 6-11Z"/>,
    steps: <path d="M8 4c1.1 0 2 .9 2 2v3.5c0 1.4-1.1 2.5-2.5 2.5H5M16 20c-1.1 0-2-.9-2-2v-3.5c0-1.4 1.1-2.5 2.5-2.5H19M8 4h3M16 20h-3"/>,
    play: <path d="m9 6 9 6-9 6z" fill="currentColor" stroke="none"/>,
    check: <path d="m5 12 4.2 4.2L19 6.5"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-5"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M7 23.5c4.3-8.7 8.7-11.2 13.2-7.3 4.5 3.8 7.3 2.8 12.8-6.7" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><circle cx="8" cy="24" r="3" fill="currentColor"/><circle cx="33" cy="9" r="3" fill="currentColor"/></svg><span className="brand-word">BeMotion</span></span>;
}

const percent = (value: number, total: number) => Math.min(100, Math.round((value / total) * 100));
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "BM";

export default function BeMotionApp() {
  const [store, setStore] = useState<Store>(defaultStore);
  const [ready, setReady] = useState(!hasSupabaseConfig);
  const [view, setView] = useState<View>("today");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authPending, setAuthPending] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setReady(true); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setReady(true); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!ready || !user) return;
    const saved = localStorage.getItem(`bemotion-data:${user.id}`);
    window.setTimeout(() => {
      if (saved) {
        try { setStore(JSON.parse(saved)); } catch { localStorage.removeItem(`bemotion-data:${user.id}`); }
      } else {
        setStore({ ...defaultStore, profile: { ...defaultStore.profile, name: String(user.user_metadata.full_name || user.email?.split("@")[0] || "Mover"), email: user.email || "" } });
      }
    }, 0);
  }, [ready, user]);
  useEffect(() => { if (ready && user) localStorage.setItem(`bemotion-data:${user.id}`, JSON.stringify(store)); }, [store, ready, user]);

  const update = (fn: (current: Store) => Store) => setStore((current) => fn(current));
  const completed = store.workouts.filter((w) => w.completed).length;
  const active = store.workouts.find((w) => w.id === store.startedWorkout);
  const score = Math.round((percent(store.steps, store.profile.dailySteps) + percent(store.water, store.profile.dailyWater) + percent(completed, store.profile.weeklyWorkouts)) / 3);
  const greeting = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "").trim();
    if (!hasSupabaseConfig || !supabase) { setAuthError("Supabase is not configured. Add the Project URL and Publishable key to .env.local, then restart the app."); return; }
    if (!email.includes("@") || password.length < 6 || (authMode === "signup" && name.length < 2)) { setAuthError("Enter a valid email and a password of at least 6 characters."); return; }
    setAuthError("");
    setAuthMessage("");
    setAuthPending(true);
    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setAuthPending(false);
    if (result.error) { setAuthError(result.error.message); return; }
    if (authMode === "signup" && !result.data.session) setAuthMessage("Check your email to confirm your account, then sign in.");
  }
  async function signOut() { if (supabase) await supabase.auth.signOut(); setStore(defaultStore); setView("today"); }
  function completeWorkout(id: number) {
    update((current) => ({ ...current, startedWorkout: undefined, workouts: current.workouts.map((w) => w.id === id ? { ...w, completed: true } : w) }));
    setNotice("Workout complete — excellent work.");
  }

  if (!ready) return <div className="loading">Loading your movement space…</div>;
  if (!user) return <AuthScreen mode={authMode} setMode={setAuthMode} error={authError} message={authMessage} pending={authPending} onSubmit={authenticate} />;

  const nav = [{ id: "today", label: "Dashboard", icon: "grid" }, { id: "plan", label: "My plan", icon: "plan" }, { id: "progress", label: "Progress", icon: "chart" }, { id: "profile", label: "Profile", icon: "user" }] as const;
  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><BrandMark /></div><nav>{nav.map((item) => <button key={item.id} className={view === item.id ? "nav active" : "nav"} onClick={() => setView(item.id)}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav><div className="sidebar-user"><div className="avatar">{initials(store.profile.name)}</div><span>{store.profile.name}</span><button aria-label="Log out" onClick={signOut}><Icon name="logout" size={17}/></button></div></aside>
    <section className="workspace">
      {notice && <button className="toast" onClick={() => setNotice("")}>{notice} ×</button>}
      <header className="page-header"><div><p>{greeting}</p><h1>{view === "today" ? `Hi, ${store.profile.name.split(" ")[0]}!` : view === "plan" ? "Your weekly plan" : view === "progress" ? "Your progress" : "Your profile"}</h1></div><div className="header-score"><span>This week</span><strong>{completed}/{store.profile.weeklyWorkouts} sessions</strong></div></header>
      {view === "today" && <Dashboard store={store} score={score} active={active} update={update} completeWorkout={completeWorkout} setView={setView} />}
      {view === "plan" && <Plan store={store} update={update} completeWorkout={completeWorkout} />}
      {view === "progress" && <Progress store={store} score={score} />}
      {view === "profile" && <Profile store={store} update={update} setNotice={setNotice} />}
    </section>
  </main>;
}

function AuthScreen({ mode, setMode, error, message, pending, onSubmit }: { mode: "login" | "signup"; setMode: (m: "login" | "signup") => void; error: string; message: string; pending: boolean; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  return <main className="auth"><section className="auth-copy"><div className="brand"><BrandMark /></div><p className="eyebrow">A simpler way to stay consistent</p><h1>Make movement a habit you can keep.</h1><p>Build a plan around your life, track the small wins, and see your momentum grow.</p><div className="auth-stats"><span><strong>3</strong> focus sessions weekly</span><span><strong>1</strong> clear daily view</span></div></section><section className="auth-panel"><form onSubmit={onSubmit}><p className="eyebrow">{mode === "signup" ? "Start your journey" : "Welcome back"}</p><h2>{mode === "signup" ? "Create your account" : "Sign in to BeMotion"}</h2>{mode === "signup" && <label>Name<input name="name" placeholder="Your name" autoComplete="name" required /></label>}<label>Email<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input name="password" type="password" placeholder="At least 6 characters" minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} required /></label>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-message" role="status">{message}</p>}<button className="primary wide" type="submit" disabled={pending}>{pending ? "Please wait…" : mode === "signup" ? "Create my plan" : "Sign in"}</button><p className="switch">{mode === "signup" ? "Already have an account?" : "New to BeMotion?"} <button type="button" disabled={pending} onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Sign in" : "Create an account"}</button></p></form></section></main>;
}

function Dashboard({ store, score, active, update, completeWorkout, setView }: { store: Store; score: number; active?: Workout; update: (fn: (s: Store) => Store) => void; completeWorkout: (id: number) => void; setView: (v: View) => void }) {
  const next = store.workouts.find((w) => !w.completed) || store.workouts[0];
  return <><section className="hero"><div><p className="eyebrow">Today’s intention</p><h2>{active ? `${active.name} is in progress` : next ? next.name : "You’re all caught up"}</h2><p>{active ? "Finish when you’re ready — your progress is saved." : next ? `${next.focus} · ${next.duration} minutes` : "Take a moment to celebrate your consistency."}</p>{active ? <button className="primary" onClick={() => completeWorkout(active.id)}><Icon name="check"/> Complete workout</button> : next && <button className="primary" onClick={() => update((s) => ({ ...s, startedWorkout: next.id }))}><Icon name="play"/> Start session</button>}</div><div className="score"><strong>{score}%</strong><span>daily rhythm</span></div></section><section className="metric-grid"><Metric icon="steps" label="Steps" value={store.steps.toLocaleString()} goal={store.profile.dailySteps.toLocaleString()} progress={percent(store.steps, store.profile.dailySteps)} action={() => update((s) => ({ ...s, steps: Math.min(s.profile.dailySteps, s.steps + 500) }))} actionLabel="Add 500"/><Metric icon="drop" label="Hydration" value={`${store.water} glasses`} goal={`${store.profile.dailyWater} goal`} progress={percent(store.water, store.profile.dailyWater)} action={() => update((s) => ({ ...s, water: Math.min(s.profile.dailyWater, s.water + 1) }))} actionLabel="Log glass"/><Metric icon="bolt" label="Movement" value={`${store.workouts.filter((w) => w.completed).length} sessions`} goal={`${store.profile.weeklyWorkouts} this week`} progress={percent(store.workouts.filter((w) => w.completed).length, store.profile.weeklyWorkouts)} action={() => setView("plan")} actionLabel="View plan"/></section><section className="split"><div className="card"><div className="card-top"><div><p className="eyebrow">Your focus</p><h3>{store.profile.goal}</h3></div><button className="text-button" onClick={() => setView("profile")}>Edit</button></div><p className="muted">Your plan is designed for steady, repeatable progress. Prioritize showing up over doing it perfectly.</p></div><div className="card"><p className="eyebrow">Up next</p>{next ? <div className="next"><div className="mini-icon"><Icon name="bolt"/></div><div><h3>{next.name}</h3><p>{next.duration} min · {next.calories} kcal est.</p></div><button className="text-button" onClick={() => setView("plan")}>Plan</button></div> : <p className="muted">All planned sessions are complete. Nice work.</p>}</div></section></>;
}

function Metric({ icon, label, value, goal, progress, action, actionLabel }: { icon: string; label: string; value: string; goal: string; progress: number; action: () => void; actionLabel: string }) { return <article className="metric"><div className="metric-icon"><Icon name={icon}/></div><p>{label}</p><h3>{value}</h3><span>{goal}</span><div className="progress"><i style={{ width: `${progress}%` }}/></div><button className="text-button" onClick={action}>{actionLabel} +</button></article>; }

function Plan({ store, update, completeWorkout }: { store: Store; update: (fn: (s: Store) => Store) => void; completeWorkout: (id: number) => void }) { return <><section className="plan-intro"><p>Your personal plan</p><h2>{store.profile.weeklyWorkouts} sessions, built for your goal.</h2><span>Make changes in Profile whenever your schedule shifts.</span></section><section className="workout-list">{store.workouts.map((workout) => <article className="workout" key={workout.id}><div className="day"><strong>{workout.day}</strong><span>{workout.completed ? "Done" : "Planned"}</span></div><div className="workout-main"><h3>{workout.name}</h3><p>{workout.focus}</p><small>{workout.duration} min · {workout.calories} kcal estimated</small></div>{workout.completed ? <span className="complete"><Icon name="check" size={16}/> Complete</span> : store.startedWorkout === workout.id ? <button className="primary" onClick={() => completeWorkout(workout.id)}>Finish session</button> : <button className="secondary" onClick={() => update((s) => ({ ...s, startedWorkout: workout.id }))}>Start</button>}</article>)}</section></>; }

function Progress({ store, score }: { store: Store; score: number }) { const values = [35, 54, 46, 72, 58, 84, score]; return <><section className="progress-hero"><div><p className="eyebrow">Weekly snapshot</p><h2>{score}% daily rhythm</h2><p>Keep building on the actions that make you feel good.</p></div><div><strong>{store.workouts.filter((w) => w.completed).length}</strong><span>sessions complete</span></div></section><section className="card"><div className="card-top"><div><p className="eyebrow">Consistency</p><h3>Your last 7 days</h3></div><span className="muted">Today highlighted</span></div><div className="chart">{values.map((value, i) => <div key={i}><i className={i === 6 ? "today" : ""} style={{ height: `${value}%` }}/><span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span></div>)}</div></section><section className="metric-grid compact"><Metric icon="steps" label="Step goal" value={`${percent(store.steps, store.profile.dailySteps)}%`} goal="of daily target" progress={percent(store.steps, store.profile.dailySteps)} action={() => {}} actionLabel="Today"/><Metric icon="drop" label="Water goal" value={`${percent(store.water, store.profile.dailyWater)}%`} goal="of daily target" progress={percent(store.water, store.profile.dailyWater)} action={() => {}} actionLabel="Today"/><Metric icon="bolt" label="Plan goal" value={`${store.workouts.filter((w) => w.completed).length}/${store.profile.weeklyWorkouts}`} goal="sessions this week" progress={percent(store.workouts.filter((w) => w.completed).length, store.profile.weeklyWorkouts)} action={() => {}} actionLabel="This week"/></section></>; }

function Profile({ store, update, setNotice }: { store: Store; update: (fn: (s: Store) => Store) => void; setNotice: (s: string) => void }) { const [form, setForm] = useState(store.profile); function save(e: FormEvent) { e.preventDefault(); update((s) => ({ ...s, profile: form, steps: Math.min(s.steps, form.dailySteps), water: Math.min(s.water, form.dailyWater) })); setNotice("Your plan preferences have been saved."); } return <form className="profile-form" onSubmit={save}><section className="profile-heading"><div className="profile-avatar">{initials(form.name)}</div><div><p className="eyebrow">Account & plan</p><h2>Make BeMotion yours</h2><p>Your settings shape the goals shown on your dashboard.</p></div></section><div className="form-card"><label>Your name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label><label>Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label><label>What are you working toward?<input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}/></label><div className="form-row"><label>Daily step target<input type="number" min="1000" step="500" value={form.dailySteps} onChange={(e) => setForm({ ...form, dailySteps: Number(e.target.value) })}/></label><label>Daily water target<input type="number" min="1" max="20" value={form.dailyWater} onChange={(e) => setForm({ ...form, dailyWater: Number(e.target.value) })}/></label><label>Weekly sessions<input type="number" min="1" max="7" value={form.weeklyWorkouts} onChange={(e) => setForm({ ...form, weeklyWorkouts: Number(e.target.value) })}/></label></div><button className="primary" type="submit">Save changes</button></div></form>; }
