# 📋 Mithra Portfolio Tracker - Development Rules & Standards

**Last Updated:** 2026-02-16
**Purpose:** Document coding standards, best practices, and conventions for this project

---

## 🔐 Rule #1: ALWAYS Use Environment Variables

**❌ NEVER hardcode:**
- API URLs
- Database connection strings
- API keys / Secrets
- Port numbers
- Domain names
- Feature flags
- Any configuration that changes between environments

**✅ ALWAYS use .env files:**

### Backend (Node.js/Express):
```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/mithra_portfolio
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
PORT=3000
```

```typescript
// ✅ CORRECT - Use environment variable
const dbUri = process.env.MONGODB_URI;

// ❌ WRONG - Hardcoded
const dbUri = 'mongodb://localhost:27017/mithra_portfolio';
```

### Frontend (Vite/React):
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000
```

```typescript
// ✅ CORRECT - Use environment variable (must prefix with VITE_)
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ WRONG - Hardcoded
const apiUrl = 'http://localhost:3000';
```

**Why:**
- Different environments (dev, staging, production) need different values
- Secrets should never be committed to git
- Easy to change configuration without code changes
- Security best practice

---

## 🔒 Rule #2: Security Best Practices

### Password Security:
- ✅ Always hash passwords with bcrypt (minimum 10 salt rounds)
- ✅ Never store plain text passwords
- ✅ Password requirements: minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
- ❌ Never log passwords (even hashed)
- ❌ Never return passwords in API responses (use toJSON transform)

### JWT Tokens:
- ✅ Store secrets in environment variables
- ✅ Use different secrets for access and refresh tokens
- ✅ Set appropriate expiry times (access: 30 days, refresh: 90 days)
- ✅ Include issuer and audience in tokens
- ❌ Never store sensitive data in JWT payload (it's base64 encoded, not encrypted)

### API Security:
- ✅ Use CORS middleware with whitelist
- ✅ Validate all input with DTOs and class-validator
- ✅ Use authorization middleware for protected routes
- ✅ Handle errors without revealing sensitive information
- ❌ Don't reveal if email exists in login error messages (security)

---

## 🏗️ Rule #3: Architecture & Code Organization

### Backend Structure (MVC + Service + Repository):
```
Controller (HTTP) → Service (Business Logic) → Repository (Data Access) → Database
```

**Separation of Concerns:**
- **Controllers:** Handle HTTP requests/responses only
- **Services:** Business logic, validation, token generation
- **Repositories:** Database operations only
- **DTOs:** Input validation and type safety
- **Middlewares:** Cross-cutting concerns (CORS, validation, auth)

### Frontend Structure:
```
Component → Redux Action → API Service → Backend API
```

**Separation of Concerns:**
- **Components:** UI and user interaction only
- **Redux:** Global state management
- **Services:** API calls centralized
- **Hooks:** Reusable logic

---

## 📝 Rule #4: TypeScript Best Practices

### Always Define Types:
```typescript
// ✅ CORRECT - Interface for type safety
interface LoginCredentials {
  email: string;
  password: string;
}

async function login(credentials: LoginCredentials) { ... }

// ❌ WRONG - No types
async function login(credentials) { ... }
```

### Use Enums for Constants:
```typescript
// ✅ CORRECT
enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// ❌ WRONG - Magic strings
const role = 'super_admin'; // What are the valid values?
```

---

## 🧪 Rule #5: Testing

### Write Tests for:
- ✅ All service methods (business logic)
- ✅ API endpoints (integration tests)
- ✅ Complex utility functions
- ✅ Critical user flows (login, payments, etc.)

### Test Structure:
```typescript
describe('ServiceName', () => {
  describe('methodName()', () => {
    it('should handle success case', () => { ... });
    it('should handle error case', () => { ... });
    it('should validate input', () => { ... });
  });
});
```

### Use Mocks:
- ✅ Mock database calls in unit tests
- ✅ Mock external APIs
- ❌ Don't test implementation details
- ❌ Don't make real database calls in unit tests

---

## 📦 Rule #6: Dependencies & Package Management

### Always Specify Versions:
```json
// ✅ CORRECT - Exact version
"express": "5.2.1"

// ❌ WRONG - Flexible version (can break)
"express": "^5.0.0"
```

### Keep Dependencies Updated:
- Review and update dependencies monthly
- Check for security vulnerabilities with `npm audit`
- Test thoroughly after updates

---

## 📄 Rule #7: Documentation

### Code Comments:
```typescript
// ✅ GOOD - Explains WHY
// Hash password before saving to prevent storing plain text
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ BAD - States the obvious
// Hash the password
const hashedPassword = await bcrypt.hash(password, 10);
```

### Function/Class Documentation:
```typescript
/**
 * Login admin user with email and password
 *
 * @param email - Admin email address
 * @param password - Plain text password (will be compared with hash)
 * @returns LoginResponse with admin data and JWT tokens
 * @throws UnhandledException if credentials invalid or account disabled
 */
async login(email: string, password: string): Promise<LoginResponse>
```

---

## 🗂️ Rule #8: Git & Version Control

### Commit Messages:
```bash
# ✅ GOOD - Clear, descriptive
git commit -m "Add JWT authentication for admin login API"

# ❌ BAD - Vague
git commit -m "Update files"
```

### What NOT to Commit:
- ❌ `.env` files (use `.env.example` instead)
- ❌ `node_modules/`
- ❌ Build artifacts (`dist/`, `build/`)
- ❌ IDE-specific files (`.vscode/`, `.idea/`)
- ❌ Log files
- ❌ Secrets, API keys, credentials

### Branch Strategy:
- `master/main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

---

## 🔄 Rule #9: Error Handling

### Backend:
```typescript
// ✅ CORRECT - Proper error handling
try {
  const admin = await AdminRepository.findByEmail(email);
  if (!admin) {
    throw new UnhandledException('Invalid email or password', 401);
  }
} catch (error) {
  next(error); // Pass to error handler middleware
}

// ❌ WRONG - Silent failure
const admin = await AdminRepository.findByEmail(email);
if (!admin) return;
```

### Frontend:
```typescript
// ✅ CORRECT - Show user-friendly error
try {
  await authService.login(email, password);
} catch (error) {
  toast.error(error.message || 'Login failed. Please try again.');
}

// ❌ WRONG - Generic error
try {
  await authService.login(email, password);
} catch (error) {
  console.log(error); // User sees nothing
}
```

---

## 🎨 Rule #10: Code Style & Formatting

### Naming Conventions:
- **Files:** kebab-case (`admin-auth-service.ts`)
- **Classes:** PascalCase (`AdminAuthService`)
- **Functions/Variables:** camelCase (`findByEmail`, `accessToken`)
- **Constants:** UPPER_SNAKE_CASE (`JWT_CONFIG`, `BASE_URL`)
- **Interfaces:** PascalCase with `I` prefix optional (`IAdmin` or `Admin`)

### File Organization:
```typescript
// Order:
1. Imports
2. Type definitions / Interfaces
3. Constants
4. Class/Function definitions
5. Exports
```

---

## 📊 Rule #11: Database & Schema Design

### MongoDB Best Practices:
- ✅ Use Mongoose schemas for structure
- ✅ Index frequently queried fields
- ✅ Use timestamps (createdAt, updatedAt)
- ✅ Use soft delete (isActive flag) instead of hard delete
- ❌ Don't store large arrays (max ~1000 items)
- ❌ Don't use auto-increment IDs (use ObjectId)

### Schema Validation:
```typescript
// ✅ CORRECT - Schema with validation
const AdminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
});

// ❌ WRONG - No validation
const AdminSchema = new Schema({
  email: String
});
```

---

## 🚀 Rule #12: Performance

### Backend:
- ✅ Use database indexes on frequently queried fields
- ✅ Limit query results (pagination)
- ✅ Cache frequently accessed data (Redis/memory)
- ✅ Use connection pooling for database
- ❌ Don't fetch unnecessary fields (use projection)
- ❌ Don't make N+1 queries (use populate/join)

### Frontend:
- ✅ Lazy load routes and components
- ✅ Debounce search inputs
- ✅ Memoize expensive calculations (useMemo)
- ✅ Virtualize long lists
- ❌ Don't fetch all data at once (use pagination)
- ❌ Don't make API calls in render loops

---

## 📱 Rule #13: User Experience

### Loading States:
```typescript
// ✅ CORRECT - Show loading state
const [loading, setLoading] = useState(false);

async function handleLogin() {
  setLoading(true);
  try {
    await login();
  } finally {
    setLoading(false);
  }
}

// ❌ WRONG - No feedback to user
async function handleLogin() {
  await login(); // User sees nothing happening
}
```

### Error Messages:
- ✅ User-friendly: "Invalid email or password"
- ❌ Technical: "Error: Cannot read property 'id' of null"

### Success Feedback:
- ✅ Show toast/notification on success
- ✅ Redirect to appropriate page
- ✅ Update UI immediately (optimistic updates)

---

## 🔍 Rule #14: Code Reviews

### Before Submitting:
- ✅ Run all tests (`npm test`)
- ✅ Build successfully (`npm run build`)
- ✅ No console.log() in production code
- ✅ No commented-out code
- ✅ Follow naming conventions
- ✅ Add/update documentation

### Review Checklist:
- Security: No hardcoded secrets, proper validation
- Performance: No unnecessary loops, efficient queries
- Readability: Clear variable names, proper comments
- Testing: New code has tests
- Error Handling: All errors caught and handled

---

## 📖 Rule #15: Learning & Growth

### When Adding New Code:
1. **Understand before implementing** - Don't copy-paste without understanding
2. **Ask questions** - Better to clarify than assume
3. **Document learnings** - Add comments explaining complex logic
4. **Share knowledge** - Help teammates understand your code

### Code Quality > Speed:
- ✅ Write maintainable code that others can understand
- ✅ Follow established patterns in the codebase
- ✅ Refactor when needed
- ❌ Don't rush and create technical debt

---

## 🎯 Summary - Top 5 Must-Follow Rules

1. **ALWAYS use environment variables** - Never hardcode configuration
2. **Security first** - Hash passwords, validate input, protect routes
3. **Separation of concerns** - Controller → Service → Repository
4. **Write tests** - Test business logic and critical flows
5. **Document your code** - Future you will thank you

---

**Remember:** These rules exist to make development easier, code more maintainable, and the application more secure. Follow them consistently! 🚀
