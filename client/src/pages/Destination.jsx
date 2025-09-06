import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/http';
import { AiFillStar } from 'react-icons/ai'; 

export default function Destination() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    api(`/api/destinations/${id}`)
      .then(setData)
      .catch(e => setError(e.message || 'Error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageShell><p className="text-center text-slate-300">Loading…</p></PageShell>;
  }
  if (error) {
    return <PageShell><p className="text-center text-red-400">Error: {error}</p></PageShell>;
  }
  if (!data) {
    return <PageShell><p className="text-center text-slate-300">Not found.</p></PageShell>;
  }

  const hasImages = Array.isArray(data.images) && data.images.length > 0;
  const mapsSrc = buildMapEmbedSrc(data);

  return (
    <PageShell>
      
      <section className="grid md:grid-cols-3 gap-4">
      
        <div className={hasImages ? "md:col-span-2 space-y-4 relative" : "md:col-span-3 relative"}>
          {hasImages ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.images.map((im, i) => (
                <img
                  key={i}
                  src={im.image_url}
                  className="rounded-xl w-full h-56 object-cover ring-1 ring-slate-700"
                  alt=""
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl w-full h-56 ring-1 ring-slate-700 bg-slate-800/60" />
          )}

         
          <div className="pb-8" />
          <header className="absolute bottom-0 left-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{data.name}</h1>
            <p className="text-slate-400">{data.country}</p>
          </header>
        </div>


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
        <section className="text-lg leading-relaxed bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 ring-1 ring-slate-700 text-slate-200">
          {data.about}
        </section>
      )}

      {/* Quick info */}
      <section className="grid md:grid-cols-3 gap-4">
        <Info label="Safety score" value={`${data.safety_score}/5`} />
        <Info label="Visa type" value={(data.visa_type || '').replace('-', ' ')} />
        <Info label="Avg daily cost" value={data.avg_daily_cost ? `₹${data.avg_daily_cost}` : '—'} />
      </section>

      {/* Tags */}
      {data.tags?.length > 0 && (
        <section className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-2 text-slate-200">Types</h3>
          <div className="flex flex-wrap gap-2">
            {data.tags.map(t => (
              <span
                key={t.id}
                className="px-3 py-1 rounded-full bg-sky-900/50 text-sky-300 ring-1 ring-sky-700 text-sm"
              >
                {t.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Seasonality  */}
      {data.seasonality?.length > 0 && (
        <section className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-2 text-slate-200">Seasonality</h3>
          <div className="grid grid-cols-6 gap-2">
            {data.seasonality.map(s => (
              <div
                key={s.month}
                className={`p-2 rounded-lg text-center backdrop-blur-sm ring-1 ${seasonGlassColor(s.suitability)}`}
              >
                <div className="text-xs text-slate-200">{monthName(s.month)}</div>
                <div className="font-semibold text-slate-100">{s.suitability}/5</div>

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
    </PageShell>
  );
}


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
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];
}

function seasonGlassColor(score) {
  switch (score) {
    case 5: return 'bg-emerald-500/30 ring-emerald-400/40';
    case 4: return 'bg-teal-500/30 ring-teal-400/40';
    case 3: return 'bg-amber-400/30 ring-amber-300/40';
    case 2: return 'bg-orange-500/30 ring-orange-400/40';
    case 1: return 'bg-red-500/30 ring-red-400/40';
    default: return 'bg-slate-600/30 ring-slate-500/40';
  }
}

function starColor(score) {
  switch (score) {
    case 5: return '#22c55e';
    case 4: return '#10b981';
    case 3: return '#facc15';
    case 2: return '#f97316';
    case 1: return '#ef4444';
    default: return '#a3a3a3';
  }
}

function buildMapEmbedSrc(data) {
  const q = encodeURIComponent([data.name, data.country].filter(Boolean).join(', '));
  return `https://www.google.com/maps?q=${q}&output=embed`;
}
