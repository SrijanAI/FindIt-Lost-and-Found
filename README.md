<div align="center">

# 🔍 FindIt
### Lost & Found Matcher for Campus

**A web platform that helps college students report lost and found items, automatically matches them, and lets users chat in real-time to coordinate returns.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-2563EB?style=for-the-badge&logo=vercel)](https://lost-and-found-cyan-kappa.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

---

*College Mini Project — Computer Science Engineering*
*Guided by: Dr. Nachiketa Tarasia*

</div>

---

## ✨ What is FindIt?

Every semester, hundreds of items are lost on college campuses — and most are never recovered. WhatsApp groups get flooded, college emails go to spam, and items pile up unclaimed at the security office.

**FindIt fixes this.** Students can report lost or found items in under a minute, and the system automatically finds matches using a scoring algorithm. When a match is found, both users are notified and can chat instantly to get the item back.

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 📋 **Report Items** | Post lost or found items with photos, tags, category, date, and location |
| 🤖 **Auto-Matching** | Algorithm scores item pairs by tags, date proximity, and location distance |
| 💬 **Real-Time Chat** | Instant messaging with image sharing between matched users |
| 🔔 **Notifications** | Live alerts for new matches and messages |
| 🗺️ **Campus Map** | Pick and view item locations on an interactive map |
| 🔍 **Browse & Search** | Filter items by type, category, and keyword |
| 📊 **Dashboard** | Platform-wide stats, your items, and your recent matches |
| 👤 **Profile** | Custom profile picture, name, phone, and college info |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |

---

## 🧠 How Matching Works

When you report an item, a PostgreSQL function automatically runs and compares it against all opposite-type open items in the same category:

```
Match Score = Category (same?) + Tag Overlap + Date Proximity + Location Distance
```

| Factor | Weight | Logic |
|--------|--------|-------|
| **Same Category** | Required | Items must share a category to be compared |
| **Tag Similarity** | 25% | Jaccard similarity — shared tags ÷ total tags |
| **Date Proximity** | 20% | Full score within 7 days, fades to 0 after 30 days |
| **Location Distance** | 20% | Based on GPS coordinates — closer = higher score |

> Matches scoring above **40%** are saved and both users are notified with a "Why it matched" breakdown.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Full-stack React framework |
| **Language** | TypeScript (Strict) | Type safety across the entire codebase |
| **Database** | Supabase (PostgreSQL) | Database, auth, storage, realtime |
| **Styling** | Tailwind CSS + shadcn/ui | UI components and design system |
| **Forms** | React Hook Form + Zod | Validated, performant forms |
| **Maps** | Leaflet.js | Interactive campus map |
| **State** | Zustand | Lightweight auth state management |
| **Hosting** | Vercel | Automatic CI/CD deployment |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup, OAuth callback
│   └── (main)/          # Dashboard, Browse, Chat, Profile, Report
├── components/
│   ├── auth/            # AuthForm
│   ├── chat/            # ChatWindow, MessageBubble, ConversationList
│   ├── items/           # ItemCard, ItemForm, ItemFilters, TagInput
│   ├── layout/          # Sidebar, Topbar, MobileNav
│   ├── map/             # CampusMap, LocationPicker, LocationDisplay
│   ├── matches/         # MatchCard, MatchScoreBadge
│   ├── notifications/   # NotificationBell, NotificationDropdown
│   └── ui/              # shadcn/ui components
├── hooks/               # useRealtimeMessages, useRealtimeNotifications
├── lib/                 # Supabase clients, Zustand store, validations
└── types/               # Shared TypeScript types
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repository
```bash
git clone https://github.com/SrijanAI/FindIt-Lost-and-Found.git
cd FindIt-Lost-and-Found
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL and anon key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up the database
Copy the contents of `supabase-schema.sql` and run it in your **Supabase → SQL Editor**.

Then create a **Storage bucket** in Supabase:
- Name: `item-images`
- Public: ✅ Yes

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

```
profiles          → User accounts
items             → Lost & found reports
matches           → Auto-generated item matches
conversations     → Chat threads between users
messages          → Individual chat messages
notifications     → Match & message alerts
```

Row-level security is enabled on all tables. A PostgreSQL trigger auto-creates a profile on signup, and a function auto-generates matches on every item insert.

---

## 👥 Team

| Name | Roll Number |
|------|------------|
| Srijan Chakraborty | 2305090 |
| Debaranjan Lenka | 2305___ |
| Shreyash Dubey | 23051955 |
| Avinash Yein | 23051901 |

---

## 📄 License

This project was built as a college mini project. Feel free to use it as a reference or build on top of it.

---

<div align="center">

**🌐 [Live Demo](https://lost-and-found-cyan-kappa.vercel.app) &nbsp;·&nbsp; Built with ❤️ for campus students**

*Reuniting people with what matters*

</div>
