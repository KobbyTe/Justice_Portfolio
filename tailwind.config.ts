import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				heading: ['Montserrat', 'sans-serif'],
				body: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
		keyframes: {
			'accordion-down': {
				from: { height: '0' },
				to: { height: 'var(--radix-accordion-content-height)' }
			},
			'accordion-up': {
				from: { height: 'var(--radix-accordion-content-height)' },
				to: { height: '0' }
			},
			'fade-up': {
				'0%': { opacity: '0', transform: 'translateY(24px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			'fade-in': {
				'0%': { opacity: '0' },
				'100%': { opacity: '1' }
			},
			'float': {
				'0%, 100%': { transform: 'translateY(0px)' },
				'50%': { transform: 'translateY(-10px)' }
			},
			'blink': {
				'0%, 100%': { opacity: '1' },
				'50%': { opacity: '0' }
			},
			'pulse-ring': {
				'0%': { strokeDashoffset: '100' },
				'100%': { strokeDashoffset: '0' }
			},
			'slide-down': {
				'0%': { opacity: '0', height: '0', transform: 'translateY(-8px)' },
				'100%': { opacity: '1', height: 'auto', transform: 'translateY(0)' }
			},
			'bounce-y': {
				'0%, 100%': { transform: 'translateY(0)' },
				'50%': { transform: 'translateY(6px)' }
			},
			'logo-scroll': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(calc(-100% - 2rem))' }
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-up': 'fade-up 0.6s ease-out both',
			'fade-in': 'fade-in 0.5s ease-out both',
			'float': 'float 3s ease-in-out infinite',
			'blink': 'blink 1s step-end infinite',
			'bounce-y': 'bounce-y 1.2s ease-in-out infinite',
			'logo-scroll': 'logo-scroll 30s linear infinite',
		}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
