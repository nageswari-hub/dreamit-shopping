# 🛍️ DreamIT Mall — Next-Gen Modern Department Store

> A full-functionality, local-first shopping destination featuring multi-category retail, customer & administrator authentication, return & cancellation lifecycle management, priority deals, and zero external database setup.

![Tech Stack](https://img.shields.io/badge/Stack-React_18_%7C_TypeScript_%7C_TailwindCSS_%7C_Vite-blue)
![Database](https://img.shields.io/badge/Database-Zero_External_DB_(LocalFirst)-emerald)
![Security](https://img.shields.io/badge/Access_Control-Role--Based_(Customer_&_Admin)-purple)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ⚡ Newly Added Features & Enhancements

### 🛡️ 1. Customer & Administrator Authentication
- **Dual Role System**: Separate authentication flows for **Customers** and **Store Administrators**.
- **Admin Access Control Gate**: The Administrator Portal is strictly protected. Non-admin users attempting to open the Admin Portal see a restricted access gate with security badges.
- **1-Click Demo Accounts**:
  - **Administrator**: `admin@dreamit.com` (full financial analytics, inventory editing, order approvals)
  - **Customer**: `user@dreamit.com` (shopping, order tracking, returns, reviews)
- **Account Dropdown**: Live avatar, role badge, quick switcher, and logout button.

### 📦 2. Order Cancellation & Return Management
- **Instant Order Cancellation**: Available on `Confirmed` or `Processing` orders. Automatically restocks inventory items and issues a simulated refund.
- **30-Day Return Guarantee**: Customers can request returns on `Delivered` orders with reason tracking.
- **Admin Return Approvals**: Administrators can review return requests and approve refunds with 1-click automated inventory restock.

### 🔍 3. Real-Time Deep Search & Priority Sorting
- **Instant Search**: Search across product titles, descriptions, categories, brands, and tags with 1-click clear and auto-tab switching to the catalog.
- **✨ New Arrivals First**: Prioritizes all brand-new (`isNew: true`) items at the top of the collection, followed by the rest.
- **🔥 Discount Deals First**: Prioritizes all items on sale, ranked from highest discount percentage to lowest, followed by regular items.

### 🏢 4. DreamIT Mall Brand Identity
- Complete rebrand across **Navbar**, **Hero Banner**, **Invoices**, **Footers**, and **HTML metadata**.

---

## 🚀 Getting Started

```powershell
cd D:\elevate
npm run dev
```
Open **`http://localhost:5173`** in your browser.
