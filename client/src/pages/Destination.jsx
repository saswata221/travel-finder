// client/src/pages/Destination.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { api } from "../services/http";
import { AiFillStar } from "react-icons/ai";
import RobotNotifier from "../components/RobotNotifier";

function useQuery() {
  const { search } = useLocation();
  return useMemo(
    () => Object.fromEntries(new URLSearchParams(search)),
    [search]
  );
}

function monthsFromRange(start, end) {
  if (!start || !end) return [];
  const s = new Date(start + "T00:00");
  const e = new Date(end + "T00:00");
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return [];
  const cur = new Date(s);
  cur.setDate(1);
  const months = [];
  while (cur <= e) {
    months.push(cur.getMonth() + 1); // 1..12
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export default function Destination() {
  const { id } = useParams();
  const q = useQuery();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api(`/api/destinations/${id}`)
      .then(setData)
      .catch((e) => setError(e.message || "Error"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <p className="text-center text-slate-300">Loading…</p>
      </PageShell>
    );
  }
  if (error) {
    return (
      <PageShell>
        <p className="text-center text-red-400">Error: {error}</p>
      </PageShell>
    );
  }
  if (!data) {
    return (
      <PageShell>
        <p className="text-center text-slate-300">Not found.</p>
      </PageShell>
    );
  }

  // ----- Gallery: show only non-cover images -----
  const galleryImages = Array.isArray(data.images)
    ? data.images.filter((im) => !im.is_cover)
    : [];
  const hasImages = galleryImages.length > 0;
  const mapsSrc = buildMapEmbedSrc(data);

  // ----- Compute rating from selected dates (if any) -----
  const selectedMonths = monthsFromRange(q.start, q.end);
  const monthToScore = new Map(
    (data.seasonality || []).map((s) => [s.month, s.suitability])
  );
  const selectedScores = selectedMonths
    .map((m) => monthToScore.get(m))
    .filter((v) => Number.isInteger(v));
  const computedRating = selectedScores.length
    ? Math.max(...selectedScores)
    : undefined;

  // ----- Resolve message template for rating and inject placeholders -----
  const templateFor = (r) =>
    (data.messages || []).find((x) => x.rating === r)?.message_template;
  const bestSeasons = data.best_seasons || "";
  const inject = (tpl) =>
    (tpl || "")
      .replaceAll("{name}", data.name || "")
      .replaceAll("{best_seasons}", bestSeasons || "");

  const finalMessage = computedRating
    ? inject(templateFor(computedRating)) || `Happy journey to ${data.name}!`
    : "Happy journey";

  return (
    <PageShell>
      {/* Media row: images (left) + map (right) */}
      <section className="grid md:grid-cols-3 gap-4">
        {/* Images column */}
        <div
          className={
            hasImages
              ? "md:col-span-2 space-y-4 relative"
              : "md:col-span-3 relative"
          }
        >
          {hasImages ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {galleryImages.map((im, i) => (
                <img
                  key={i}
                  src={im.image_url}
                  className="rounded-xl w-full h-56 object-cover ring-1 ring-slate-700"
                  alt=""
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl w-full h-56 ring-1 ring-slate-700 bg-slate-800/60" />
          )}

          {/* Title anchored at the bottom of the image column */}
          <div className="pb-8" />
          <header className="absolute bottom-0 left-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {data.name}
            </h1>
            <p className="text-slate-400">{data.country}</p>
          </header>
        </div>

        {/* Map column */}
        <div className={hasImages ? "md:col-span-1" : "md:col-span-3"}>
          <div className="h-full min-h-[22rem] rounded-xl overflow-hidden ring-1 ring-slate-700 bg-slate-900/60">
            <iframe
              title="map"
              src={mapsSrc}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* About */}
      {data.about && (
        <section className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-2 text-slate-200">About</h3>
          <p className="text-slate-300 leading-relaxed">{data.about}</p>
        </section>
      )}

      {/* Quick facts */}
      <section className="grid sm:grid-cols-3 gap-4">
        <Info
          label="Safety"
          value={isFinite(data.safety_score) ? `${data.safety_score}/5` : "—"}
        />
        <Info label="Visa" value={data.visa_type || "—"} />
        <Info
          label="Avg daily cost"
          value={data.avg_daily_cost ? `₹${data.avg_daily_cost}` : "—"}
        />
      </section>

      {/* Tags */}
      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <section className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-2 text-slate-200">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((t) => (
              <span
                key={t.id}
                className="px-2 py-1 rounded-lg bg-sky-900/40 ring-1 ring-sky-700 text-sky-100 text-sm"
              >
                {t.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Seasonality */}
      {Array.isArray(data.seasonality) && data.seasonality.length > 0 && (
        <section className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-2 text-slate-200">Seasonality</h3>
          <div className="grid grid-cols-6 gap-2">
            {data.seasonality.map((s) => (
              <div
                key={s.month}
                className={`p-2 rounded-lg text-center backdrop-blur-sm ring-1 ${seasonGlassColor(
                  s.suitability
                )}`}
              >
                <div className="text-xs text-slate-200">
                  {monthName(s.month)}
                </div>
                <div className="font-semibold text-slate-100">
                  {s.suitability}/5
                </div>

                {/* Stars */}
                <div className="flex justify-center mt-1">
                  {Array.from({ length: s.suitability }).map((_, i) => (
                    <AiFillStar
                      key={i}
                      className="w-4 h-4 mx-0.5"
                      style={{ color: starColor(s.suitability) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky robot notifier */}
      <RobotNotifier message={finalMessage} />
    </PageShell>
  );
}

/* ---------- helpers ---------- */

function PageShell({ children }) {
  return (
    <article className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-[var(--page-max)] px-4 pt-28 pb-16 space-y-8">
        {children}
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-900/40 to-emerald-900/40 ring-1 ring-slate-700">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="font-semibold text-lg text-white">{value}</div>
    </div>
  );
}

function monthName(m) {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][m - 1];
}

function seasonGlassColor(score) {
  switch (score) {
    case 5:
      return "bg-emerald-500/30 ring-emerald-400/40";
    case 4:
      return "bg-teal-500/30 ring-teal-400/40";
    case 3:
      return "bg-amber-400/30 ring-amber-300/40";
    case 2:
      return "bg-orange-500/30 ring-orange-400/40";
    case 1:
      return "bg-red-500/30 ring-red-400/40";
    default:
      return "bg-slate-600/30 ring-slate-500/40";
  }
}

function starColor(score) {
  switch (score) {
    case 5:
      return "#22c55e";
    case 4:
      return "#10b981";
    case 3:
      return "#facc15";
    case 2:
      return "#f97316";
    case 1:
      return "#ef4444";
    default:
      return "#a3a3a3";
  }
}

function buildMapEmbedSrc(data) {
  const q = encodeURIComponent(
    [data.name, data.country].filter(Boolean).join(", ")
  );
  return `https://www.google.com/maps?q=${q}&output=embed`;
}
