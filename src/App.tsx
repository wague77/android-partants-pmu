import { useEffect, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";

declare global { interface Window { nova: { fetch: typeof fetch } } }

const BASE = "https://offline.turfinfo.api.pmu.fr/rest/client/7/programme/";
type Course = { numOrdre: number; libelle: string; heureDepart: number; distance: number; discipline: string; nombreDeclaresPartants: number; paris?: { codePari: string }[] };
type Prono = { selection?: { rang: number; num_partant: number; cote_prob?: string }[] };
const JEUX: Record<string, [string, number]> = { SIMPLE_GAGNANT: ["Simple gagnant", 1], SIMPLE_PLACE: ["Simple placé", 1], COUPLE_GAGNANT: ["Couplé gagnant", 2], COUPLE_PLACE: ["Couplé placé", 2], COUPLE_ORDRE: ["Couplé ordre", 2], DEUX_SUR_QUATRE: ["2 sur 4", 2], TRIO: ["Trio", 3], TRIO_ORDRE: ["Trio ordre", 3], TIERCE: ["Tiercé", 3], SUPER_QUATRE: ["Super 4", 4], QUARTE_PLUS: ["Quarté+", 4], MINI_MULTI: ["Mini multi", 4], MULTI: ["Multi", 4], QUINTE_PLUS: ["Quinté+", 5], PICK5: ["Pick 5", 5] };
type Reunion = { numOfficiel: number; hippodrome: { libelleCourt: string }; courses: Course[] };
type Participant = { numPmu: number; nom: string; age: number; sexe: string; driver?: string; entraineur?: string; proprietaire?: string; statut: string; musique?: string; dernierRapportDirect?: { rapport: number } };

function toKey(d: Date) { return String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0") + d.getFullYear(); }
async function get(url: string) {
  const call = window.nova?.fetch ?? fetch;
  const r = await call(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error("Données PMU indisponibles (" + r.status + ")");
  return r.json();
}
const heure = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export default function App() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
  const [parts, setParts] = useState<Participant[]>([]);
  const [err, setErr] = useState("");
  const [prono, setProno] = useState<Prono | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const key = toKey(new Date(date + "T12:00:00"));

  useEffect(() => {
    setLoading(true); setErr(""); setReunions([]); setSel(null); setParts([]);
    get(BASE + key).then((d) => {
      const rs: Reunion[] = d.programme?.reunions ?? [];
      setReunions(rs);
      if (rs[0]?.courses[0]) setSel({ r: rs[0].numOfficiel, c: rs[0].courses[0].numOrdre });
    }).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, [key]);

  function loadParts() {
    if (!sel) return;
    setLoading(true); setErr("");
    setProno(null); setComment("");
    get(`${BASE}${key}/R${sel.r}/C${sel.c}/pronostics`).then(setProno).catch(() => {});
    get(`${BASE}${key}/R${sel.r}/C${sel.c}/pronostics-detailles`).then((d) => setComment(d.commentaire?.texte ?? "")).catch(() => {});
    get(`${BASE}${key}/R${sel.r}/C${sel.c}/participants`).then((d) => setParts(d.participants ?? [])).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }
  useEffect(loadParts, [sel, key]);

  const reunion = reunions.find((r) => r.numOfficiel === sel?.r);
  const course = reunion?.courses.find((c) => c.numOrdre === sel?.c);

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50">
      <header className="border-b border-emerald-800 px-4 py-4 flex flex-wrap items-center gap-3">
        <Trophy className="text-amber-400" />
        <h1 className="text-xl font-bold flex-1">Partants PMU</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded bg-emerald-900 px-2 py-1 text-sm" />
        <button onClick={loadParts} className="rounded bg-amber-400 px-3 py-1 text-sm font-semibold text-emerald-950 flex items-center gap-1"><RefreshCw size={14} /> Actualiser</button>
      </header>
      <main className="mx-auto max-w-5xl p-4 space-y-4">
        {err && <p className="rounded bg-red-900/60 p-3 text-sm">{err}</p>}
        {!loading && !err && !reunions.length && <p className="text-emerald-300">Aucune réunion ce jour.</p>}
        <div className="flex flex-wrap gap-2">{reunions.map((r) => (
          <button key={r.numOfficiel} onClick={() => setSel({ r: r.numOfficiel, c: r.courses[0]?.numOrdre ?? 1 })} className={`rounded-full px-3 py-1 text-sm ${sel?.r === r.numOfficiel ? "bg-amber-400 text-emerald-950" : "bg-emerald-900"}`}>R{r.numOfficiel} · {r.hippodrome.libelleCourt}</button>
        ))}</div>
        {reunion && <div className="flex flex-wrap gap-2">{reunion.courses.map((c) => (
          <button key={c.numOrdre} onClick={() => setSel({ r: reunion.numOfficiel, c: c.numOrdre })} className={`rounded px-2 py-1 text-xs ${sel?.c === c.numOrdre ? "bg-emerald-500 text-emerald-950" : "bg-emerald-900"}`}>C{c.numOrdre} · {heure(c.heureDepart)}</button>
        ))}</div>}
        {course && <section className="rounded-xl bg-emerald-900/60 p-4">
          <h2 className="text-lg font-semibold">R{sel?.r}C{course.numOrdre} — {course.libelle}</h2>
          <p className="text-sm text-emerald-300">{heure(course.heureDepart)} · {course.distance} m · {course.discipline} · {course.nombreDeclaresPartants} partants</p>
        </section>}
        {course && prono?.selection?.length ? (() => {
          const sel5 = [...prono.selection!].sort((a, b) => a.rang - b.rang);
          const name = (n: number) => parts.find((p) => p.numPmu === n)?.nom ?? "";
          const codes = [...new Set((course.paris ?? []).map((p) => p.codePari.replace(/^E_/, "")))].filter((c) => JEUX[c]);
          return <section className="rounded-xl border border-amber-400/40 bg-emerald-900/60 p-4 space-y-3">
            <h3 className="font-semibold text-amber-300">Pronostic PMU</h3>
            <div className="flex flex-wrap gap-2">{sel5.map((x) => <span key={x.rang} className="rounded bg-emerald-800 px-2 py-1 text-sm"><b className="text-amber-300">{x.rang}.</b> n°{x.num_partant} {name(x.num_partant)} {x.cote_prob && <span className="text-xs text-emerald-300">({x.cote_prob})</span>}</span>)}</div>
            {comment && <p className="text-sm text-emerald-200 italic">{comment}</p>}
            <div className="grid gap-2 sm:grid-cols-2">{codes.map((c) => { const [label, n] = JEUX[c]!; const pick = sel5.slice(0, n).map((x) => x.num_partant); return pick.length === n ? <div key={c} className="flex items-center justify-between rounded bg-emerald-950/60 px-3 py-2 text-sm"><span>{label}</span><b className="text-amber-300">{pick.join(" - ")}</b></div> : null; })}</div>
            <p className="text-xs text-emerald-400">Sélection de la presse PMU, appliquée à chaque jeu proposé sur cette course. Jouer comporte des risques : endettement, dépendance… Appelez le 09 74 75 13 13 (appel non surtaxé).</p>
          </section>;
        })() : null}
        {loading && <p className="text-emerald-300">Chargement…</p>}
        <div className="grid gap-2">{parts.map((p) => (
          <div key={p.numPmu} className={`flex items-center gap-3 rounded-lg bg-emerald-900/40 p-3 ${p.statut !== "PARTANT" ? "opacity-50" : ""}`}>
            <span className="grid size-10 place-items-center rounded-full bg-amber-400 font-bold text-emerald-950">{p.numPmu}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{p.nom} {p.statut !== "PARTANT" && <span className="text-xs text-red-300">({p.statut})</span>}</p>
              <p className="text-xs text-emerald-300 truncate">{p.sexe.toLowerCase()} {p.age} ans · Jockey/Driver : {p.driver ?? "—"} · Entraîneur : {p.entraineur ?? "—"}</p>
              {p.musique && <p className="text-xs text-emerald-400">Musique : {p.musique}</p>}
            </div>
            {p.dernierRapportDirect && <span className="text-sm font-semibold text-amber-300">{p.dernierRapportDirect.rapport}</span>}
          </div>
        ))}</div>
      </main>
    </div>
  );
}
