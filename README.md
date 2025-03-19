# 🎮 Microservices Dashboard - Your Mission Control Center

> "In the beginning there was chaos... and way too many terminal windows" - A Developer's Tale

## 🌟 Features
- 🚀 Start/stop services with a single click
- 👥 Group services for bulk operations
- 🌓 Dark/Light mode for all-day coding sessions
- 🎯 Real-time service status monitoring
- 🎨 Beautiful, modern UI with confetti celebrations! 

## 🛠 Tech Stack
- **Framework**: [React](https://react.dev/) + [Remix.run](https://remix.run/) (v7)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Architecture**: Epic Stack by Kent C. Dodds
- **State Management**: React Router Data Loaders
- **Database**: SQLite with Prisma ORM
- **UI Components**: Custom components with dark mode support

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm or yarn
- SQLite (included in most systems)
- A desire for organized microservices

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/microservices-dashboard.git
cd microservices-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:setup
```
This will:
- Create the SQLite database
- Run migrations
- Migrate existing data from services.json (if it exists)
- Create a backup of services.json

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 and enjoy your new mission control center! 🎉

## 🗂 Project Structure
```
/app
  /components     # Reusable UI components
  /routes         # Route components and data loaders
  /utils         # Utility functions and types
/prisma
  schema.prisma  # Database schema
  seed.ts        # Database seeding script
```

## 🔧 Database Schema

### Service Model
```prisma
model Service {
  id          String   @id @default(uuid())
  name        String
  description String?
  port        Int
  path        String
  status      String   @default("stopped")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  groups      Group[]  @relation("GroupToService")
}
```

### Group Model
```prisma
model Group {
  id          String    @id @default(uuid())
  name        String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  services    Service[] @relation("GroupToService")
}
```

## 📝 Database Management

### Available Scripts
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with initial data
- `npm run db:setup` - Complete database setup (migrate + seed)

## 🔧 Configuration
Services are configured in `services.json` at the root of the project:
```json
{
  "services": [],
  "groups": []
}
```

## 🎯 Key Features Explained

### Service Management
- Add new services with name, port, and path
- Start/stop individual services
- Real-time status monitoring

### Service Groups
- Create groups for related services
- Bulk start/stop operations
- Easy service assignment and removal

### Dark Mode
- Automatic system preference detection
- Manual toggle option
- Consistent styling across all components

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
MIT - Feel free to use this to manage your own microservices chaos!

---
*Made with ❤️ by developers who got tired of having 42 terminal windows open*

P.S.: The confetti is not just for show, it's for celebrating your microservices victories! 🎉 