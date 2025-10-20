/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // компоненты
    './src/layouts/**/*.vue', // layout-файлы
    './src/pages/**/*.vue', // страницы (если используются)
    './src/components/**/*.{vue,js,ts}', // кастомные компоненты
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
