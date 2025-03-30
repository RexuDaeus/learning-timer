# The First 20 Hours - Learning Timer

A web application to track your learning progress following the 20-hour rule. This application helps you break down skills, track your progress, and stay focused on your learning goals.

## Features

- User authentication
- Create, edit, and delete learning timers
- Track time spent on each skill
- Break down skills into manageable components
- Elegant, responsive design with light/dark mode

## Live Demo

Visit the live application at: [Your deployed URL]

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd learning-timer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up Supabase

1. Create a new project on [Supabase](https://supabase.com/)
2. Navigate to SQL Editor and run the SQL script from `supabase/schema.sql` to set up tables and policies
3. Go to Project Settings > API to get your project URL and anon key
4. Add these credentials to your environment variables

## Deployment

### Deploying to Vercel

1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com/)
3. Connect your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## License

MIT

## Credits

- Design inspired by [memories-with-mom.netlify.app](https://memories-with-mom.netlify.app/)
- "The First 20 Hours" concept by Josh Kaufman 