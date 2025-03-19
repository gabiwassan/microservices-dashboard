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
- **UI Components**: Custom components with dark mode support

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm or yarn
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

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 and enjoy your new mission control center! 🎉

## 🗂 Project Structure
```
/app
  /components     # Reusable UI components
  /routes         # Route components and data loaders
  /utils         # Utility functions and types
```

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