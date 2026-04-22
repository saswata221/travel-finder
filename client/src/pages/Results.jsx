import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/http";
import DestinationCard from "../components/DestinationCard";

const PAGE_SIZE = 20;

function useQueryObj() {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
}

export default function Results() {
  const q = useQueryObj();
  const [items, setItems] = useState([]);
  const [itemsWithPhotos, setItemsWithPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadMoreRef = useRef(null);
  const attemptedPhotoIdsRef = useRef(new Set());

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setItems([]);
    setItemsWithPhotos([]);
    attemptedPhotoIdsRef.current = new Set();
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    const isFirstPage = page === 1;

    if (isFirstPage) {
      setLoading(true);
      setError("");
    } else {
      setLoadingMore(true);
    }

    const query = { ...q, page, limit: PAGE_SIZE };
    api("/api/destinations/search", { query })
      .then((rows) => {
        if (cancelled) return;
        setItems((prev) => {
          if (isFirstPage) return rows;
          const existing = new Set(prev.map((d) => d.id));
          const nextRows = rows.filter((d) => !existing.has(d.id));
          return [...prev, ...nextRows];
        });
        setHasMore(rows.length === PAGE_SIZE);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || "Error");
      })
      .finally(() => {
        if (cancelled) return;
        if (isFirstPage) setLoading(false);
        else setLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, page]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore || error) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        observer.unobserve(entry.target);
        setPage((p) => p + 1);
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, error]);

  useEffect(() => {
    if (!items.length) {
      setItemsWithPhotos([]);
      return;
    }

    setItemsWithPhotos(items);

    const missingImageRows = items.filter(
      (d) => !d.cover_image && !attemptedPhotoIdsRef.current.has(String(d.id))
    );
    if (!missingImageRows.length) return;

    missingImageRows.forEach((d) =>
      attemptedPhotoIdsRef.current.add(String(d.id))
    );

    const payload = {
      destinations: missingImageRows.map((d) => ({
        id: d.id,
        name: d.name,
        country: d.country,
      })),
    };

    api("/api/photos/batch", { method: "POST", body: payload })
      .then((response) => {
        const imagesById = response?.imagesById || {};
        setItemsWithPhotos((prev) =>
          prev.map((d) => ({
            ...d,
            cover_image: d.cover_image || imagesById[String(d.id)] || "",
          }))
        );
      })
      .catch(() => {
        // Keep existing data even if photo lookup fails.
      });
  }, [items]);

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
  if (!itemsWithPhotos.length)
    return (
      <PageWrap>
        <EmptyState title="No results" subtitle="Try different filters." />
      </PageWrap>
    );

  return (
    <PageWrap>
      <h1
        className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center 
                     bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent"
      >
        Explore Destinations
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
        {itemsWithPhotos.map((d, idx) => (
          <div
            key={d.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(idx * 80, 400)}ms` }}
          >
            <DestinationCard d={d} />
          </div>
        ))}
      </div>

      {loadingMore && (
        <div className="text-center text-slate-300 mt-6">
          Loading more destinations...
        </div>
      )}
      {!loading && hasMore && <div ref={loadMoreRef} className="h-4 mt-2" />}
      {!loading && hasMore && !loadingMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium"
          >
            Load more destinations
          </button>
        </div>
      )}

      <style>{`
        .animate-fade-up {
          animation: fadeUp 520ms ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageWrap>
  );
}

function PageWrap({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-[var(--page-max)] px-3 sm:px-4 pt-24 sm:pt-28 pb-12 sm:pb-16">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="my-14 sm:my-20 mx-auto max-w-lg text-center animate-fade-up">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-sky-600 to-emerald-600 flex items-center justify-center mb-4 sm:mb-6 shadow-md">
        <span className="text-2xl sm:text-3xl text-white">🧭</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{title}</h2>
      <p className="text-sm sm:text-base text-slate-400 mt-2">{subtitle}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-sky-700 via-emerald-700 to-teal-700 animate-pulse"
        >
          <div className="rounded-2xl sm:rounded-3xl bg-slate-800/70 backdrop-blur-md p-3 sm:p-4">
            <div className="h-36 sm:h-40 md:h-44 w-full rounded-xl bg-slate-700" />
            <div className="mt-4 h-4 w-2/3 bg-slate-600 rounded" />
            <div className="mt-2 h-3 w-1/2 bg-slate-600 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
