# TodoEngine

A modern web application that transforms calendar subscription links into actionable todo lists with robust user authentication and real-time synchronization.

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env` file:
```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
