import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        hindi: ['var(--font-hindi)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        'poster-title': ['var(--font-poster-title)', 'sans-serif'],
        'poster-subtitle': ['var(--font-poster-subtitle)', 'sans-serif'],
        'poster-quote': ['var(--font-poster-quote)', 'sans-serif'],
        'poster-name': ['var(--font-poster-name)', 'sans-serif'],
      },
      fontSize: {
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        saffron: {
          DEFAULT: "hsl(var(--saffron))",
          light: "hsl(var(--saffron-light))",
          dark: "hsl(var(--saffron-dark))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
        },
        maroon: "hsl(var(--maroon))",
        cream: "hsl(var(--cream))",
        /* ── UNIFIED BRAND TOKENS ───────────────────────────────────── */
        brand: {
          primary:  "hsl(var(--brand-primary))",
          hover:    "hsl(var(--brand-primary-hover))",
          active:   "hsl(var(--brand-primary-active))",
          gold:     "hsl(var(--brand-gold))",
          "gold-light": "hsl(var(--brand-gold-light))",
          /* Keep legacy aliases so old code still works */
          saffron: "hsl(var(--saffron))",
          cream:   "hsl(var(--cream))",
          brown:   "hsl(var(--maroon))",
          dark:    "hsl(var(--background))",
        },
        /* ── SEMANTIC STATUS COLORS ─────────────────────────────────── */
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        /* ── SURFACE TOKENS ─────────────────────────────────────────── */
        surface: {
          DEFAULT: "hsl(var(--surface))",
          alt:     "hsl(var(--surface-alt))",
          raised:  "hsl(var(--surface-raised))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        "1":       "var(--shadow-1)",
        "2":       "var(--shadow-2)",
        "3":       "var(--shadow-3)",
        "floating": "var(--shadow-floating)",
        "dialog":  "var(--shadow-dialog)",
        "gold":    "var(--shadow-gold)",
        "temple":  "var(--shadow-3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
