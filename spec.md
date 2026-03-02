# Specification

## Summary
**Goal:** Build the full Phase 1 core platform for Golden Key Car Rental — a bilingual (EN/AR), luxury-themed car rental web application with car listings, booking flow, user dashboard, admin dashboard, reviews, and a blog.

**Planned changes:**
- Apply a global premium theme: deep charcoal/black background, gold (#C9A84C) accents, white typography, responsive layout via Tailwind
- Add bilingual support (English / Arabic) with full RTL/LTR layout switching and session-stored language preference
- Build a car listings page with search bar and filter panel (location, dates, category, transmission, max daily price); display car grid cards with image, name, category, rate, availability badge, and "Book Now" button
- Build a car detail page with photo gallery, specs, availability calendar, dynamic pricing calculator (rental duration, promo code, early payment discount, USD/AED/EUR currency selector), and reviews section
- Build a single-page multi-step booking flow (rental confirmation → add-ons → customer info form → Stripe payment), storing bookings with status "pending"
- Implement a reviews and ratings system (1–5 stars + text) for authenticated users with completed bookings; show average rating on card and detail page
- Build a user dashboard (Internet Identity protected) with profile management, booking history with status badges, HTML invoice download for completed bookings, and booking cancellation
- Build an admin dashboard (Internet Identity protected, restricted to admin principal IDs) with CRUD car management, booking management (status updates, refund notes), user management, promotions/promo code management, and monthly/per-car revenue reports
- Add a blog section: public listing page with article cards, individual post pages, and admin blog post creation/publishing
- Add a floating WhatsApp contact button (bottom-right, all public pages) using a wa.me deep link with a pre-filled greeting; phone number stored in a frontend constants file
- Backend (Motoko single actor) stores cars, bookings, users, reviews, promo codes, blog posts, and admin principal IDs

**User-visible outcome:** Visitors can browse and filter cars, view detailed car pages with pricing calculations, complete a full booking with add-ons and Stripe payment, read and write reviews, and switch between English and Arabic. Authenticated users manage their bookings and profile via a dashboard. Admins manage all platform content including cars, bookings, promotions, blog posts, and view revenue reports.
