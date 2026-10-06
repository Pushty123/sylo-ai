// OpenProjects.jsx — "Explore Projects": every project a company has released (status open / forming team).
// Reads the safe `open_projects` view (no confidential data) and lets users apply.
//

import { supabase } from "./supabase";
import { useEffect, useMemo, useState } from "react";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const STATUS = {
  open: { label: "Open for applications", cls: "bg-emerald-900/50 text-emerald-300" },
  forming_team: { label: "Forming team", cls: "bg-amber-900/40 text-amber-300" },
};

export default function OpenProjects() {
  const [projects, setProjects] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [applied, setApplied] = useState(new Set());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("all");
  const [applying, setApplying] = useState(null); // project being applied to
  const [motivation, setMotivation] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const [{ data: p }, { data: s }, { data: a }] = await Promise.all([
        supabase.from("open_projects").select("*").order("created_at", { ascending: false }),
        user ? supabase.from("user_skills").select("skill_name").eq("user_id", user.id) : { data: [] },
        user ? supabase.from("project_applications").select("project_id").eq("applicant_id", user.id) : { data: [] },
      ]);
      setProjects(p || []);
      setMySkills((s || []).map((x) => x.skill_name.toLowerCase()));
      setApplied(new Set((a || []).map((x) => x.project_id)));
      setLoading(false);
    })();
  }, []);

  const companies = useMemo(() => [...new Set(projects.map((p) => p.company_name).filter(Boolean))], [projects]);

  const matchOf = (p) => {
    const skills = p.skills || [];
    if (!skills.length || !mySkills.length) return null;
    const hit = skills.filter((s) => mySkills.includes(s.skill.toLowerCase())).length;
    return Math.round((hit / skills.length) * 100);
  };

  const visible = projects.filter((p) => {
    const q = search.toLowerCase();
    const okSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.public_summary || "").toLowerCase().includes(q) ||
      (p.skills || []).some((s) => s.skill.toLowerCase().includes(q));
    return okSearch && (company === "all" || p.company_name === company);
  });

  const submitApplication = async () => {
    const { error } = await supabase.from("project_applications").insert({
      project_id: applying.id,
      applicant_id: user.id,
      proposed_role: "student",
      motivation,
    });
    if (error) {
      setToast("Could not apply: " + error.message);
    } else {
      setApplied(new Set([...applied, applying.id]));
      setToast(`Application sent to ${applying.company_name} ✔`);
    }
    setApplying(null);
    setMotivation("");
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-zinc-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Explore Projects</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Research projects released by companies. Confidential details unlock once you join the team.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, topic or skill…"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm outline-none focus:border-emerald-600"
        >
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-400">No projects match your search.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((p) => {
            const match = matchOf(p);
            const st = STATUS[p.status] || STATUS.open;
            return (
              <div key={p.id} className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-emerald-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{p.company_name}</p>
                    <h2 className="mt-1 font-semibold leading-snug">{p.title}</h2>
                  </div>
                  {match !== null && (
                    <span className="shrink-0 rounded-full bg-emerald-900/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      {match}% match
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-zinc-400">{p.public_summary}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(p.skills || []).map((s) => (
                    <span
                      key={s.skill}
                      className={`rounded-md px-2 py-1 text-xs ${
                        mySkills.includes(s.skill.toLowerCase())
                          ? "bg-emerald-900/40 text-emerald-300"
                          : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {s.skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-100">{inr(p.budget)}</span>
                  <span>{p.milestone_count} milestones</span>
                  <span>🔒 {String(p.sensitivity).replace("_", " ")}</span>
                  <span className={`rounded-full px-2 py-0.5 ${st.cls}`}>{st.label}</span>
                </div>

                <div className="mt-5 flex-1" />
                {applied.has(p.id) ? (
                  <button disabled className="rounded-lg border border-emerald-800 py-2 text-sm text-emerald-400">
                    Applied ✔
                  </button>
                ) : (
                  <button
                    onClick={() => setApplying(p)}
                    disabled={!user}
                    className="rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {user ? "Apply to join" : "Sign in to apply"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {applying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs uppercase tracking-wide text-emerald-400">{applying.company_name}</p>
            <h3 className="mt-1 text-lg font-semibold">{applying.title}</h3>
            <label className="mt-4 block text-sm text-zinc-300">Why are you a good fit?</label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={4}
              placeholder="Your relevant skills, past work and what you'd contribute…"
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setApplying(null)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={!motivation.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Send application
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
