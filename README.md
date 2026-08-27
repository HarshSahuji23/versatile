# Varsha's Versatile — Official Website & Admin Portal 🎤✨

> A bespoke, luxury portfolio and client management platform for **Varsha Jain**, professional Event Anchor, Emcee, and Host.

---

## 🌟 Overview

**Varsha's Versatile** is an event hosting portfolio and inquiry platform designed with rich luxury aesthetics, smooth animations, and a secure, full-featured Content Management Portal (`/admin`).

The platform enables clients to explore event hosting services, view high-resolution event galleries, read client testimonials, and submit instant booking inquiries.

---

## ✨ Key Features

### 🌐 Public Website
- **Luxury Aesthetic & Responsive Design:** Bespoke gold and plum palette, glassmorphic accents, and fluid mobile-first layouts.
- **Hero & Intro Showcase:** Highlighting credentials, years of experience, and signature hosting style.
- **Services Catalog:** Weddings, Sangeet, Corporate Galas, Birthdays, Anniversaries, and Brand Launches.
- **Event Photo Gallery:** Filterable visual showcase with lightbox zoom capabilities.
- **Client Reviews & Testimonials:** Star-rated feedback from real clients and event organizers.
- **Instant Booking Inquiry Form:** Direct client inquiry submission with instant validation.

### 🛡️ Admin Management Portal (`/admin`)
- **Booking Inquiries Manager:** Real-time inquiry inbox with status tracking (`New`, `Read`, `Responded`, `Confirmed`, `Completed`).
- **Services Manager:** Add, edit, or reorder hosting services directly from the dashboard.
- **Gallery Manager:** Upload and manage portfolio photos.
- **Testimonials Manager:** Review and publish client reviews.
- **Account & Security Settings:** Update admin email, change password, and configure master recovery keys.
- **Enterprise-Grade Security:**
  - Salted `scrypt` cryptographic password hashing.
  - Signed, tamper-proof HTTP-only session cookies (`HMAC-SHA256`).
  - Next.js Edge Middleware route guarding.
  - Locked-down REST API endpoints preventing unauthorized data leaks.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** Vanilla Modern CSS with Custom CSS Variables & Animations
- **Database & Storage:** [Supabase](https://supabase.com/) (PostgreSQL cloud database + resilient local JSON cache fallback)
- **Security:** Node.js Cryptography (`scrypt`, `crypto.timingSafeEqual`, `HMAC-SHA256`)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.17.0 or higher recommended)
- **npm**, **yarn**, or **pnpm**

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/versatile.git
cd versatile
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Optional: Custom Session Encryption Secret
ADMIN_SESSION_SECRET=your-random-32-char-secret-string
```

### 4. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Main Website:** [http://localhost:3000](http://localhost:3000)
- **Admin Portal:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📦 Production Deployment

### Deploying to Vercel (Recommended)

1. Push this repository to **GitHub**.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Add your environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_SESSION_SECRET`
5. Click **"Deploy"**.

---

## 📂 Project Structure

```text
├── app/
│   ├── admin/             # Admin Dashboard & Management Pages
│   │   ├── bookings/      # Client Booking Inquiries
│   │   ├── dashboard/     # Metric Overview & Stats
│   │   ├── gallery/       # Gallery Image Manager
│   │   ├── services/      # Services Management
│   │   ├── settings/      # Admin Account & Security Settings
│   │   └── testimonials/  # Client Reviews Management
│   ├── api/               # Secure Backend API Routes
│   │   ├── admin/auth/    # Cryptographic Authentication API
│   │   ├── bookings/      # Booking Inquiries API
│   │   ├── gallery/       # Event Gallery API
│   │   ├── services/      # Services API
│   │   └── testimonials/  # Testimonials API
│   ├── globals.css        # Core Design Tokens & Global Styles
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Main Landing Page
├── components/            # UI Components (Hero, About, Services, Gallery, etc.)
├── data/                  # Local JSON Data Caching
├── lib/                   # Database & Security Helpers (auth.ts, supabase.ts)
├── middleware.ts          # Edge Authentication Route Guard
├── public/                # Static Assets & Uploads
└── next.config.ts         # Next.js Configuration
```

---

## 📄 License & Ownership

Designed & Developed exclusively for **Varsha Jain (Varsha's Versatile)**. All rights reserved.
