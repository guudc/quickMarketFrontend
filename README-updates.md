# Integration Steps for Next.js + Backend

## 1. Environment Setup
- Add `.env.local` with all required variables (see template).
- Ensure `API_BASE_URL` points to backend (e.g., `http://localhost:5000`).

## 2. Next.js Proxy Configuration
- `next.config.mjs` now proxies `/api/*` requests to backend, avoiding CORS issues.

## 3. Frontend API Calls
- Use `/api/*` in frontend code; requests are proxied to backend.
- Use `fetch` or `axios` in service/helper files.

## 4. Authentication
- NextAuth forwards JWT tokens to backend for protected routes.
- Use `Authorization: Bearer <token>` for secure endpoints.

## 5. Dev & Prod Scripts
- Run backend: `cd api && npm run dev`
- Run frontend: `npm run dev`
- For unified dev: install `concurrently` and add script:
  ```json
  "dev:all": "concurrently \"npm run dev\" \"cd api && npm run dev\""
  ```

## 6. Testing
- Use `components/ApiHealthCheck.tsx` to verify backend connectivity.
- Check all CRUD operations in frontend against backend endpoints.

## 7. Code Cleanliness
- Remove mock API logic from Next.js API routes.
- Use backend for all business logic and data.

## 8. Deployment
- Ensure backend is deployed and accessible to Next.js in production.
- Set correct `API_BASE_URL` in production environment.

---

**For any missing or mismatched endpoints, log errors and update backend/frontend as needed.**
# Quick Market Theme & Header Updates

## Files Modified

### Theme Changes
- `app/globals.css`: Added `--color-white-white: #ffffff` CSS variable for consistent white theming
- Added `scroll-padding-top: 4rem` to handle sticky header offset for anchor links

### Header/Navbar Changes  
- `components/navbar.tsx`: 
  - Updated layout to use `justify-between` with logo on left and "Join Now" CTA on right
  - Added byline "by Merch Africa" under the Quick Market logo
  - Centered navigation links between logo and CTA on desktop
  - Ensured "Join Now" button remains visible in mobile hamburger menu
  - Maintained responsive behavior across all breakpoints

### Assets Added
- `public/quick-market-logo.jpg`: Created Quick Market logo with red background and white shopping/market icon

## New CSS Variables
- `--color-white-white`: Pure white (#ffffff) for consistent theming

## Responsive Behavior
- Desktop: Logo left, navigation centered, "Join Now" right
- Mobile: Logo left, hamburger right, "Join Now" prominently displayed in mobile menu
- Sticky header with proper scroll offset for anchor navigation
