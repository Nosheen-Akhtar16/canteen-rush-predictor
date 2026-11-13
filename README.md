# Canteen Rush Predictor

Real-time campus canteen crowd tracker, live menu stock monitor, and hourly rush predictor built with **React, Tailwind CSS, Firebase (Auth + Firestore), Recharts, and Vercel**.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure Firebase:**
   - Create a Firebase project (`canteen-rush`) in region `asia-south1`.
   - Enable **Email/Password** and **Google** under **Authentication → Sign-in method**.
   - Create a **Firestore Database** in production mode.
   - Copy `.env.example` to `.env.local` and paste your 6 `VITE_FIREBASE_*` values from **Project Settings → General → Your apps**.
   - Download a Service Account private key JSON from **Project Settings → Service accounts** and save it as `scripts/serviceAccountKey.json` (ignored by Git).
3. **Deploy security rules & seed demo data:**
   ```bash
   npx firebase deploy --only firestore:rules
   npm run seed
   ```
4. **Run locally:**
   ```bash
   npm run dev
   ```

## Demo Accounts (Password: `Demo@1234`)

| Role | Email | Access |
| --- | --- | --- |
| Student | `student@demo.com` | Live crowd cards, canteen menu stock, rush strip, item search |
| Staff (Main) | `staff1@demo.com` | One-tap crowd & stock updates for Main Canteen |
| Staff (Engg.) | `staff2@demo.com` | One-tap crowd & stock updates for Engineering Cafe |
| Admin | `admin@demo.com` | Campus overview, Recharts analytics, Recompute usual levels, role assignment |

## Reset Before Demo / Viva
```bash
npm run seed:reset
```
