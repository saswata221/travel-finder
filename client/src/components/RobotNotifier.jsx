// client/src/components/RobotNotifier.jsx
import { useState } from "react";
import { FaRobot } from "react-icons/fa";

export default function RobotNotifier({ message }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end space-x-2">
      {/* Message panel (appears on the left of the button) */}
      <div
        className={`transition-all duration-200 origin-bottom-right
                    ${
                      open
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0 pointer-events-none"
                    }`}
      >
        <div
          className="mb-2 max-w-xs rounded-2xl p-4
                        bg-slate-900/90 text-slate-50 ring-1 ring-white/15 shadow-lg"
        >
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>
      </div>

      {/* Toggle button on the right */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full flex items-center justify-center
                   bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                   shadow-lg text-white"
        aria-label="Travel assistant"
        title="Travel assistant"
      >
        <FaRobot className="w-6 h-6" />
      </button>
    </div>
  );
}
