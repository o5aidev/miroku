/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agent: {
          coordinator: '#FF79C6',
          codegen: '#00D9FF',
          review: '#00FF88',
          issue: '#8B88FF',
          pr: '#FF79C6',
          deployment: '#FF4444',
        },
        state: {
          pending: '#E4E4E4',
          analyzing: '#0E8A16',
          implementing: '#1D76DB',
          reviewing: '#FBCA04',
          done: '#2EA44F',
          blocked: '#D73A4A',
          failed: '#B60205',
          paused: '#D4C5F9',
        },
      },
    },
  },
  plugins: [],
};
