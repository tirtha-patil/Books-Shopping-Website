# Chapter & Verse — Student Online Book Store

A responsive full-stack web app for a student book store, built with **React**
(frontend), **Node.js / Express** (backend API), and **MongoDB** (database).
A MySQL-compatible schema is also included if you'd rather use MySQL/Oracle.

## Pages

1. **Home Page** — hero, subject categories, "how it works", CTA.
2. **Login Page** — student sign-in, JWT-based auth.
3. **Registration Page** — creates a student account (saved to the database).
4. **Catalogue Page** — searchable, filterable book listing pulled from the database.

## Tech Stack

| Layer     | Technology                     |
|-----------|---------------------------------|
| Frontend  | React 18 + Vite, React Router   |
| Backend   | Node.js + Express               |
| Database  | MongoDB (Mongoose) — MySQL schema also provided |
| Auth      | JWT + bcrypt password hashing   |

## Project Structure

```
bookstore-app/
├── backend/                 # Express API
│   ├── config/db.js         # MongoDB connection
│   ├── models/               # User.js, Book.js (Mongoose schemas)
│   ├── routes/                # auth.js, books.js
│   ├── middleware/auth.js    # JWT verification
│   ├── seed.js                # Sample book data loader
│   ├── server.js              # App entry point
│   └── .env.example
├── frontend/                 # React app (Vite)
│   └── src/
│       ├── pages/             # Home, Login, Register, Catalogue
│       ├── components/        # Navbar, Footer, BookCard
│       ├── context/           # AuthContext (login state)
│       ├── api/api.js         # Axios API client
│       └── styles/index.css   # Design system
├── database/
│   └── mysql_schema.sql       # Alternative relational schema
└── README.md
```

## Setup

### 1. Backend (Express + MongoDB)

```bash
cd backend
npm install
cp .env.example .env       # edit MONGO_URI / JWT_SECRET if needed
npm run seed                # loads sample books into MongoDB
npm run dev                  # starts API on http://localhost:5000
```

Requires a running MongoDB instance. Either install MongoDB locally
(`mongod`) or point `MONGO_URI` in `.env` to a MongoDB Atlas cluster.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev                  # starts app on http://localhost:3000
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`,
so the frontend and backend talk to each other automatically in development.

> Note: the Catalogue page also ships with built-in sample data, so it
> renders correctly even before you've connected the backend — useful for
> quickly previewing the UI.

### 3. Using MySQL / Oracle instead of MongoDB

If your assignment requires a relational database, run
`database/mysql_schema.sql` against MySQL (or adapt the syntax slightly for
Oracle) to create the `users`, `books`, and `orders` tables, then swap the
Mongoose models/queries in `backend/` for a MySQL client such as `mysql2` or
an ORM like Sequelize/Prisma.

## API Endpoints

| Method | Endpoint             | Description                     |
|--------|-----------------------|----------------------------------|
| POST   | /api/auth/register     | Register a new student           |
| POST   | /api/auth/login        | Log in and receive a JWT         |
| GET    | /api/books              | List books (supports `?search=` & `?category=`) |
| GET    | /api/books/:id          | Get a single book                |
| POST   | /api/books               | Add a book (requires auth token) |

## Build for Production

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (Nginx, Vercel, Netlify) and
deploy `backend/` to a Node host (Render, Railway, EC2, etc.), pointing
`MONGO_URI` to your production database.
