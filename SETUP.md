# Local Development Setup Guide

## Prerequisites

1. Node.js 20.x or higher
2. PostgreSQL 14.x or higher
3. Git

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone [your-repository-url]
cd [repository-name]
```

### 2. Database Setup

#### Install PostgreSQL
- **Windows**: Download and install from [PostgreSQL Website](https://www.postgresql.org/download/windows/)
- **macOS**: Use Homebrew: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

#### Create Database
1. Log into PostgreSQL:
   ```bash
   psql -U postgres
   ```
2. Create a new database:
   ```sql
   CREATE DATABASE todoengine;
   ```

### 3. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   - Set your PostgreSQL credentials
   - Update DATABASE_URL with your local database details
   - Set a secure SESSION_SECRET

### 4. Install Dependencies

```bash
npm install
```

### 5. Initialize Database Schema

```bash
npm run db:push
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Common Issues and Solutions

### Database Connection Issues
1. Ensure PostgreSQL service is running
2. Verify credentials in .env file
3. Check if the database exists
4. Test connection: `psql -U your_username -d todoengine`

### Node.js Version Issues
- Use `nvm` (Node Version Manager) to switch to Node.js 20:
  ```bash
  nvm install 20
  nvm use 20
  ```

### Port Conflicts
If port 5000 is in use:
1. Check which process is using the port:
   - Windows: `netstat -ano | findstr :5000`
   - Unix/Mac: `lsof -i :5000`
2. Either stop the conflicting process or change the port in server/index.ts

## Development Workflow

1. Make changes to the code
2. The development server will automatically reload
3. Check the console for any errors
4. Test your changes in the browser

## Testing Calendar Integration

1. Get an iCal feed URL (e.g., from Google Calendar)
2. Create an account in the application
3. Add the calendar feed
4. Verify that todos are being created from calendar events

## Project Structure Overview

```
├── client/             # Frontend React code
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utility functions
│   │   └── pages/     # Page components
├── server/            # Backend Express code
│   ├── auth.ts       # Authentication logic
│   ├── routes.ts     # API routes
│   └── storage.ts    # Database operations
└── shared/           # Shared types and schemas
    └── schema.ts     # Database schema
```
