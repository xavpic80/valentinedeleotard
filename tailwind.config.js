/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Font Colour" palette, each bg pairs with one fixed text colour:
        // cream -> dark green text · lime -> dark green text · blue -> cream text
        // mint -> dark green text · dark green -> mint text
        cream: "#FFF8EC",
        ink: "#0F3D2E", // dark teal-green
        terracotta: "#D7F24C", // punchy lime (replaces orange)
        "terracotta-deep": "#A8BF1F", // dark olive-lime
        sage: "#B7F5EC", // neon mint
        "sage-light": "#9FFBEA",
        lavender: "#D9574A", // coral pink accent
        pink: "#D9574A",
        coral: "#D9574A", // coral pink accent, for when cream/lime/mint text needs more pop
        blue: "#2F6FED",
        clay: "#E4CFB8",
        sand: "#EFE6D8",
        teal: "#0F3D2E", // dark teal-green (usable as a bg, pairs with mint text)
        "pantone-332": "#B7F5EC", // neon mint
      },
      fontFamily: {
        display: ["'Archivo'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
}
