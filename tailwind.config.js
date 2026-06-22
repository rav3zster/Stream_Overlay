/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vibeBg: "#07050F",
        vibeSurface: "rgba(15, 10, 25, 0.75)",
        vibePrimary: "#A855F7",
        vibeSecondary: "#C084FC",
        vibeAccent: "#FF4DFF",
        vibeCyan: "#5CFFE2",
        vibeText: "#F8F5FF"
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 15px var(--accent-primary-shadow)',
        accent: '0 0 15px var(--accent-secondary-shadow)',
        cyber: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(255, 77, 255, 0.2)'
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'equalizer': 'equalizerBar 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 10px var(--accent-primary-shadow))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 4px var(--accent-primary-shadow))' },
        }
      }
    },
  },
  plugins: [],
}
