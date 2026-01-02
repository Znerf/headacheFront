# Headache Tracker Frontend (Next.js)

A clean, modern Next.js frontend with JWT authentication handling (access + refresh tokens) and beautiful UI.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS for styling
- ✅ JWT Authentication (Access & Refresh Tokens)
- ✅ Automatic Token Refresh
- ✅ Login & Signup Pages
- ✅ Protected Dashboard
- ✅ Responsive Design
- ✅ Clean UI/UX

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment Variables

The `.env.local` file is already configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm start
```

The application will start on `http://localhost:3000`

## Pages

- **/** - Landing page with headache tracking information
- **/login** - User login page
- **/signup** - User registration page
- **/dashboard** - Protected dashboard with headache tracking details

## Features

### Authentication Flow

1. User signs up or logs in
2. Backend returns access token (15min) and refresh token (7 days)
3. Tokens are stored in localStorage
4. Access token is automatically attached to API requests
5. When access token expires, refresh token automatically gets a new access token
6. If refresh token expires, user is redirected to login

### Token Management

The application includes:
- Automatic token refresh when access token expires
- Axios interceptors for attaching tokens to requests
- Automatic redirect to login on authentication failure
- Secure token storage in localStorage

## Project Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── api.ts          # Axios instance with interceptors
│   └── auth.ts         # Authentication service
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **React** - UI library

## Key Components

### API Client (`lib/api.ts`)

- Axios instance with base URL configuration
- Request interceptor to add access token to headers
- Response interceptor to handle token refresh on 401 errors
- Automatic retry of failed requests after token refresh

### Auth Service (`lib/auth.ts`)

- `signUp()` - User registration
- `login()` - User authentication
- `logout()` - User logout
- `getProfile()` - Fetch current user data
- `setTokens()` - Store tokens in localStorage
- `isAuthenticated()` - Check if user is logged in

## Usage

### Sign Up

1. Navigate to `/signup`
2. Enter name, email, and password
3. Submit form
4. Automatically redirected to dashboard

### Login

1. Navigate to `/login`
2. Enter email and password
3. Submit form
4. Automatically redirected to dashboard

### Dashboard

- View information about headache tracking
- Access protected content
- Logout functionality

## Styling

The application uses Tailwind CSS with:
- Gradient backgrounds
- Clean card designs
- Responsive layouts
- Hover effects
- Focus states
- Custom color scheme (indigo/blue)

## Security Considerations

- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh reduces exposure
- Access tokens have short expiration (15 minutes)
- Refresh tokens have longer expiration (7 days)
- User redirected to login on authentication failure

## Future Enhancements

- Add headache entry logging functionality
- Add charts and analytics
- Add trigger tracking
- Add medication tracking
- Add export functionality for sharing with doctors
- Implement headache calendar view
- Add reminder notifications
