/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      keyframes: {
        "slide-bounce": {
          "0%": { transform: "translateY(-50px)", opacity: "0" },
          "60%": { transform: "translateY(10px)", opacity: "1" },
          "80%": { transform: "translateY(-5px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-bounce": "slide-bounce 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};
