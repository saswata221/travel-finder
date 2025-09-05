// client/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/http';
import FilterBar from '../components/FilterBar';

// Import multiple background images
import hero1 from '../assets/hero1.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';
import hero6 from '../assets/hero6.jpg';
import hero7 from '../assets/hero7.jpg';
import hero8 from '../assets/hero8.jpg';
export default function Home() {
  // data from API
  const [tags, setTags] = useState([]);
  const [countries, setCountries] = useState([]);

  // filters
  const [selectedTags, setSelectedTags] = useState([]);
  const [countryId, setCountryId] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const nav = useNavigate();

  // --- Background Carousel (double-buffered, glitch-free) ---
  const images = [hero1, hero2, hero3, hero4, hero5,hero6,hero7,hero8];

  // We render TWO layers (A and B). Only one is "front" at a time.
  // During a slide, the back layer moves in; after it finishes, we swap roles
  // and pre-load the next image into the new back layer.
  const CYCLE_MS = 3000;    // total cycle per image
  const DURATION_MS = 900;  // slide duration (ms)

  const [state, setState] = useState({
    iA: 0,            // image index shown by Layer A
    iB: 1,            // image index shown by Layer B
    frontIsA: true,   // which layer is in front (on screen) when NOT sliding
    sliding: false    // are we currently animating the slide?
  });

  // Prefetch to avoid flicker
  useEffect(() => {
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main scheduler: every CYCLE_MS start a slide that lasts DURATION_MS
  useEffect(() => {
    let intervalId;
    let finishId;

    const startSlide = () => {
      // Start animation
      setState(s => ({ ...s, sliding: true }));

      // Finish slide after DURATION_MS: swap roles and prepare next image
      finishId = setTimeout(() => {
        setState(s => {
          // The "incoming" image during slide is the back layer:
          const incomingIndex = s.frontIsA ? s.iB : s.iA;

          // After slide, the incoming becomes the front.
          const newFrontIsA = !s.frontIsA;

          // Preload the next image for the new back layer:
          const nextIndex = (incomingIndex + 1) % images.length;

          if (newFrontIsA) {
            // A becomes front showing 'incomingIndex', B becomes back with 'nextIndex'
            return { iA: incomingIndex, iB: nextIndex, frontIsA: true, sliding: false };
          } else {
            // B becomes front showing 'incomingIndex', A becomes back with 'nextIndex'
            return { iA: nextIndex, iB: incomingIndex, frontIsA: false, sliding: false };
          }
        });
      }, DURATION_MS);
    };

    // Kick off and repeat every CYCLE_MS
    intervalId = setInterval(startSlide, CYCLE_MS);
    // also start immediately so the first transition happens after the initial rest
    // If you want an initial rest, comment the next line.
    // startSlide();

    return () => {
      clearInterval(intervalId);
      clearTimeout(finishId);
    };
  }, [images.length]);

  // fetch filter data (unchanged)
  useEffect(() => {
    api('/api/tags')
      .then(rows => {
        const norm = rows.map(r => ({
          id: r.id ?? r.tag_id ?? r.tagid ?? r.ID ?? r.TagID,
          name: r.name ?? r.tag_name ?? r.label ?? r.Name,
        })).filter(x => x.id != null && x.name);
        setTags(norm);
      })
      .catch(console.error);

    api('/api/countries')
      .then(rows => {
        const norm = rows.map(r => ({
          id: r.id ?? r.country_id ?? r.ID ?? r.CountryID,
          name: r.name ?? r.country ?? r.country_name ?? r.Name,
        })).filter(x => x.id != null && x.name);
        setCountries(norm);
      })
      .catch(console.error);
  }, []);

  function monthsFromRange(start, end) {
    if (!start || !end) return '';
    const s = new Date(start + 'T00:00');
    const e = new Date(end + 'T00:00');
    if (Number.isNaN(s) || Number.isNaN(e) || e < s) return '';
    const months = new Set();
    const cur = new Date(s);
    cur.setDate(1);
    while (cur <= e) {
      months.add(cur.getMonth() + 1); // 1..12
      cur.setMonth(cur.getMonth() + 1);
    }
    return Array.from(months).join(',');
  }

  function onSearch() {
    const params = new URLSearchParams();
    const months = monthsFromRange(startDate, endDate);

    if (selectedTags.length) params.set('tags', selectedTags.join(','));
    if (countryId) params.set('countryId', countryId);
    if (months) params.set('months', months);
    if (nameQuery.trim()) params.set('q', nameQuery.trim());

    nav(`/results?${params.toString()}`);
  }

 
  const aTransform =
    state.frontIsA
      ? (state.sliding ? '-translate-x-full' : 'translate-x-0')   
      : (state.sliding ? 'translate-x-0'    : 'translate-x-full');

  const bTransform =
    state.frontIsA
      ? (state.sliding ? 'translate-x-0'    : 'translate-x-full')  
      : (state.sliding ? '-translate-x-full' : 'translate-x-0');   
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background Carousel (double-buffered sliding) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer A */}
        <div
          className={`absolute inset-0 bg-center bg-cover bg-no-repeat transform ease-in-out ${aTransform}`}
          style={{
            backgroundImage: `url(${images[state.iA]})`,
            transitionProperty: 'transform',
            transitionDuration: `${DURATION_MS}ms`
          }}
        />
        {/* Layer B */}
        <div
          className={`absolute inset-0 bg-center bg-cover bg-no-repeat transform ease-in-out ${bTransform}`}
          style={{
            backgroundImage: `url(${images[state.iB]})`,
            transitionProperty: 'transform',
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/30 to-black/20" />
      {/* Content */}
      <div className="relative z-20 mx-auto max-w-[var(--page-max)] px-4 pt-20 pb-8 flex flex-col items-center">
        <div className="text-center mb-6 text-white drop-shadow">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find your next destination
          </h1>
          <p className="mt-2 text-white/90">
            Pick types, choose a country (optional), select a date range, and search.
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
