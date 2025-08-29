import { useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function AboutModal({ open, onClose }) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose} // click outside closes
    >
      {/* Backdrop */}
      <div className="absolute inset-0  backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative mx-4 max-w-lg w-full rounded-3xl p-6 bg-black/50 backdrop-blur-xl ring-1 ring-white/20 text-slate-100"
        onClick={(e) => e.stopPropagation()} // keep clicks inside from closing
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-extrabold">About TravelFinder</h2>
        <p className="mt-3 text-slate-200/90">
          Discover destinations by <strong>types</strong> (beach, city, mountain, …),
          pick a <strong>country</strong> (optional), and set your <strong>date range</strong>.
          We show seasonality, safety, visa info, costs, photos—and a live map.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-slate-200/90 list-disc pl-5">
          <li>Use the filters on Home to refine your search.</li>
          <li>Browse colorful result cards with quick facts.</li>
          <li>Open a destination to see images, a map, best months & star ratings.</li>
          <li>Everything uses a clean, glassy UI that adapts to your theme.</li>
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-sky-600 hover:bg-sky-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
