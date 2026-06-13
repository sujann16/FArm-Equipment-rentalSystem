# AgriShare AI - Farm Equipment Rental Platform

AgriShare AI is a modern, startup-grade platform that connects equipment owners with local farmers who need temporary access to agricultural machinery. Think: **Airbnb + Uber + OLX for Farm Equipment**.

It resolves the problem of underutilized machinery for owners while providing small and medium farmers with affordable, temporary access to tractors, harvesters, rotavators, seeders, and more.

---

## Technical Stack

*   **Frontend**: React (Vite), JavaScript, Tailwind CSS, Lucide Icons
*   **Backend**: Node.js, Express.js, JavaScript
*   **Database**: MongoDB (via Mongoose)
*   **Security**: Helmet, Express Rate Limiter, cookie-based JWT sessions
*   **APIs**: Google Gemini (AI Recommendations), OpenWeather API (Farming Forecasts)
*   **Storage & Notifications**: Cloudinary (Image uploads), Twilio / Local logging (WhatsApp notifications)

---

## Directory Structure

```
agrishare-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── models/          # Mongoose schemas (User, Equipment, Booking, Review, etc.)
│   │   ├── controllers/     # Route logic (Auth, Booking, Equipment, AI recommendations)
│   │   ├── routes/          # Express route bindings
│   │   ├── middlewares/     # JWT Auth, express-validator, error catchers
│   │   ├── utils/           # JWT creation, geocoders, weather client, WhatsApp loggers
│   │   ├── server.js        # Main server boot
│   │   └── seed.js          # Database mock data seeder
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── api/             # Custom Axios client
    │   ├── components/      # Navbar, Footer, Weather cards, Vector Map viewer
    │   ├── context/         # Auth cookie context, Language translation context
    │   ├── pages/           # Home, Search, Details, Farmer/Owner/Admin dashboards
    │   ├── App.jsx          # Routes definition
    │   └── main.jsx         # App bootstrap
    ├── package.json
    └── tailwind.config.js
```

---

## Quickstart Guide

### 1. Requirements
*   **Node.js** (v18+)
*   **MongoDB** (running locally on `mongodb://localhost:27017` or Atlas connection string)

### 2. Environment Setup
Create a `.env` file in the `backend/` directory (see `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/agrishare-ai
JWT_SECRET=agrishare-jwt-secret-key-12345
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=agrishare-jwt-refresh-secret-67890
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key_here          # Optional, defaults to mock rule-engine
OPENWEATHER_API_KEY=your_openweather_key_here # Optional, defaults to simulated forecast
```

### 3. Seed Database
Inside `backend/` directory, run:
```bash
npm run seed
```
This loads test accounts, reviews, and bookings into MongoDB.

### 4. Run Servers
*   **Backend**: Inside `backend/` directory:
    ```bash
    npm run dev
    ```
    (Runs on `http://localhost:5000`)

*   **Frontend**: Inside `frontend/` directory:
    ```bash
    npm run dev
    ```
    (Runs on `http://localhost:5173`)

---

## Demo Accounts (Seeded)

All accounts share the password: `password123`
*   **Farmer**: `farmer@agrishare.com` (to search and book equipment, get crop recommendations)
*   **Owner**: `owner@agrishare.com` (to list machines, approve bookings, review earnings)
*   **Admin**: `admin@agrishare.com` (to monitor disputes, view heatmaps and analytics)

---

## Key Features

1.  **AI Recommendations**: In the Farmer Dashboard, input crop type (e.g. Paddy) and acreage (e.g. 4 Acres) to calculate suggested implements, timelines, and costs.
2.  **Weather Suggestions**: Homepage widget matches forecasts against farming schedules (alerts you to delay rotavators if rain is coming).
3.  **Pricing Estimator**: Stripe-like price receipt adjusts base rates with regional demand multipliers and volume discounts.
4.  **Demand Heatmap**: Admin dashboard plots booking volumes geographically.
5.  **WhatsApp Notifications (Mocks)**: Confirming or cancelling rentals appends formatted notifications to `backend/whatsapp_notifications.log` for validation.
6.  **Multilingual Support**: Supports English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), and Telugu (తెలుగు) toggled instantly in the Navbar.

---

## Deployment Guide

### Backend (Render)
1.  Push code to GitHub.
2.  On Render, create a new **Web Service**, linking the repository.
3.  Set:
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
4.  Add environment variables in Render's dashboard.

### Frontend (Vercel)
1.  Link your frontend folder on Vercel.
2.  Configure build settings:
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
3.  Set `VITE_API_URL` to point to your live Render backend service.
