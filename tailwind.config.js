/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			brand: {
  				DEFAULT: '#02b290',
  				dark: '#000000',
  				light: '#ffffff',
  				muted: '#595959',
  				tree: '#6fb48e',
  				'tree-dark': '#0B4635',
  				danger: '#dc2626',
  				blue: '#3A7BD5',
  				underline_color: '#353839',
  				button_color: '#353839',
  				'button-hover': '#1C1C1C',
  				'review-background': '#373535'
  			},
  			yellow: {
  				'50': '#FAE642',
  				'100': '#f3b81f',
  				'200': '#ffc33c',
  				'300': '#edc537',
  				DEFAULT: '#f98f14'
  			},
  			fill: {
  				base: '#f3f6f9',
  				secondary: '#f8f9fb',
  				thumbnail: '#f3f6fa',
  				'dropdown-hover': '#f6f9fc',
  				one: '#f1f6f9',
  				two: '#f2f2f2',
  				three: '#e8ebf0',
  				four: '#e5eaf1'
  			},
  			border: 'hsl(var(--border))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			body: [
  				'var(--font-inter)'
  			],
  			manrope: [
  				'var(--font-manrope)'
  			]
  		},
  		fontSize: {
  			'10px': '.625rem',
  			'13px': '13px',
  			'15px': '15px'
  		},
  		screens: {
  			'3xl': '1780px',
  			'4xl': '1921px'
  		},
  		spacing: {
  			'430px': '430px',
  			'450px': '450px',
  			'500px': '500px',
  			'64vh': '64vh'
  		},
  		minHeight: {
  			'50px': '50px'
  		},
  		scale: {
  			'80': '0.8',
  			'85': '0.85',
  			'300': '3',
  			'400': '4'
  		},
  		width: {
  			'1/9': '11.1111111%',
  			'100+30': 'calc(100% + 30px)'
  		},
  		keyframes: {
  			shine: {
  				'100%': {
  					left: '125%'
  				}
  			},
  			wiggle: {
  				'0%, 100%': {
  					transform: 'rotate(-3deg)'
  				},
  				'50%': {
  					transform: 'rotate(3deg)'
  				}
  			}
  		},
  		animation: {
  			shine: 'shine 0.8s ease-in',
  			ping: 'ping 3s linear infinite',
  			wiggle: 'wiggle 1s ease-in-out infinite',
  			'slow-bounce': 'bounce 2s infinite',
  			'spin-slow': 'spin 3s linear infinite'
  		},
  		boxShadow: {
  			card: '0px 0px 6px rgba(79, 95, 120, 0.1)',
  			cardHover: '0px 0px 8px rgba(79, 95, 120, 0.18)',
  			category: '0px 1px 6px rgba(79, 95, 120, 0.12)',
  			category2: '0px 10px 20px rgba(88, 110, 125, 0.1)',
  			navigation: '0 3px 6px rgba(115, 125, 144, 0.25)',
  			counter: '0px 4px 10px rgba(79, 95, 120, 0.15)',
  			featured: '0px 4px 8px rgba(70, 84, 111, 0.06)',
  			cart: '0 3px 6px rgba(0,0,0,0.12)',
  			switch: '0 2px 5px rgba(21,35,49,0.4)',
  			dropDown: '0px 10px 40px rgba(41, 50, 68, 0.15)',
  			carouselButton: '0px 2px 15px rgba(115, 125, 144, 0.25)',
  			listProduct: '0 2px 4px rgba(0,0,0,.08)',
  			navigationReverse: '0 -3px 6px rgba(0, 0, 0, 0.16)',
  			header: '0 2px 3px rgba(0, 0, 0, 0.08)',
  			subMenu: '1px 2px 3px rgba(0, 0, 0, 0.08)',
  			bottomNavigation: '0 -2px 3px rgba(0, 0, 0, 0.06)',
  			cookies: '0 -2px 3px rgba(0, 0, 0, 0.04)',
  			contact: '0 1px 10px rgba(75, 90, 130, 0.1)',
  			vendorCard: '0px 2px 3px rgba(0, 0, 0, 0.06)',
  			vendorCardHover: '0px 1px 15px rgba(0, 0, 0, 0.06)',
  			vendorSidebar: '0px 1px 2px rgba(0, 0, 0, 0.03), 0px 1px 3px rgba(0, 0, 0, 0.05)',
  			searchBox: '0px 4px 4px rgba(99, 113, 134, 0.1)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    function ({ addComponents }) {
      addComponents({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin', // Thin scrollbar in Firefox
          'scrollbar-color': '#d1d5db #f3f4f6', // Thumb and Track colors for Firefox
        },
        '.scrollbar-custom::-webkit-scrollbar': {
          width: '6px', // Thinner scrollbar for Webkit browsers
          height: '6px', // Horizontal scrollbar size
        },
        '.scrollbar-custom::-webkit-scrollbar-thumb': {
          backgroundColor: '#d1d5db', // Light gray for the thumb
          borderRadius: '10px', // Optional: rounded scrollbar thumb
        },
        '.scrollbar-custom::-webkit-scrollbar-track': {
          backgroundColor: '#f3f4f6', // Lighter gray for the track
        },
      });
    },
  ],
};
