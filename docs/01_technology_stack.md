# Technology Stack Documentation

## AI Photography Coach MVP - Technology Choices

This document outlines the complete technology stack for the AI Photography Coach MVP application.

---

## Overview

The application is built as a **mobile-first** solution with a simple backend API. The architecture is designed for local development and testing, with easy migration to cloud infrastructure later.

---

## Frontend Technology

### React Native (via Expo)

**Version**: Latest stable Expo SDK
**Language**: TypeScript
**Platform**: iOS & Android (Cross-platform)

#### Why Expo?

1. **Instant Testing**: Scan QR code to run app on your phone immediately
2. **Fast Development**: Hot reload, easy debugging, excellent developer experience
3. **Cross-platform**: Single codebase works on both iOS and Android
4. **No Build Required**: Test without compiling or deploying
5. **TypeScript Support**: Built-in TypeScript configuration
6. **Rich Ecosystem**: Access to native device features (camera, photo library)

#### Expo Features Used

- **Expo Go App**: For testing on physical device
- **Expo Dev Client**: Development environment
- **Metro Bundler**: JavaScript bundling for React Native
- **Over-the-Air Updates**: Easy app updates without app store submission (future)

---

## Backend Technology

### Node.js + Express.js

**Version**: Node.js 18+ LTS
**Framework**: Express.js 4.x
**Language**: TypeScript

#### Why Express.js?

1. **Lightweight**: Minimal overhead, fast startup
2. **Simple**: Easy to understand and maintain
3. **Flexible**: Add features as needed without complex boilerplate
4. **TypeScript Compatible**: Full type safety across the stack
5. **Large Community**: Extensive documentation and packages available

#### Express.js vs Alternatives

| Feature | Express | NestJS | Fastify |
|---------|---------|--------|---------|
| **Learning Curve** | Easy | Moderate | Easy |
| **Setup Time** | 5 mins | 30 mins | 10 mins |
| **Flexibility** | High | Structured | High |
| **Best For** | MVP/Prototyping | Enterprise | High Performance |
| **Our Choice** | ✅ Perfect for MVP | Later if scaling | Not needed now |

---

## AI/ML Technology

### Anthropic Claude API

**Model**: Claude 3.5 Sonnet
**SDK**: @anthropic-ai/sdk (Official JavaScript SDK)
**API Version**: 2023-06-01

#### Why Claude?

1. **Vision Capabilities**: Analyze photos and provide detailed feedback
2. **Long Context**: Understand complex photography scenarios
3. **High Quality**: Best-in-class text generation for captions, tips
4. **Reliable**: Consistent, accurate responses
5. **Cost Effective**: Pay-per-use pricing, no minimums

#### Claude Models Used

| Model | Use Case | Speed | Cost | Quality |
|-------|----------|-------|------|---------|
| **Claude 3.5 Sonnet** | Image analysis, Setup analyzer | Fast | $$ | Excellent |
| **Claude 3.5 Sonnet** | Camera settings, Shot suggestions | Fast | $$ | Excellent |
| **Claude 3.5 Haiku** | Captions, Hashtags (future) | Very Fast | $ | Good |

---

## Development Environment

### Required Software

1. **Node.js**: v18.x or higher (LTS recommended)
2. **npm**: v9.x or higher (comes with Node.js)
3. **Expo CLI**: Installed globally via `npm install -g expo-cli`
4. **Code Editor**: VS Code recommended
5. **Expo Go App**: On your mobile device (iOS/Android)

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript and JavaScript Language Features**
- **Prettier - Code formatter**
- **ESLint**
- **React Native Tools**
- **dotenv**

---

## Runtime Environment

### Backend Runtime

- **Node.js**: JavaScript runtime
- **ts-node**: TypeScript execution for Node.js
- **nodemon**: Auto-restart server on code changes (development)

### Mobile Runtime

- **Expo Go**: For running the app during development
- **Metro Bundler**: JavaScript bundler (built into Expo)
- **Hermes**: Optional JavaScript engine for performance (future)

---

## Programming Languages

### TypeScript

**Version**: 5.x
**Configuration**: Strict mode enabled

#### TypeScript Benefits

1. **Type Safety**: Catch errors before runtime
2. **Better IDE Support**: Autocomplete, refactoring
3. **Self-Documenting**: Types serve as inline documentation
4. **Easier Refactoring**: Rename, restructure with confidence
5. **Shared Types**: Use same types in frontend and backend

#### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Version Control

### Git

**Platform**: GitHub (or GitLab, Bitbucket)
**Branching Strategy**: Simple main branch for MVP
**Commit Convention**: Conventional Commits (future)

---

## Testing Tools (Future)

While not implemented in MVP, here's the planned testing stack:

- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing
- **Supertest**: API endpoint testing
- **Detox**: End-to-end mobile testing (future)

---

## Development Tools

### Package Managers

- **npm**: Primary package manager
- **Alternative**: yarn (if preferred)

### Development Servers

- **Expo Development Server**: For mobile app
- **Express Server**: For backend API
- **Both run on localhost** during development

### Debugging Tools

- **React Native Debugger**: Desktop app for debugging
- **Expo DevTools**: Browser-based debugging
- **Chrome DevTools**: For JavaScript debugging
- **Postman**: API endpoint testing

---

## Production Considerations (Future)

When ready to deploy:

### Hosting Options

- **Backend**: Railway, Render, AWS, Heroku
- **Database**: PostgreSQL on Railway/Render
- **File Storage**: AWS S3, Cloudflare R2, Supabase Storage
- **Mobile**: App Store (iOS), Google Play (Android)

### Infrastructure Tools

- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: Mixpanel, PostHog
- **Logging**: Winston, Pino

---

## Technology Decision Summary

| Component | Technology | Why? |
|-----------|-----------|------|
| **Mobile Framework** | Expo (React Native) | Fastest development, cross-platform |
| **Mobile Language** | TypeScript | Type safety, better DX |
| **Backend Framework** | Express.js | Simple, lightweight, perfect for MVP |
| **Backend Language** | Node.js + TypeScript | JavaScript everywhere, type safety |
| **AI Provider** | Anthropic Claude | Best vision AI, high quality output |
| **Database** | None (in-memory) | Simplify MVP, add later |
| **File Storage** | Local filesystem | No cloud costs during development |
| **Authentication** | None | Add later when needed |
| **State Management** | React useState | Built-in, no extra library needed |

---

## Migration Path

As the app grows, here's how the stack will evolve:

1. **Add Database**: Start with SQLite, migrate to PostgreSQL
2. **Add Auth**: Implement JWT authentication
3. **Cloud Storage**: Move to AWS S3 for images
4. **Deploy Backend**: Move to Railway or Render
5. **Caching**: Add Redis for performance
6. **Advanced State**: Add Zustand or Redux if needed
7. **Build Mobile**: Create standalone apps for app stores

---

## References

- [Expo Documentation](https://docs.expo.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Native Documentation](https://reactnative.dev/)

---

**Last Updated**: November 2025
**Document Owner**: Development Team
