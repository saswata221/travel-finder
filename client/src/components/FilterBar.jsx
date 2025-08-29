import { FiSearch } from "react-icons/fi"; // feather search icon
export default function FilterBar({
  tags,
  countries,
  selectedTags,
  setSelectedTags,
  countryId,
  setCountryId,
  nameQuery,
  setNameQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSearch
}) {
  function toggleTag(id) {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Types */}
      <div className="p-4 rounded-2xl bg-white/70 ring-1 ring-white/60">
        <h3 className="font-semibold mb-3 text-blue-700">Types Of Destination</h3>
        <div className="flex flex-wrap gap-2 min-h-[48px]">
          {tags.map(t => {
            const active = selectedTags.includes(t.id);
            return (
             <button
  key={t.id}
  onClick={() => toggleTag(t.id)}
  className={`px-3 py-1.5 rounded-full text-sm font-medium transition
    ${active
      ? 'text-white bg-sky-600 shadow-sm hover:bg-sky-700'
      : 'bg-white/30 backdrop-blur-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white/50'}
  `}
>
  {t.name}
</button>

            );
          })}
          {!tags.length && <span className="text-sm text-slate-500">Loading…</span>}
        </div>
      </div>

      {/* Country */}
      <div className="p-4 rounded-2xl bg-white/70 ring-1 ring-white/60">
        <h3 className="font-semibold mb-3  text-blue-700">Country</h3>
        <select
          value={countryId}
          onChange={e => setCountryId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white/90"
        >
          <option value="">All world</option>
          {countries.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Find */}
      <div className="p-4 rounded-2xl bg-white/70 ring-1 ring-white/60">
        <h3 className="font-semibold mb-3 text-blue-700">Find</h3>
        <input
          type="text"
          value={nameQuery}
          onChange={e => setNameQuery(e.target.value)}
          placeholder="Type a place name (optional)"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/90"
        />
      </div>

      {/* Dates */}
      <div className="p-4 rounded-2xl bg-white/70 ring-1 ring-white/60 md:col-span-3">
        <h3 className="font-semibold mb-3 text-blue-700">Travel dates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-700">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/90"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-700">End date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={e => setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/90"
            />
          </div>
        </div>
      </div>

      <div className="md:col-span-3">
       <button
  onClick={onSearch}
  className="flex items-center justify-center gap-2 px-6 py-2.5 
             rounded-full font-medium text-white bg-sky-600 
             hover:bg-sky-700 active:bg-sky-800
             shadow-md hover:shadow-lg 
             transition duration-200 ease-out
             focus:outline-none focus:ring-2 focus:ring-sky-400"
>
  <FiSearch className="w-5 h-5" />
  <span>Search</span>
</button>


      </div>
    </div>
  );
}
