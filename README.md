# Mining Monitor (React + Vite + Tailwind)

A demo mining safety dashboard with:
- Login (protected routes)
- Dashboard overview and activity
- Drone Image Detect (upload + simulated crack severity + activity + safe depth calculator)
- Frequency Detect (sensors, risk map, env factors, trend chart, live simulation)

## Prerequisites
- Node.js 18+

## Install & Run
```bash
npm install
npm run dev
```
Vite will print a local URL (typically http://localhost:5173).

## Tech
- React + TypeScript + Vite
- TailwindCSS v4 (no config needed)
- React Router
- Chart.js + react-chartjs-2

## Notes
- This demo uses simulated data only.
- Login accepts any non-empty username and password.
