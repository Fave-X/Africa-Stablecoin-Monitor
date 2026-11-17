/** @type {import('tailwindcss').Config} */
// Direction: "nocturnal research terminal". Near-black canvas, luminous type,
// colour only where it carries meaning (the three data series). See DESIGN.md.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0b0b0b', 2: '#131313', 3: '#191919', line: '#262626', edge: '#525252' },
        fg: { 1: '#ffffff', 2: '#cccccc', 3: '#868f97' },
        paper: { DEFAULT: '#edeff2', 2: '#f7f8fa', line: '#dedfe1', text: '#1a1a1a', muted: '#5a5a5a' },
        series: { 1: '#3987e5', 2: '#d95926', 3: '#199e70' },
        flag: '#e66767',
      },
      fontFamily: { sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '16px', pill: '99px' },
      boxShadow: { halo: '0 0 44px rgba(0,0,0,0.8)' },
      letterSpacing: { display: '-0.045em', tightish: '-0.02em' },
      maxWidth: { page: '1200px' },
    },
  },
  plugins: [],
}
