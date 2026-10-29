# NexLib — Enterprise Smart Library Management System (LMS)

A full-stack, industry-grade Academic Library Management and Digital Reading Platform built with the **MERN Stack** (MongoDB, Express 5, React 19, Node.js) and bundled with **Vite 8**.

---

## 🌟 Key Highlights & System Architecture

- **Public SaaS Landing Page (`/`)**: High-impact hero section, live real-time repository statistics synced with MongoDB, curated featured collections, 3-step circulation workflow, FAQ accordion, and campus library operating hours.
- **Live Searchable Catalog (`/catalog`)**: Instant multi-parameter filtering by genre, availability (In-Stock only), ISBN lookup, and sorting (popularity, newest, alphabetical, publication year).
- **Dedicated Book Detail Pages (`/books/:id`)**: Rich 3D book cover visualizer, publication metadata, stock indicators, chapter preview list, and related category recommendations.
- **Distraction-Free Digital Reader**: Integrated multi-theme reading engine (Dark Night, Warm Sepia, Clean Daylight) with font-scaling, typography controls (Serif & Sans), reading progress tracking, and persistent bookmarks saved in `localStorage`.
- **Student Circulation Portal (`/student`)**:
  - Live active loan tracking with dynamic color-coded countdowns and overdue alerts.
  - **Online 14-day loan renewals** (with 2-renewal maximum limit enforcement).
  - One-click physical book borrowing and instant returns with automated fine calculation (₹5/day statutory rate).
  - Dedicated **Digital Reading Room** to quickly resume textbooks.
  - Contextual **AI Assistant Chatbot** powered by verified token identity.
- **Admin Control Center (`/admin`)**:
  - Executive KPI metrics bar (Unique Titles, Active Circulation, Overdue Loans, Fines Collected).
  - Interactive database-driven charts for category distribution and 6-month monthly circulation volume.
  - Complete Book Inventory Management (Add, Edit stock quantity, Edit digital chapters, Delete).
  - **Student Directory Management** (Student roster, department, loan counts, account suspension/reactivation toggle).
  - Real-time **Circulation Desk** and dedicated **Overdue & Fines Settlement Queue**.
- **User Profile & Security Console (`/profile`)**: Update profile details (Name, Department, Phone) and secure password change workflow.
- **Enterprise Security & Data Isolation**:
  - Public registration strictly enforces the `student` role (zero client privilege escalation).
  - Chatbot user identity strictly derived from verified JWT authentication context, preventing user ID spoofing.
  - Admin endpoints protected by server-side authorization middleware (`protect`, `adminOnly`).
  - Private loan records strictly isolated to the authenticated student or administrators.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, React Router DOM v7, Vite 8, Axios |
| **Styling & UI** | Custom Cyber-Aurora & Glassmorphism Design System, CSS Variables, Responsive Grids |
| **Backend** | Node.js, Express.js 5.2, REST API Architecture |
| **Database & ODM** | MongoDB, Mongoose 9.5 |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **Testing** | Automated Node.js integration & security test suite |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or later recommended)
- **MongoDB** running locally on default port `27017` (e.g., `mongodb://127.0.0.1:27017/library_management`)

### 2. Backend Setup
1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm.cmd install
   ```
3. Verify environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/library_management
   JWT_SECRET=my_library_management_secret_2026
   ```
4. Run automated test suite:
   ```bash
   npm.cmd test
   ```
5. Start backend development server:
   ```bash
   npm.cmd run dev
   # Server runs at http://localhost:5000
   ```

### 3. Frontend Setup
1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm.cmd install
   ```
3. Build for production verification:
   ```bash
   npm.cmd run build
   ```
4. Start Vite development server:
   ```bash
   npm.cmd run dev
   # Application opens at http://localhost:5173
   ```

---

## 🔑 Demo & Reviewer Credentials

Pre-seeded accounts are available for instant testing:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Student** | `student@lms.com` | `student123` | Student Dashboard, Borrowing, Renewals, Reader |
| **Admin** | `admin@lms.com` | `admin123` | Full Admin Console, Inventory, Students, Overdue |

*(A quick-fill button is also provided on the `/login` screen for 1-click credential filling).*

---

## 📡 API Overview

### Public Endpoints
- `GET /api/books` — Retrieve paginated catalog with search, category, sort, and stock filters.
- `GET /api/books/:id` — Retrieve comprehensive book details and chapter overview.
- `GET /api/analytics/public` — Retrieve real-time library counts, popular books, and categories.
- `POST /api/auth/register` — Register student account (enforces `student` role).
- `POST /api/auth/login` — Authenticate user and return JWT bearer token.

### Protected Student Endpoints (Bearer Token required)
- `GET /api/issues/user/:userId` — Retrieve student's borrowing history and active loans.
- `POST /api/issues` — Borrow a physical copy of a book for 14 days.
- `PUT /api/issues/return/:id` — Return an active loan with automatic fine assessment.
- `POST /api/issues/renew/:id` — Renew eligible loan by 14 days (up to 2 times).
- `POST /api/chatbot/ask` — Context-aware library assistant queries.
- `GET /api/auth/profile` — Fetch student profile details and loan counts.
- `PUT /api/auth/profile` — Update name, department, or phone number.
- `PUT /api/auth/change-password` — Change account password.

### Protected Admin Endpoints (Admin Token required)
- `GET /api/analytics/stats` — Executive dashboard statistics and monthly circulation breakdown.
- `POST /api/books` — Add new book title to repository.
- `PUT /api/books/:id` — Update book stock, metadata, or digital chapters.
- `DELETE /api/books/:id` — Delete book from catalog.
- `GET /api/issues` — Retrieve all active and returned circulation records.
- `GET /api/issues/overdue` — Retrieve all overdue items with assessed fines.
- `GET /api/auth/students` — Retrieve directory of registered students.
- `PUT /api/auth/students/:id/status` — Toggle student account status (Active / Suspended).


---

## 🌐 Production Deployment Guide

NexLib is configured for seamless split deployment:
- **Frontend**: [Vercel](https://vercel.com) (React 19 + Vite 8 SPA)
- **Backend**: [Render](https://render.com) or Railway (Express 5 REST API)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Managed Cloud Database)

### 1. Database Setup (MongoDB Atlas)
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user (e.g. `lms_admin`) with read/write privileges.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
4. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/library_management?retryWrites=true&w=majority
   ```

### 2. Backend Deployment (Render)
1. Sign in to [Render](https://dashboard.render.com).
2. Click **New +** → **Web Service** and connect this GitHub repository (`library-management-system`).
3. Set the following build settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `a_strong_random_secret_string_here`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
5. Click **Deploy Web Service**.
6. Note your backend URL (e.g., `https://nexlib-api.onrender.com`).
   - Test health check: `https://nexlib-api.onrender.com/api/health`

### 3. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import the existing GitHub repository `library-management-system`.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
5. Click **Deploy**. Vercel will build and deploy the React application with SPA routing rules managed by `frontend/vercel.json`.
