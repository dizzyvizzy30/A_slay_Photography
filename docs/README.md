# AI Photography Coach - Documentation Index

Welcome to the AI Photography Coach MVP documentation! This guide will help you navigate through all the technical documentation for building the application.

---

## Quick Start

**New to the project?** Start here:

1. Read **[Setup Guide](07_setup_guide.md)** - Get the app running on your phone in 1-2 hours
2. Review **[Features](06_features_functionality.md)** - Understand what the app does
3. Check **[Technology Stack](01_technology_stack.md)** - Learn about the tools we use

---

## Documentation Overview

### 📘 [01. Technology Stack](01_technology_stack.md)
**What you'll learn**: Complete overview of all technologies, frameworks, and tools used in the project.

**Key Topics**:
- Frontend: React Native + Expo
- Backend: Express.js + Node.js + TypeScript
- AI: Anthropic Claude API
- Development tools and environment setup
- Future production considerations

**Read this if**: You want to understand the technical decisions and why specific technologies were chosen.

---

### 📦 [02. Libraries and Dependencies](02_libraries_and_dependencies.md)
**What you'll learn**: Detailed documentation of every package, library, and dependency used.

**Key Topics**:
- Backend dependencies (Express, Multer, Claude SDK, etc.)
- Mobile app dependencies (Expo, Axios, Image Picker, etc.)
- Complete package.json files
- Installation commands
- Usage examples for each library

**Read this if**: You need to understand what each package does or troubleshoot dependency issues.

---

### 🏗️ [03. Application Architecture](03_application_architecture.md)
**What you'll learn**: How the application is structured and how components interact.

**Key Topics**:
- High-level architecture diagrams
- Request/response flow
- Complete file structure
- Backend layer breakdown
- Mobile app component hierarchy
- Network configuration for local development

**Read this if**: You want to understand how data flows through the system or plan to extend the architecture.

---

### 💾 [04. Database and Storage](04_database_storage.md)
**What you'll learn**: Data storage strategy for MVP and future production.

**Key Topics**:
- Why MVP has no database
- Local file storage setup
- In-memory data storage (optional)
- Future database schema design (PostgreSQL + Prisma)
- Cloud storage migration path (AWS S3, Cloudflare R2)
- Cost comparisons

**Read this if**: You're wondering where data is stored or planning to add a database.

---

### 🎨 [05. UI/UX Design](05_ui_design.md)
**What you'll learn**: Complete user interface design specifications.

**Key Topics**:
- Screen layout and structure
- Component breakdown with code examples
- Color palette and typography
- Complete StyleSheet reference
- User experience flows
- Accessibility considerations
- Responsive design for different phone sizes

**Read this if**: You're building the UI or want to customize the design.

---

### ⚡ [06. Features and Functionality](06_features_functionality.md)
**What you'll learn**: All features (current and future) with detailed specifications.

**Key Topics**:
- MVP Features (Setup Analyzer, Camera Settings, Caption Generator)
- Future features roadmap
- Feature priority matrix
- Prompt engineering guidelines
- Testing plan for each feature

**Read this if**: You want to understand what the app does or plan to add new features.

---

### 🚀 [07. Setup Guide](07_setup_guide.md)
**What you'll learn**: Step-by-step instructions to get the app running.

**Key Topics**:
- Prerequisites and required accounts
- Backend setup (Node.js, Express, TypeScript)
- Complete backend code
- Mobile app setup (Expo)
- Complete mobile app code
- Running on your phone via Expo Go
- Troubleshooting common issues

**Read this if**: This is your FIRST stop - follow this guide to build and run the app!

---

## Reading Order by Goal

### Goal: "I want to build this app from scratch"

1. **[Setup Guide](07_setup_guide.md)** - Follow step-by-step
2. **[Features](06_features_functionality.md)** - Understand what you're building
3. **[UI Design](05_ui_design.md)** - Implement the interface
4. **[Architecture](03_application_architecture.md)** - Understand the structure
5. **[Troubleshooting](#troubleshooting)** - Fix issues as they arise

### Goal: "I want to understand the technology decisions"

1. **[Technology Stack](01_technology_stack.md)** - Why we chose each tool
2. **[Architecture](03_application_architecture.md)** - How it all fits together
3. **[Libraries](02_libraries_and_dependencies.md)** - What each package does
4. **[Database/Storage](04_database_storage.md)** - Data management strategy

### Goal: "I want to add new features"

1. **[Features](06_features_functionality.md)** - See existing features
2. **[Architecture](03_application_architecture.md)** - Understand the structure
3. **[UI Design](05_ui_design.md)** - Match existing design patterns
4. **[Libraries](02_libraries_and_dependencies.md)** - Know available tools

### Goal: "I want to deploy to production"

1. **[Database/Storage](04_database_storage.md)** - Add database and cloud storage
2. **[Technology Stack](01_technology_stack.md)** - Production considerations
3. **[Architecture](03_application_architecture.md)** - Scalability improvements
4. Deploy backend to Railway/Render
5. Build standalone mobile app with EAS

---

## Quick Reference

### Essential Commands

```bash
# Backend
cd backend
npm run dev              # Start development server

# Mobile
cd mobile
npx expo start           # Start Expo server
npx expo start --clear   # Clear cache and start

# Check health
curl http://localhost:3000/api/health

# Get your IP (needed for mobile)
ipconfig getifaddr en0   # Mac
ipconfig                 # Windows
```

### Key Files to Edit

**Backend**:
- `backend/src/index.ts` - Main server
- `backend/src/claude.ts` - AI integration
- `backend/.env` - API keys

**Mobile**:
- `mobile/App.tsx` - Main UI
- `mobile/api.ts` - API client (UPDATE YOUR IP HERE!)

### Important URLs

- Anthropic Console: https://console.anthropic.com/
- Expo Documentation: https://docs.expo.dev/
- Express Documentation: https://expressjs.com/
- Claude API Docs: https://docs.anthropic.com/

---

## Tech Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Mobile Framework** | React Native + Expo | Cross-platform mobile app |
| **Mobile Language** | TypeScript | Type-safe JavaScript |
| **Backend Framework** | Express.js | REST API server |
| **Backend Runtime** | Node.js | JavaScript runtime |
| **AI Provider** | Anthropic Claude 3.5 Sonnet | Image analysis & text generation |
| **Image Upload** | Multer | Handle multipart form data |
| **HTTP Client** | Axios | Mobile → Backend requests |
| **Database** | None (MVP) | Add PostgreSQL later |
| **Storage** | Local filesystem | Add S3/R2 later |

---

## Project Structure

```
ai-photography-coach-mvp/
│
├── docs/                          # 📚 You are here!
│   ├── README.md                  # This file
│   ├── 01_technology_stack.md
│   ├── 02_libraries_and_dependencies.md
│   ├── 03_application_architecture.md
│   ├── 04_database_storage.md
│   ├── 05_ui_design.md
│   ├── 06_features_functionality.md
│   ├── 07_setup_guide.md
│   └── gpt_requirements.md        # Original requirements
│
├── backend/                       # Node.js API (create this)
│   ├── src/
│   ├── uploads/
│   ├── .env
│   └── package.json
│
└── mobile/                        # Expo app (create this)
    ├── App.tsx
    ├── api.ts
    ├── app.json
    └── package.json
```

---

## Development Workflow

### First Time Setup (1-2 hours)

1. Follow **[Setup Guide](07_setup_guide.md)**
2. Get Anthropic API key
3. Set up backend
4. Set up mobile app
5. Test on your phone

### Daily Development

1. **Terminal 1**: `cd backend && npm run dev` (keep running)
2. **Terminal 2**: `cd mobile && npx expo start` (keep running)
3. Make changes to code
4. See updates instantly on phone
5. Iterate and test

### Adding Features

1. Review **[Features](06_features_functionality.md)** documentation
2. Add backend endpoint in `backend/src/index.ts`
3. Add Claude integration in `backend/src/claude.ts`
4. Update mobile UI in `mobile/App.tsx`
5. Update API client in `mobile/api.ts`
6. Test thoroughly

---

## Troubleshooting

### Common Issues

**Can't connect mobile to backend**:
- ✅ Check same WiFi network
- ✅ Update IP address in `mobile/api.ts`
- ✅ Check firewall allows port 3000
- ✅ Restart both backend and Expo

**API key errors**:
- ✅ Verify key in `backend/.env`
- ✅ Check no extra spaces
- ✅ Verify API credits on Anthropic console

**Image upload fails**:
- ✅ Check `backend/uploads/` folder exists
- ✅ Try smaller image
- ✅ Check file type (JPEG/PNG only)

**More troubleshooting**: See [Setup Guide - Troubleshooting Section](07_setup_guide.md#troubleshooting)

---

## Next Steps

### After MVP is Working

1. **Test all features** - Make sure everything works
2. **Refine prompts** - Improve AI response quality
3. **Add more features** - Implement caption generator, etc.
4. **Improve UI** - Polish the design
5. **Add database** - Implement PostgreSQL with Prisma
6. **Deploy backend** - Use Railway or Render
7. **Build standalone app** - Create production APK/IPA

---

## Getting Help

### Resources

- **Expo**: https://docs.expo.dev/
- **Express**: https://expressjs.com/
- **Anthropic Claude**: https://docs.anthropic.com/
- **TypeScript**: https://www.typescriptlang.org/docs/

### Debugging Tips

1. Read error messages carefully
2. Check both terminal outputs (backend + mobile)
3. Use `console.log()` liberally
4. Test backend independently with curl/Postman
5. Use Expo's debugging tools (shake phone → Debug)

---

## Contributing

When adding to this documentation:

1. Keep the same format and style
2. Include code examples
3. Add to this README index
4. Test all instructions
5. Update "Last Updated" date

---

## Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| 01_technology_stack.md | ✅ Complete | Nov 2025 |
| 02_libraries_and_dependencies.md | ✅ Complete | Nov 2025 |
| 03_application_architecture.md | ✅ Complete | Nov 2025 |
| 04_database_storage.md | ✅ Complete | Nov 2025 |
| 05_ui_design.md | ✅ Complete | Nov 2025 |
| 06_features_functionality.md | ✅ Complete | Nov 2025 |
| 07_setup_guide.md | ✅ Complete | Nov 2025 |

---

**Ready to start building?**

👉 Head to **[Setup Guide](07_setup_guide.md)** and let's build your AI Photography Coach app!

---

**Last Updated**: November 2025
**Maintained By**: Development Team
