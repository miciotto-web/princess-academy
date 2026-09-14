import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        princess: {
          50: "#FDF0F7",
          100: "#FBDDF0",
          200: "#F7B9DE",
          300: "#F28CC6",
          400: "#E95AA9",
          500: "#D63384",
          600: "#C7147D",
          700: "#A50E66",
          800: "#7E0C4F",
          900: "#5C0A3B",
        },
        gold: {
          50: "#FBF7EA",
          100: "#F6EDCE",
          200: "#F0DEA4",
          300: "#E8CC76",
          400: "#DFB954",
          500: "#D4AF37",
          600: "#B08F2A",
          700: "#8A6F22",
          800: "#6B561D",
          900: "#4E3E15",
        },
        ivory: {
          DEFAULT: "#FFFBF4",
          dark: "#F6EFE3",
        },
        ink: {
          DEFAULT: "#2B2B30",
          soft: "#55555E",
          mute: "#8A8A94",
        },
        blush: "#F9D5E9",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        royal: "0 20px 60px -20px rgba(199,20,125,0.35)",
        golden: "0 10px 40px -12px rgba(212,175,55,0.45)",
        soft: "0 8px 30px -12px rgba(43,43,48,0.18)",
      },
      backgroundImage: {
        "royal-sheen":
          "radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.22), transparent 60%), radial-gradient(900px 500px at 85% 20%, rgba(212,175,55,0.25), transparent 60%), linear-gradient(135deg, #A50E66 0%, #C7147D 38%, #D63384 62%, #8A0F56 100%)",
        "ivory-texture":
          "radial-gradient(800px 400px at 20% 0%, rgba(212,175,55,0.10), transparent 60%), radial-gradient(700px 380px at 90% 100%, rgba(199,20,125,0.06), transparent 60%)",
        /* Notte Magica */
        "night-sheen":
          "radial-gradient(1200px 600px at 50% -10%, rgba(255,46,166,0.22), transparent 60%), radial-gradient(900px 500px at 85% 20%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(135deg, #1B0730 0%, #3A1050 38%, #5C0A3B 62%, #1B0730 100%)",
        "night-texture":
          "radial-gradient(800px 400px at 20% 0%, rgba(255,46,166,0.10), transparent 60%), radial-gradient(700px 380px at 90% 100%, rgba(212,175,55,0.06), transparent 60%)",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.25", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        drift: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.9" },
          "90%": { opacity: "0.6" },
          "100%": { transform: "translateY(-120px) translateX(24px)", opacity: "0" },
        },
      },
      animation: {
        twinkle: "twinkle 3.2s ease-in-out infinite",
        floaty: "floaty 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
