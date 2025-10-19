// client/src/components/DestinationCard.jsx
import { Link, useLocation } from "react-router-dom";

export default function DestinationCard({ d }) {
  const loc = useLocation();
  const search = loc.search || "";

  // parse start/end from the current location's querystring if present
  const params = new URLSearchParams(search);
  const start = params.get("start") || "";
  const end = params.get("end") || "";

  // compute start month (1..12) if start is a valid YYYY-MM-DD, otherwise empty
  let startMonth = "";
  if (start) {
    const m = Number(start.split("-")[1]); // "YYYY-MM-DD" -> MM
    if (!Number.isNaN(m) && m >= 1 && m <= 12) startMonth = String(m);
  }

  const to = `/destinations/${d.id}${search}`;

  return (
    <div className="rounded-3xl p-[2px] bg-gradient-to-br from-fuchsia-500 via-cyan-500 to-emerald-500 shadow-lg hover:shadow-2xl transition">
      <Link
        to={to}
        // data attributes added so Destination page can read them directly if desired
        data-start={start}
        data-end={end}
        data-start-month={startMonth}
        className="block rounded-3xl overflow-hidden bg-slate-800/90 backdrop-blur-md ring-1 ring-slate-700"
      >
        {/* Image */}
        {d.cover_image ? (
          <img
            src={d.cover_image}
            alt={d.name}
            className="h-44 w-full object-cover"
          />
        ) : (
          <div className="h-44 w-full bg-slate-700/60" />
        )}

        {/* Content */}
        <div className="p-4 text-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{d.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-700/60 text-sky-300 ring-1 ring-blue-500">
              {(d.visa_type || "").replace("-", " ") || "—"}
            </span>
          </div>

          {/* Country (brighter for visibility) */}
          <p className="text-md font-medium text-[#80ed99] mt-1">{d.country}</p>

          {/* Description */}
          {d.short_description && (
            <p className="text-sm mt-2 text-slate-300">{d.short_description}</p>
          )}

          {/* Scores */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-fuchsia-700/40 text-fuchsia-200 ring-1 ring-fuchsia-500">
              Season: {d.season_score ?? "—"}
            </span>
            {d.safety_score != null && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-700/40 text-emerald-200 ring-1 ring-emerald-500">
                Safety {d.safety_score}/5
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
