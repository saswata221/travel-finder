import { Link } from 'react-router-dom';

export default function DestinationCard({ d }) {
  return (
    <div className="rounded-3xl p-[2px] bg-gradient-to-br from-fuchsia-500 via-cyan-500 to-emerald-500 shadow-lg hover:shadow-2xl transition">
      <Link
        to={`/destinations/${d.id}`}
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
              {(d.visa_type || '').replace('-', ' ') || '—'}
            </span>
          </div>

          {/* Country  */}
          <p className="text-md font-medium text-[#80ed99] mt-1">{d.country}</p>

          {/* Description */}
          {d.short_description && (
            <p className="text-sm mt-2 text-slate-300">{d.short_description}</p>
          )}

          {/* Scores */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-fuchsia-700/40 text-fuchsia-200 ring-1 ring-fuchsia-500">
              Season: {d.season_score ?? '—'}
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
