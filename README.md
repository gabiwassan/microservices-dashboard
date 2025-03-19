# Microservices Dashboard

A modern dashboard to manage and monitor your microservices.

## Features

- 🚀 Start/Stop services with a single click
- 📊 Real-time status monitoring
- 🔍 Live service logs
- 👥 Group services for batch operations
- 🌙 Dark mode support
- 🎯 Port management and conflict resolution
- 📝 Service descriptions and metadata

## Requirements

- Node.js >= 20.0.0
- SQLite (included via Prisma)
- npm (for dashboard)
- yarn (for services)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/microservices-dashboard.git
cd microservices-dashboard
```

2. Install dashboard dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

## Database Schema

The application uses Prisma with SQLite. The schema includes:

- Services: Stores microservice configurations and status
- Groups: Manages service groupings for batch operations

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./data.db?connection_limit=1"
```

## Managing Services

### Adding Services

Through the UI, you can add services with:

- Name
- Port number
- Service path (where the service is located)
- Description (optional)

### Service Requirements

Each service should:

- Have a `package.json` with a `start` script
- Use `yarn` as its package manager
- Be accessible via `yarn start`

### Service Groups

Create groups to manage multiple services simultaneously:

- Start/stop entire groups
- Add/remove services from groups
- Name and organize groups

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
