// client/src/components/RobotNotifier.jsx
import { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";

export default function RobotNotifier({
  message,
  initialOpen = false,
  position = "top-right",
  theme = "info", // "success" | "warning" | "danger" | "info"
}) {
  const [open, setOpen] = useState(Boolean(initialOpen));
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (initialOpen) {
      setAnimate(true); // trigger entrance animation
      setOpen(true);

      const hideTimer = setTimeout(() => {
        setOpen(false);
      }, 7000); // auto-hide after 7 sec

      const stopAnimate = setTimeout(() => {
        setAnimate(false); // stop bouncing/slide after entrance
      }, 700); // animation duration

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(stopAnimate);
      };
    }
  }, [initialOpen]);

  const positionClasses =
    position === "top-right"
      ? "top-16 right-4"
      : position === "bottom-right"
      ? "bottom-4 right-4"
      : "bottom-4 right-4";

  const themeColors = {
    success: "from-emerald-600/95 to-green-500/95 ring-emerald-300/40",
    warning: "from-amber-500/95 to-orange-500/95 ring-amber-300/40",
    danger: "from-rose-600/95 to-red-500/95 ring-rose-300/40",
    info: "from-sky-600/95 to-cyan-500/95 ring-sky-300/40",
  };

  const gradient = themeColors[theme] || themeColors.info;

  return (
    <div className={`fixed ${positionClasses} z-50 flex items-start space-x-2`}>
      <div
        className={`transition-all duration-500 origin-top-right transform
          ${
            open
              ? "translate-x-0 opacity-100"
              : "translate-x-4 opacity-0 pointer-events-none"
          }
          ${animate ? "animate-slide-bounce" : ""}
        `}
      >
        <div
          className={`mb-2 max-w-sm rounded-2xl p-4 bg-gradient-to-br ${gradient} text-white ring-1 shadow-xl`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
            {message}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full flex items-center justify-center
                   bg-[#168aad] hover:bg-[#168aad]/70 active:bg-white/25
                   shadow-lg text-white ring-1 ring-white/10"
        aria-label="Travel assistant"
        title="Travel assistant"
      >
        <FaRobot className="w-6 h-6" />
      </button>
    </div>
  );
}
