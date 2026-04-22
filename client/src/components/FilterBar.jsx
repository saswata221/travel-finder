import { useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiCheck, FiChevronDown, FiMapPin, FiSearch } from "react-icons/fi";

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
  onSearch,
}) {
  function toggleTag(id) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const countryOptions = useMemo(
    () => [
      { value: "", label: "All world" },
      ...countries.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [countries]
  );
  const selectedCountry =
    countryOptions.find((o) => o.value === String(countryId || "")) ||
    countryOptions[0];

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [activeCountryIndex, setActiveCountryIndex] = useState(0);
  const countryRootRef = useRef(null);
  const countryListRef = useRef(null);

  useEffect(() => {
    const selectedIdx = Math.max(
      0,
      countryOptions.findIndex((o) => o.value === String(countryId || ""))
    );
    setActiveCountryIndex(selectedIdx);
  }, [countryId, countryOptions]);

  useEffect(() => {
    if (!isCountryOpen) return;
    const activeEl = countryListRef.current?.querySelector(
      `[data-country-index="${activeCountryIndex}"]`
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeCountryIndex, isCountryOpen]);

  useEffect(() => {
    function onDocClick(e) {
      if (!countryRootRef.current?.contains(e.target)) {
        setIsCountryOpen(false);
      }
    }
    function onDocKey(e) {
      if (e.key === "Escape") setIsCountryOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onDocKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onDocKey);
    };
  }, []);

  function chooseCountryByIndex(idx) {
    const option = countryOptions[idx];
    if (!option) return;
    setCountryId(option.value);
    setActiveCountryIndex(idx);
    setIsCountryOpen(false);
  }

  function onCountryTriggerKeyDown(e) {
    if (!countryOptions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsCountryOpen(true);
      setActiveCountryIndex((prev) =>
        Math.min(prev + 1, countryOptions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsCountryOpen(true);
      setActiveCountryIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isCountryOpen) chooseCountryByIndex(activeCountryIndex);
      else setIsCountryOpen(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsCountryOpen(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Types */}
      <div className="p-4 rounded-2xl bg-white/70 ring-1 ring-white/60">
        <h3 className="font-semibold mb-3 text-blue-700">
          Types Of Destination
        </h3>
        <div className="flex flex-wrap gap-2 min-h-[48px]">
          {tags.map((t) => {
            const active = selectedTags.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTag(t.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition
                  ${
                    active
                      ? "text-white bg-sky-600 shadow-sm hover:bg-sky-700"
                      : "bg-white/30 backdrop-blur-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white/50"
                  }
                `}
              >
                {t.name}
              </button>
            );
          })}
          {!tags.length && (
            <span className="text-sm text-slate-500">Loading…</span>
          )}
        </div>
      </div>

      {/* Country */}
      <div className="p-4 rounded-2xl bg-white/70 ring-1 ring-white/60 transition duration-300 hover:bg-white/80 hover:shadow-md hover:-translate-y-[2px]">
        <h3 className="font-semibold mb-3 text-blue-700">Country</h3>
        <div ref={countryRootRef} className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400 p-[1px] shadow-[0_8px_24px_rgba(14,165,233,0.25)]">
            <div className="h-full w-full rounded-xl bg-white/95" />
          </div>
          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 pointer-events-none z-10" />
          <button
            type="button"
            role="combobox"
            aria-expanded={isCountryOpen}
            aria-haspopup="listbox"
            aria-controls="country-listbox"
            onClick={() => setIsCountryOpen((v) => !v)}
            onKeyDown={onCountryTriggerKeyDown}
            className="relative z-10 w-full rounded-xl bg-transparent pl-10 pr-10 py-2.5 text-left text-slate-800 font-medium
                       transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70
                       hover:scale-[1.01] active:scale-[0.99]"
          >
            {selectedCountry?.label || "All world"}
          </button>
          <FiChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10 transition-all duration-300 group-hover:text-sky-600 ${
              isCountryOpen ? "rotate-180 text-sky-600" : ""
            }`}
          />
          <div
            className={`absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-sky-100 bg-white/95 backdrop-blur-sm shadow-xl transition-all duration-200 origin-top ${
              isCountryOpen
                ? "pointer-events-auto opacity-100 translate-y-0 scale-100"
                : "pointer-events-none opacity-0 -translate-y-1 scale-[0.98]"
            }`}
          >
            <ul
              id="country-listbox"
              role="listbox"
              ref={countryListRef}
              className="max-h-56 overflow-auto py-1"
            >
              {countryOptions.map((option, idx) => {
                const isSelected = option.value === String(countryId || "");
                const isActive = idx === activeCountryIndex;
                return (
                  <li
                    key={option.value || "all-world"}
                    role="option"
                    aria-selected={isSelected}
                    data-country-index={idx}
                    onMouseEnter={() => setActiveCountryIndex(idx)}
                    onClick={() => chooseCountryByIndex(idx)}
                    className={`mx-1 flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-gradient-to-r from-sky-100 to-indigo-100 text-slate-900 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.25)]"
                        : "text-slate-700 hover:bg-sky-50 hover:translate-x-[2px]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <FiCheck className="text-sky-600" />}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Find */}
      <div className="p-4 rounded-2xl bg-white/70 ring-1 ring-white/60">
        <h3 className="font-semibold mb-3 text-blue-700">Find</h3>
        <input
          type="text"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          placeholder="Type a place name (optional)"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/90"
        />
      </div>

      {/* Travel Dates */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 ring-1 ring-white/60 md:col-span-3 transition duration-300 hover:shadow-md">
        <h3 className="font-semibold mb-3 text-blue-700">Travel Dates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(() => {
            const today = new Date().toISOString().split("T")[0];
            return (
              <>
                {/* Start Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700 font-semibold">
                    Start Date
                  </label>
                  <div className="group relative rounded-xl border-2 border-sky-300 bg-white px-4 py-2 text-slate-800 shadow-sm transition duration-300 ease-out hover:shadow-md hover:border-sky-400 active:scale-[0.99] hover:-translate-y-[1px] focus-within:ring-2 focus-within:ring-sky-400/70">
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker?.();
                        } catch {
                          // Native picker will still open from direct input focus/click.
                        }
                      }}
                      className="w-full bg-transparent pr-8 focus:outline-none cursor-pointer calendar-input-modern"
                    />
                    <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-600 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700 font-semibold">
                    End Date
                  </label>
                  <div className="group relative rounded-xl border-2 border-indigo-300 bg-white px-4 py-2 text-slate-800 shadow-sm transition duration-300 ease-out hover:shadow-md hover:border-indigo-400 active:scale-[0.99] hover:-translate-y-[1px] focus-within:ring-2 focus-within:ring-indigo-400/70">
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker?.();
                        } catch {
                          // Native picker will still open from direct input focus/click.
                        }
                      }}
                      className="w-full bg-transparent pr-8 focus:outline-none cursor-pointer calendar-input-modern"
                    />
                    <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Search Button */}
      <div className="md:col-span-3">
        <button
          onClick={onSearch}
          className="flex items-center justify-center gap-2 px-6 py-2.5 
             rounded-full font-medium text-white bg-sky-600 
             hover:bg-sky-700 active:bg-sky-800
             shadow-md hover:shadow-lg active:scale-[0.98]
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
