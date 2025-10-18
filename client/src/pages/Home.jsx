// client/src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/http";
import FilterBar from "../components/FilterBar";

// Import multiple background images
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import hero4 from "../assets/hero4.jpg";
import hero5 from "../assets/hero5.jpg";
import hero6 from "../assets/hero6.jpg";
import hero7 from "../assets/hero7.jpg";
import hero8 from "../assets/hero8.jpg";

export default function Home() {
  // data from API
  const [tags, setTags] = useState([]);
  const [countries, setCountries] = useState([]);

  // filters
  const [selectedTags, setSelectedTags] = useState([]);
  const [countryId, setCountryId] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const nav = useNavigate();

  // --- Modern Ken Burns Carousel ---
  const images = [hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Prefetch to avoid flicker
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance carousel with Ken Burns effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  // fetch filter data
  useEffect(() => {
    api("/api/tags")
      .then((rows) => {
        const norm = rows
          .map((r) => ({
            id: r.id ?? r.tag_id ?? r.tagid ?? r.ID ?? r.TagID,
            name: r.name ?? r.tag_name ?? r.label ?? r.Name,
          }))
          .filter((x) => x.id != null && x.name);
        setTags(norm);
      })
      .catch(console.error);

    api("/api/countries")
      .then((rows) => {
        const norm = rows
          .map((r) => ({
            id: r.id ?? r.country_id ?? r.ID ?? r.CountryID,
            name: r.name ?? r.country ?? r.country_name ?? r.Name,
          }))
          .filter((x) => x.id != null && x.name);
        setCountries(norm);
      })
      .catch(console.error);
  }, []);

  function monthsFromRange(start, end) {
    if (!start || !end) return "";
    const s = new Date(start + "T00:00");
    const e = new Date(end + "T00:00");
    if (Number.isNaN(s) || Number.isNaN(e) || e < s) return "";
    const months = new Set();
    const cur = new Date(s);
    cur.setDate(1);
    while (cur <= e) {
      months.add(cur.getMonth() + 1); // 1..12
      cur.setMonth(cur.getMonth() + 1);
    }
    return Array.from(months).join(",");
  }

  function onSearch() {
    const params = new URLSearchParams();
    const months = monthsFromRange(startDate, endDate);

    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    if (countryId) params.set("countryId", countryId);
    if (months) params.set("months", months);
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    if (nameQuery.trim()) params.set("q", nameQuery.trim());

    nav(`/results?${params.toString()}`);
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Modern Ken Burns Effect Carousel */}
      <div className="absolute inset-0">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${img})`,
              animation:
                idx === currentIndex
                  ? "kenBurnsZoom 6s ease-out forwards"
                  : "none",
            }}
          />
        ))}
      </div>

      {/* Ken Burns Animation Styles */}
      <style jsx>{`
        @keyframes kenBurnsZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
      `}</style>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/30 to-black/20" />

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-[var(--page-max)] px-4 pt-20 pb-8 flex flex-col items-center">
        <div className="text-center mb-6 text-white drop-shadow">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find your next destination
          </h1>
          <p className="mt-2 text-white/90">
            Pick types, choose a country (optional), select a date range, and
            search.
          </p>
        </div>

        <div className="w-full">
          <div className="p-[2px] rounded-3xl">
            <div className="rounded-3xl p-6 sm:p-7 backdrop-blur-sm bg-white/10 ring-1 ring-white/30">
              <FilterBar
                tags={tags}
                countries={countries}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                countryId={countryId}
                setCountryId={setCountryId}
                nameQuery={nameQuery}
                setNameQuery={setNameQuery}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onSearch={onSearch}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
