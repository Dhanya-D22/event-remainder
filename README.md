# Event Reminder

A responsive celebration planner built with React/Vite, Express, and PostgreSQL. The interface includes a dashboard, calendar, event management, achievements, and personal settings.

## Features

- Create an account or sign in. Each account sees only its own events and settings.
- Add, edit, delete, and search events, with yearly recurrence and advance reminder preferences.
- Dashboard totals, current streak, upcoming celebrations, and time-aware greeting.
- Monthly calendar with event markers and a selected-day event list.
- Achievement progress for saved events and qualifying activity days.
- Light/dark appearance and reminder preferences saved per account.
- Responsive desktop sidebar and mobile bottom navigation.

## Run locally

### Requirements

- Git
- Node.js (npm is included with Node.js)
- PostgreSQL

### Setup after cloning

1. Clone the repository and open its folder:

   ```bash
   git clone <repository-url>
   ```

   Then change into the folder created by `git clone`.

2. Install dependencies from the root, client, and server folders:

   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

3. Start PostgreSQL and create a database named `event_reminder`.
4. Copy `server/.env.example` to `server/.env`. Set `DATABASE_URL` to connect to the local database, set `JWT_SECRET` to a long random value, and configure the `SMTP_*` values for an email provider. SMTP is required to send sign-in codes. Keep `server/.env` private; it is ignored by Git.
5. Create the database tables:

   ```bash
   npm run db:setup --prefix server
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

7. Open the Vite URL shown in the terminal, normally http://localhost:5173.

The API listens on port 4000. The client proxies `/api` requests to it. Authentication uses bearer tokens; configure `JWT_SECRET` before using accounts outside local development.

Sign-in uses a one-time code sent to the account email. Account creation still asks for a password, but returning users sign in with an emailed code. A code expires after 10 minutes and can be used only once.

Commit the `package.json` and lockfiles so npm can install the correct dependencies. Do not commit `node_modules`, build output, or `server/.env`; these are excluded by `.gitignore`.

## Reminder delivery

This version stores reminder intervals and the user's enabled preference. The app does not claim to send notifications while it is closed: delivery requires a running scheduler and a configured push or email provider. Browser notification permission alone is not a reliable background scheduler.

## Project layout

- `client/` React pages and responsive styles.
- `server/` Express API, authentication, event routes, and PostgreSQL access.
- `server/sql/schema.sql` database setup script.
