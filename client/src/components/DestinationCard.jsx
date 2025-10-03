// client/src/components/DestinationCard.jsx
import { Link, useLocation } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";

export default function DestinationCard({ d }) {
  const { search } = useLocation(); // preserve ?start=&end= (and others)

  const cover = d?.cover_image || "";
  const title = d?.name || "Unknown";
  const country = d?.country || "";
  const descr = d?.short_description || "";
  const safety = isFinite(d?.safety_score) ? Number(d.safety_score) : null;
  const visa = d?.visa_type || "";
  const seasonScore = isFinite(d?.season_score) ? Number(d.season_score) : null;

  // Build star array for the season score (0..5)
  const stars = [];
  const s = Math.max(0, Math.min(5, Math.round(seasonScore || 0)));
  for (let i = 0; i < s; i++) stars.push(i);

  return (
    <div className="rounded-3xl p-[2px] bg-gradient-to-br from-fuchsia-500 via-cyan-500 to-emerald-500 shadow-lg hover:shadow-2xl transition">
      <Link
        to={`/destinations/${d.id}${search || ""}`}
        className="block rounded-3xl overflow-hidden bg-slate-800/90 backdrop-blur-md ring-1 ring-slate-700"
      >
        {/* Image */}
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-44 w-full bg-slate-700/60" />
        )}

        {/* Content */}
        <div className="p-4 text-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{title}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-700/60 text-sky-300 ring-1 ring-blue-500">
              {(visa || "").replace("-", " ") || "—"}
            </span>
          </div>

          {/* Country (brighter for visibility) */}
          <p className="text-md font-medium text-[#80ed99] mt-1">{country}</p>

          {/* Description */}
          {descr && (
            <p className="text-sm mt-2 text-slate-300 line-clamp-2">{descr}</p>
          )}

          {/* Scores */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {/* Season score stars */}
            <div className="flex items-center gap-1">
              {stars.map((i) => (
                <AiFillStar key={i} className="w-4 h-4 text-amber-400" />
              ))}
              {s === 0 && (
                <span className="text-xs text-slate-400">No season data</span>
              )}
              {seasonScore != null && (
                <span className="text-xs text-slate-300">
                  ({seasonScore}/5)
                </span>
              )}
            </div>

            {/* Safety */}
            {safety != null && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-700/40 text-emerald-200 ring-1 ring-emerald-500">
                Safety {safety}/5
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
