# 🛍️ ElevateStore — Advanced E-Commerce Platform

> A production-grade, local-first e-commerce web application with full retail functionality and zero external database overhead.

![Tech Stack](https://img.shields.io/badge/Stack-React_18_%7C_TypeScript_%7C_TailwindCSS_%7C_Vite-blue)
![Database](https://img.shields.io/badge/Database-Zero_External_DB_(LocalFirst)-emerald)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ⚡ Highlights & Key Features

### 🛒 1. Dynamic Catalog & Multi-Facet Filtering
- **Multi-Category Browsing**: Electronics & Audio, Fashion & Apparel, Watches & Accessories, Home & Living, Fitness & Sports.
- **Multi-Facet Filter Controls**: Category, Price range slider ($20 - $500), Minimum star rating (3.5★ to 4.5★+), and In-stock only toggle.
- **Real-Time Instant Search**: Multi-field search across titles, brands, categories, and tags with 1-click clear.
- **Sorting Modes**: Featured, Price: Low to High, Price: High to Low, Highest Rated, and New Arrivals.

### 🔍 2. Interactive Product Details & Review System
- **Image Gallery**: Large viewport with interactive thumbnail strip switcher.
- **Dynamic Variants**: Color picker with real-time swatches and Size selectors.
- **Persistent Customer Reviews**: Verified buyer badges, interactive star rating picker (1-5★), and feedback submission form stored locally.
- **Technical Specs Table**: Detailed attribute breakdowns for every item.

### 🛍️ 3. Cart Drawer & Smart Promotions
- **Slide-Out Mini Cart Drawer**: Fluid animations with subtotal counter and quantity adjusters.
- **Dynamic Free Shipping Progress Bar**: Live calculation showing remaining dollars to unlock free delivery.
- **Voucher / Promo Code Engine**:
  - `ELEVATE20` (20% off orders > $50)
  - `WELCOME10` (10% off any order)
  - `SUPER30` (30% off orders > $150)
  - Quick-apply 1-click pills.

### 💳 4. Multi-Step Checkout Simulation
- **Step 1**: Shipping contact & address verification.
- **Step 2**: Delivery speed selection (Standard vs. Express Courier vs. Hub Pickup).
- **Step 3**: Payment simulation (Credit/Debit Card with live formatting, Instant UPI, Cash on Delivery).
- **Step 4**: Confetti explosion celebration, order confirmation ID (`ELV-XXXXXX`), tracking code (`TRK-XXXXXXXX`), and printable tax invoice.

### 📦 5. Orders Ledger & Tracking
- **Interactive Delivery Timeline**: *Confirmed &rarr; Processing &rarr; Shipped &rarr; Delivered*.
- **Tracking Code**: One-click clipboard copy.
- **Printable / PDF Invoice**: Clean, official tax receipt format ready for printing.
- **1-Click Reorder**: Instantly repurchase all items from past orders.

### 📊 6. Merchant / Admin Suite
- **Executive Analytics**: Gross Revenue, Total Orders, Average Order Value (AOV), and Low Stock Alerts.
- **Inventory SKU Manager**: Stock replenishment stepper, price editor, item deletion, and Add New Product modal.
- **Demo Data Reset**: Instant one-click restore to original demo state anytime.

### 🌐 7. Global Currency & Theme System
- **Currency Switcher**: Real-time conversion across **USD ($)**, **EUR (€)**, **GBP (£)**, and **INR (₹)**.
- **Dark / Light Mode**: Seamless theme switching persisted in `localStorage`.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visual FX**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Data Persistence**: Local-First Architecture via `localStorage` with automated serialization and fallback handling.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 📜 Frequent Git Commit History

1. `0d21eef` — `feat: initialize project scaffold with React, TypeScript, and Tailwind CSS`
2. `34293d2` — `feat: implement local-first storage engine, mock catalog, and currency converter`
3. `cf56150` — `feat: build responsive navbar, hero banner, search, and category navigation`
4. `44b01f3` — `feat: build product catalog grid with multi-facet filters and sorting`
5. `a2457d2` — `feat: add interactive product modal with variants, image gallery, and review system`
6. `390fc74` — `feat: build slide-out cart drawer with promo codes and free shipping progress`
7. `afbf60f` — `feat: implement multi-step checkout flow with card validation and order confirmation`
8. `2100032` — `feat: add order tracking and printable invoice receipt view`
9. `8a9260b` — `feat: add admin/merchant dashboard for inventory management and sales analytics`
10. `Milestone 10` — `style: polish animations, dark mode, responsive layout, and final touchups`
