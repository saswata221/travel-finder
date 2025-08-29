// client/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/http';
import FilterBar from '../components/FilterBar';
import heroImg from '../assets/hero.jpg'; // <-- make sure hero.jpg is inside src/assets/

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

  // fetch filter data
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

  // convert date range → unique list of month numbers "3,4,5"
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

  return (
    <section className="relative min-h-screen flex flex-col justify-center">
  {/* Background image */}
  <div
    className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat"
    style={{ backgroundImage: `url('${heroImg}')` }}
  />
  {/* Gradient overlay */}
  <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/30 to-black/20" />

  {/* Content (centered hero with filter) */}
  <div className="relative z-20 mx-auto max-w-[var(--page-max)] px-4 pt-24 pb-8 flex flex-col items-center">
    <div className="text-center mb-6 text-white drop-shadow">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Find your next destination
      </h1>
      <p className="mt-2 text-white/90">
        Pick types, choose a country (optional), select a date range, and search.
      </p>
    </div>

    {/* Glass filter card with gradient frame */}
<div className="w-full">
  <div className=" p-[2px] rounded-3xl ">
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
