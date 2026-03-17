# LU Competitive Programming Archive

A platform for Leading University students to practice competitive programming, track progress, and compete with peers.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm/yarn package manager

### Installation

```bash
git clone https://github.com/Iftekhar-Ifat/lu-cp-archive.git
cd lu-cp-archive
npm install
```

### Environment Setup

Create `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lu_cp_archive"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"
```

### Run Locally

```bash
npx prisma migrate dev
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, React Query, Radix UI  
**Backend:** Prisma, PostgreSQL, NextAuth.js  
**Tools:** ESLint, Prettier, Husky

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── dashboard/    # Main features
│   ├── api/          # API routes
│   ├── profile/      # User profiles
│   └── user-guide/   # Documentation
├── components/       # React components
├── lib/             # Configuration (auth, db)
└── utils/           # Helpers & schemas
prisma/             # Database & migrations
```

## Development

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm start           # Run production
npm run lint:fix    # Fix linting issues
npm run prettier    # Format code

# Database
npx prisma studio  # Prisma GUI
npx prisma migrate dev --name description  # Create migration
npx prisma db seed # Seed data
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "feat: description"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript with strict mode
- Format with Prettier (auto on commit)
- Follow ESLint rules (auto on commit)

## Resources

- **User Guide:** Visit `/user-guide` on the site
- **Docs:** [Next.js](https://nextjs.org/docs), [Prisma](https://prisma.io/docs)
- **Community:** [LU-ACM Facebook](https://www.facebook.com/profile.php?id=61572507621970)

## License

Open source - see LICENSE file for details.

## Support

- **GitHub Issues** - Report bugs or request features
- **LU-ACM** - Community support and inquiries
