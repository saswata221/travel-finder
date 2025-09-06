
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/http';
import FilterBar from '../components/FilterBar';


import hero1 from '../assets/hero1.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';
import hero6 from '../assets/hero6.jpg';
import hero7 from '../assets/hero7.jpg';
import hero8 from '../assets/hero8.jpg';
export default function Home() {

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


  const CYCLE_MS = 3000;    
  const DURATION_MS = 900;  

  const [state, setState] = useState({
    iA: 0,            
    iB: 1,            
    frontIsA: true,   
    sliding: false    
  });


  useEffect(() => {
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
   
  }, []);

  
  useEffect(() => {
    let intervalId;
    let finishId;

    const startSlide = () => {
      
      setState(s => ({ ...s, sliding: true }));

      
      finishId = setTimeout(() => {
        setState(s => {
          
          const incomingIndex = s.frontIsA ? s.iB : s.iA;

   
          const newFrontIsA = !s.frontIsA;

          const nextIndex = (incomingIndex + 1) % images.length;

          if (newFrontIsA) {
            return { iA: incomingIndex, iB: nextIndex, frontIsA: true, sliding: false };
          } else {
            return { iA: nextIndex, iB: incomingIndex, frontIsA: false, sliding: false };
          }
        });
      }, DURATION_MS);
    };

    intervalId = setInterval(startSlide, CYCLE_MS);
    return () => {
      clearInterval(intervalId);
      clearTimeout(finishId);
    };
  }, [images.length]);

  
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
      months.add(cur.getMonth() + 1);
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
