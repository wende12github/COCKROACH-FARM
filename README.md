# COCKROACH-FARM

## Project Overview

COCKROACH-FARM is a web-based dashboard application built with Next.js for monitoring and managing a cockroach breeding farm. The application provides real-time insights into environmental conditions, population analytics, waste tracking, device controls, and alerts.

## Features

- **Environment Metrics**: Monitor temperature, humidity, and other environmental factors
- **Device Controls**: Control farm equipment and devices
- **Population Analytics**: Track cockroach population growth and statistics
- **Waste Tracking**: Monitor waste intake and management
- **Alerts System**: Receive notifications for critical events
- **Monthly Summary**: View comprehensive monthly reports
- **User Management**: Handle authentication and user roles
- **Notifications**: Manage system notifications with filtering

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, Recharts
- **Backend/Database**: Firebase
- **Icons**: Lucide React
- **Date Handling**: date-fns

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contribution Setup Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm, yarn, pnpm, or bun package manager
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wende12github/COCKROACH-FARM.git
   cd COCKROACH-FARM
   ```

2. Navigate to the dashboard directory:

   ```bash
   cd cockroach_farm_dashboard
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

4. Set up environment variables:
   - Copy `.env.local.example` to `.env.local` (if it exists)
   - Configure your Firebase credentials and other environment variables

### Development

1. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Code Quality

- Run linting: `npm run lint`
- The project uses ESLint for code quality checks

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Project Structure

```
cockroach_farm_dashboard/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── chambers/          # Chambers management
│   ├── notifications/     # Notifications system
│   ├── population/        # Population analytics
│   ├── reports/           # Reports page
│   ├── settings/          # Settings page
│   └── users/             # User management
├── components/            # Reusable React components
│   ├── Dashboard/         # Dashboard-specific components
│   └── UI/                # UI components
├── lib/                   # Utility libraries
│   ├── firebase/          # Firebase configuration and services
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

### Firebase Setup

The application uses Firebase for backend services. You'll need to:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication, Firestore, and other required services
3. Add your Firebase configuration to `.env.local`

### Deployment

The application can be deployed to Vercel, Netlify, or any platform supporting Next.js applications. Refer to the Next.js deployment documentation for specific instructions.
