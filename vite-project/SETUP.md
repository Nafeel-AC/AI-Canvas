# AI Canvas Authentication Setup

## Supabase Configuration

To enable authentication in your AI Canvas app, you need to set up Supabase:

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** and **anon public key**

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

### 4. Set Up Authentication
In your Supabase dashboard:
1. Go to **Authentication > Settings**
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Add any additional redirect URLs if needed

### 5. Database Setup
The authentication system will automatically create user profiles. If you want to store additional user data:

1. Go to **Table Editor** in Supabase
2. You can create additional tables as needed
3. The username is stored in `auth.users.user_metadata.username`

## Features

### Authentication Flow
- **Sign Up**: Users can create accounts with username, email, and password
- **Email Confirmation**: Users receive an email confirmation link
- **Sign In**: Users can log in with email and password
- **Sign Out**: Users can securely sign out

### Navigation
- **Not logged in**: Shows "Home" and "FAQ" links
- **Logged in**: Shows "Home", "FAQ", and "Dashboard" links
- **Button**: Changes from "Sign In" to user greeting and "Sign Out" button

### Security
- Passwords are securely hashed by Supabase
- Email confirmation required for new accounts
- Session management handled automatically
- Dark mode support for all auth components

## Development

Start the development server:
```bash
npm run dev
```

Your app will be available at `http://localhost:5173` 