import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/http";
import DestinationCard from "../components/DestinationCard";

function useQueryObj() {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
}

export default function Results() {
  const q = useQueryObj();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api("/api/destinations/search", { query: q })
      .then(setItems)
      .catch((e) => setError(e.message || "Error"))
      .finally(() => setLoading(false));
  }, [q.tags, q.countryId, q.months, q.q]);

  if (loading)
    return (
      <PageWrap>
        <SkeletonGrid />
      </PageWrap>
    );
  if (error)
    return (
      <PageWrap>
        <EmptyState title="Something went wrong" subtitle={error} />
      </PageWrap>
    );
  if (!items.length)
    return (
      <PageWrap>
        <EmptyState title="No results" subtitle="Try different filters." />
      </PageWrap>
    );

  return (
    <PageWrap>
      <h1
        className="text-3xl font-extrabold mb-8 text-center 
                     bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent"
      >
        Explore Destinations
      </h1>

      <div className="grid gap-8 md:grid-cols-3">
        {items.map((d) => (
          <DestinationCard key={d.id} d={d} />
        ))}
      </div>
    </PageWrap>
  );
}

function PageWrap({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-[var(--page-max)] px-4 pt-28 pb-16">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="my-20 mx-auto max-w-lg text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-sky-600 to-emerald-600 flex items-center justify-center mb-6 shadow-md">
        <span className="text-3xl text-white">🧭</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      <p className="text-slate-400 mt-2">{subtitle}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl p-[2px] bg-gradient-to-br from-sky-700 via-emerald-700 to-teal-700 animate-pulse"
        >
          <div className="rounded-3xl bg-slate-800/70 backdrop-blur-md p-4">
            <div className="h-44 w-full rounded-xl bg-slate-700" />
            <div className="mt-4 h-4 w-2/3 bg-slate-600 rounded" />
            <div className="mt-2 h-3 w-1/2 bg-slate-600 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
