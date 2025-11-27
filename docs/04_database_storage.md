# Database and Storage Documentation

## AI Photography Coach MVP - Data Management Strategy

This document describes how data and files are stored in the MVP, and the migration path for production.

---

## MVP Approach: No Database

For the initial MVP, we are **intentionally skipping database setup** to reduce complexity and speed up development.

### Why No Database?

1. **Faster Development**: No need to design schemas, run migrations, or manage connections
2. **Lower Complexity**: Fewer moving parts to debug
3. **Cost Savings**: No database hosting costs during development
4. **Sufficient for Testing**: Can validate core features without persistence
5. **Easy Migration**: Can add database later when needed

### What This Means

- No user accounts or authentication
- No conversation history persistence
- Server restart clears all data
- Perfect for testing and iteration

---

## Current Storage Architecture

### File Storage: Local Filesystem

#### Uploaded Images

**Location**: `backend/uploads/`
**Storage Method**: Local disk storage via `multer`
**Lifetime**: Temporary (can be cleaned up after processing)

```
backend/
└── uploads/
    ├── 1638123456789-photo1.jpg
    ├── 1638123457890-photo2.jpg
    └── 1638123458901-photo3.jpg
```

#### Image Storage Configuration

```typescript
// backend/src/index.ts or separate config

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save to uploads folder
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});
```

#### File Cleanup Strategy

Since files are stored locally, you should periodically clean up old uploads:

**Option 1: Manual Cleanup**
```bash
# Delete files older than 1 day
find ./uploads -type f -mtime +1 -delete
```

**Option 2: Automatic Cleanup (Optional)**
```typescript
import fs from 'fs/promises';
import path from 'path';

async function cleanupOldFiles() {
  const uploadsDir = path.join(__dirname, '../uploads');
  const files = await fs.readdir(uploadsDir);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stats = await fs.stat(filePath);
    const age = now - stats.mtime.getTime();

    if (age > maxAge) {
      await fs.unlink(filePath);
      console.log(`Deleted old file: ${file}`);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);
```

---

### In-Memory Data Storage (Optional)

For temporary data like recent requests, you can use JavaScript objects:

```typescript
// backend/src/index.ts

// Store recent analyses in memory
interface AnalysisRecord {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

const recentAnalyses: AnalysisRecord[] = [];

// Add analysis to memory
function saveAnalysis(prompt: string, response: string) {
  recentAnalyses.push({
    id: Date.now().toString(),
    prompt,
    response,
    timestamp: new Date()
  });

  // Keep only last 50 records
  if (recentAnalyses.length > 50) {
    recentAnalyses.shift();
  }
}

// Get recent analyses
function getRecentAnalyses() {
  return recentAnalyses;
}
```

#### Limitations of In-Memory Storage

- ❌ Data lost on server restart
- ❌ Not suitable for production
- ❌ Can't share data across multiple servers
- ✅ Great for MVP testing
- ✅ No setup required
- ✅ Fast access

---

## Data That Doesn't Need Storage (MVP)

For the MVP, these features work without data persistence:

1. **Image Analysis**: Upload → Process → Return → Delete
2. **Camera Settings**: Calculate on demand based on input
3. **Caption Generation**: Generate fresh each time
4. **Shot Suggestions**: Based on current context only

---

## Future Database Strategy

When the app grows beyond MVP, here's the recommended database approach:

### Recommended Database: PostgreSQL

**Why PostgreSQL?**

1. **Robust**: Industry-standard relational database
2. **JSON Support**: Store flexible data alongside structured data
3. **Scalable**: Handles millions of records
4. **Rich Ecosystem**: Great tools, ORMs, hosting options
5. **Free Tier Available**: Many platforms offer free PostgreSQL

### Schema Design (Future)

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Conversations Table

```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Messages Table

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  metadata JSONB, -- Store additional data like camera settings, etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Images Table

```sql
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  original_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  mime_type VARCHAR(50),
  metadata JSONB, -- EXIF data, analysis results, etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Generated Content Table

```sql
CREATE TABLE generated_content (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  content_type VARCHAR(50), -- 'caption', 'hashtags', 'settings', etc.
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### ORM: Prisma (Recommended)

**Why Prisma?**

- Type-safe database client for TypeScript
- Auto-generated types from schema
- Great developer experience
- Built-in migrations

**Example Prisma Schema**:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              Int              @id @default(autoincrement())
  email           String           @unique
  passwordHash    String           @map("password_hash")
  name            String?
  subscriptionTier String?         @default("free") @map("subscription_tier")
  conversations   Conversation[]
  images          Image[]
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  @@map("users")
}

model Conversation {
  id        Int       @id @default(autoincrement())
  userId    Int       @map("user_id")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  messages  Message[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("conversations")
}

model Message {
  id             Int          @id @default(autoincrement())
  conversationId Int          @map("conversation_id")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // 'user' or 'assistant'
  content        String
  imageUrl       String?      @map("image_url")
  metadata       Json?
  createdAt      DateTime     @default(now()) @map("created_at")

  @@map("messages")
}

model Image {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  originalUrl  String   @map("original_url")
  thumbnailUrl String?  @map("thumbnail_url")
  fileSize     Int?     @map("file_size")
  width        Int?
  height       Int?
  mimeType     String?  @map("mime_type")
  metadata     Json?
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("images")
}
```

---

## Cloud Storage Strategy (Future)

### When to Move to Cloud Storage

Move from local filesystem to cloud storage when:

1. **Multiple Servers**: Need shared storage across instances
2. **Scalability**: Local disk space becomes insufficient
3. **Reliability**: Need backups and redundancy
4. **CDN**: Want fast global image delivery
5. **Mobile Upload**: Want direct mobile-to-cloud uploads

### Recommended: AWS S3 or Cloudflare R2

#### AWS S3

**Pros**:
- Industry standard
- Integrates with CloudFront CDN
- Excellent performance
- Rich feature set

**Cons**:
- More expensive
- Complex pricing

**Cost**: ~$0.023/GB/month + transfer fees

#### Cloudflare R2

**Pros**:
- Zero egress fees
- S3-compatible API
- Cheaper than S3
- Built-in CDN

**Cons**:
- Newer service
- Smaller ecosystem

**Cost**: ~$0.015/GB/month, no egress fees

#### S3 Integration Example

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function uploadToS3(filePath: string, filename: string) {
  const fileContent = await fs.readFile(filePath);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${filename}`,
    Body: fileContent,
    ContentType: 'image/jpeg',
    ACL: 'public-read' // Or 'private' with signed URLs
  });

  await s3Client.send(command);

  const url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/uploads/${filename}`;
  return url;
}
```

---

## Data Management Best Practices

### MVP (Current)

1. **File Naming**: Use timestamps for unique names
2. **Validation**: Check file types and sizes before saving
3. **Cleanup**: Periodically delete old files
4. **Error Handling**: Gracefully handle storage failures
5. **Monitoring**: Log storage usage

### Production (Future)

1. **Backups**: Regular automated backups
2. **Versioning**: Keep multiple versions of important data
3. **Encryption**: Encrypt sensitive data at rest
4. **Access Control**: Implement proper permissions
5. **Monitoring**: Track storage usage, costs, errors
6. **Caching**: Cache frequently accessed data
7. **Archival**: Move old data to cheaper storage

---

## Storage Costs Comparison

### MVP (Local)

| Item | Cost |
|------|------|
| File Storage | $0 (local disk) |
| Database | $0 (none) |
| **Total** | **$0/month** |

### Production (Small Scale)

| Item | Service | Cost |
|------|---------|------|
| Database | Railway PostgreSQL | $10/month |
| File Storage | Cloudflare R2 (10GB) | $0.15/month |
| CDN | Cloudflare (included) | $0 |
| Backups | Automated backups | $5/month |
| **Total** | | **~$15/month** |

### Production (Medium Scale)

| Item | Service | Cost |
|------|---------|------|
| Database | Railway PostgreSQL | $50/month |
| File Storage | S3 (100GB) | $2.30/month |
| CDN | CloudFront | $10/month |
| Backups | S3 Glacier | $10/month |
| **Total** | | **~$72/month** |

---

## Migration Checklist

### From Local to Cloud (When Ready)

- [ ] Choose database provider (Railway, Render, AWS)
- [ ] Design database schema
- [ ] Set up Prisma ORM
- [ ] Run initial migrations
- [ ] Choose cloud storage (S3, R2, Supabase)
- [ ] Update file upload code
- [ ] Migrate existing files to cloud
- [ ] Update API to use database
- [ ] Add authentication
- [ ] Implement data backup strategy
- [ ] Set up monitoring
- [ ] Test thoroughly
- [ ] Deploy

---

## Security Considerations

### Current MVP

- ✅ File type validation
- ✅ File size limits
- ✅ Temporary storage
- ❌ No access control
- ❌ No encryption

### Future Production

- ✅ User authentication
- ✅ File encryption at rest
- ✅ Access control lists
- ✅ Signed URLs for private files
- ✅ Audit logging
- ✅ Regular security audits

---

## Recommended Hosting Platforms

### Database Hosting

1. **Railway** - Simple, auto-scaling PostgreSQL
2. **Render** - Generous free tier
3. **Supabase** - PostgreSQL + Storage + Auth
4. **AWS RDS** - Enterprise-grade, scalable
5. **Neon** - Serverless PostgreSQL

### File Storage

1. **Cloudflare R2** - Cheap, no egress fees
2. **AWS S3** - Industry standard
3. **Supabase Storage** - Integrated with Supabase
4. **Backblaze B2** - Affordable alternative

---

## Data Retention Policy (Future)

### User Data

- Keep active users' data indefinitely
- Delete inactive accounts after 1 year warning
- Allow users to export their data
- Allow users to delete their data

### Uploaded Images

- Keep for 30 days if associated with analysis
- Delete temporary uploads after 24 hours
- Archive old images to cheaper storage

### AI Responses

- Keep for conversation history
- Allow users to delete individual messages
- Anonymize data for analytics

---

**Last Updated**: November 2025
**Document Owner**: Development Team
