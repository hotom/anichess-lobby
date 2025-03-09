# Social Media App

A modern social media application built with Next.js 14, Prisma, and NextAuth.js.

## Features

- 🔐 Authentication with NextAuth.js
- 👤 User profiles with customizable display names and profile pictures
- 📝 Post creation with text and image support
- 🔄 Real-time feed updates
- 👥 Follow/Unfollow functionality
- 🖼️ Image upload support
- 🎨 Modern UI with dark mode

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js
- Tailwind CSS
- Axios

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd first-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```env
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses PostgreSQL with Prisma as the ORM. Key models include:
- User (authentication, profile)
- Post (content sharing)
- Follow relationships

## Contributing

Feel free to submit issues and pull requests.

## License

MIT
