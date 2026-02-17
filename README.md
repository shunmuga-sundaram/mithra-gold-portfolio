# Mithra Gold Portfolio Tracker

A comprehensive gold portfolio management system with separate admin and member portals for tracking gold purchases, sales, and holdings.

## 🌟 Features

### Admin Portal
- **Dashboard**: Real-time statistics including total members, gold holdings, and pending sell requests
- **Member Management**: Create, view, and manage member accounts
- **Gold Rate Management**: Set and update buy/sell rates for gold
- **Trade Management**: Create buy trades, approve/reject sell requests
- **Recent Activity**: Track all recent transactions

### Member Portal
- **Dashboard**: View personal gold holdings, current rates, and portfolio value
- **Transaction History**: View all buy and sell transactions
- **Sell Trades**: Create sell requests for approval

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer
- **Architecture**: Repository-Service-Controller pattern

### Frontend
- **Admin Portal**: React + TypeScript + Vite
- **Member Portal**: React + TypeScript + Vite
- **State Management**: Redux Toolkit (Admin), React Context (Member)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast notifications)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: v6 or higher (running locally or remote connection)
- **Git**: For cloning the repository

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mithra
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file in the `backend` directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mithra-gold-tracker

# JWT Configuration
JWT_ACCESS_SECRET=your-access-token-secret-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here
JWT_ACCESS_EXPIRES_IN=30d
JWT_REFRESH_EXPIRES_IN=90d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Email Configuration (Required for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM_NAME=Mithra Portfolio Tracker
EMAIL_FROM_EMAIL=noreply@mithra.com
APP_URL=http://localhost:5174
```

#### Start Backend Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The backend will be running at `http://localhost:3000`

### 3. Admin Portal Setup

#### Install Dependencies

```bash
cd portfolio-tracker-admin
npm install
```

#### Environment Configuration

Create a `.env` file in the `portfolio-tracker-admin` directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_API_BASE_URL=http://localhost:3000
```

#### Start Admin Portal

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm run preview
```

The admin portal will be running at `http://localhost:5173`

### 4. Member Portal Setup

#### Install Dependencies

```bash
cd portfolio-tracker-member
npm install
```

#### Environment Configuration

Create a `.env` file in the `portfolio-tracker-member` directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
VITE_API_BASE_URL=http://localhost:3000
```

#### Start Member Portal

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm run preview
```

The member portal will be running at `http://localhost:5174`

## 🗂️ Project Structure

```
mithra/
├── backend/                    # Express.js backend server
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/   # HTTP request handlers
│   │   │   ├── services/      # Business logic layer
│   │   │   ├── models/        # MongoDB models & repositories
│   │   │   ├── routes/        # API route definitions
│   │   │   ├── middlewares/   # Express middlewares
│   │   │   ├── dtos/          # Data Transfer Objects
│   │   │   └── error/         # Custom error classes
│   │   └── index.ts
│   └── package.json
│
├── portfolio-tracker-admin/   # Admin portal (React + Vite)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Reusable React components
│   │   │   └── pages/         # Page components
│   │   ├── services/          # API service layer
│   │   ├── store/             # Redux store & slices
│   │   └── main.tsx
│   └── package.json
│
└── portfolio-tracker-member/  # Member portal (React + Vite)
    ├── src/
    │   ├── app/
    │   │   ├── components/    # Reusable React components
    │   │   └── pages/         # Page components
    │   ├── services/          # API service layer
    │   └── main.tsx
    └── package.json
```

## 🔑 Creating Admin Users

Before you can use the admin portal, you need to create at least one admin user. There are two methods:

### Method 1: Interactive Script (Recommended for Development)

Run the interactive admin creation script:

```bash
cd backend
npm run create-admin
```

You'll be prompted to enter:
- Admin name
- Admin email
- Admin password (min 8 chars with uppercase, lowercase, number, special char)
- Confirm password
- Role (admin or super_admin)

**Example:**
```
Enter admin name: John Doe
Enter admin email: admin@mithra.com
Enter admin password: Admin@123
Confirm password: Admin@123
Enter role (admin/super_admin) [default: admin]: admin
```

### Method 2: Environment Variables (Recommended for Production/CI-CD)

For automated deployments or production setup, use environment variables:

**Option A: Command line**
```bash
cd backend
ADMIN_NAME="John Doe" \
ADMIN_EMAIL="admin@mithra.com" \
ADMIN_PASSWORD="Admin@123" \
ADMIN_ROLE="admin" \
npm run create-admin:env
```

**Option B: .env file**

Add these variables to your `backend/.env` file:
```env
ADMIN_NAME=John Doe
ADMIN_EMAIL=admin@mithra.com
ADMIN_PASSWORD=Admin@123
ADMIN_ROLE=admin
```

Then run:
```bash
cd backend
npm run create-admin:env
```

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&#)

**Example valid passwords:**
- `Admin@123`
- `SecurePass!456`
- `MyP@ssw0rd`

### Admin Roles
- **admin**: Standard admin access (can manage members, trades, gold rates)
- **super_admin**: Full admin access (future: can manage other admins)

### Verifying Admin Creation

After creating an admin, you can verify it in MongoDB:
```bash
mongosh
use mithra_portfolio
db.admins.find().pretty()
```

Or login to the admin portal at `http://localhost:5173`

### Member Portal Login
Members are created by admins through the admin portal. Members can then login at `http://localhost:5174`

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access tokens (30 days) and refresh tokens (90 days)
- **Role-based Access Control**: Separate admin and member access
- **Input Validation**: class-validator for request validation
- **CORS Protection**: Configured allowed origins
- **XSS Protection**: Input sanitization

## 📊 Database Schema

### Collections

1. **admins**: Admin user accounts
2. **members**: Member user accounts with gold holdings
3. **goldrates**: Historical gold buy/sell rates
4. **trades**: Buy and sell transactions

### Key Relationships

- Trades → Members (memberId)
- Trades → GoldRates (goldRateId)
- Trades → Admins (initiatedBy, approvedBy)

## 🔄 Business Logic

### Trade Flow

1. **Buy Trade**:
   - Admin creates buy trade for a member
   - Status: COMPLETED immediately
   - Member's gold holdings increased
   - Total amount calculated: quantity × buy rate

2. **Sell Trade**:
   - Member creates sell request
   - Status: PENDING (awaits admin approval)
   - Admin approves → Status: COMPLETED
   - Member's gold holdings decreased
   - Total amount calculated: quantity × sell rate

### Gold Holdings Management

- Automatically updated on trade completion
- BUY trade: holdings += quantity
- SELL trade (completed): holdings -= quantity
- Cannot sell more than current holdings

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Admin portal tests
cd portfolio-tracker-admin
npm test

# Member portal tests
cd portfolio-tracker-member
npm test
```

## 📝 API Documentation

### Authentication Endpoints

```
POST /auth/admin/login       - Admin login
POST /auth/admin/refresh     - Refresh access token
GET  /auth/admin/me          - Get admin profile
POST /auth/admin/logout      - Admin logout

POST /auth/member/login            - Member login
POST /auth/member/refresh          - Refresh access token
GET  /auth/member/me               - Get member profile
POST /auth/member/logout           - Member logout
POST /auth/member/forgot-password  - Request password reset
POST /auth/member/reset-password   - Reset password with token
```

### Admin Endpoints

```
GET    /members              - Get all members (paginated)
POST   /members              - Create new member
GET    /members/:id          - Get member by ID
PATCH  /members/:id          - Update member
DELETE /members/:id          - Delete member

GET    /gold-rates           - Get all rates (paginated)
POST   /gold-rates           - Create new rate
GET    /gold-rates/active    - Get active rate
GET    /gold-rates/statistics - Get rate statistics

GET    /trades               - Get all trades (paginated)
POST   /trades               - Create new trade
GET    /trades/:id           - Get trade by ID
PATCH  /trades/:id/status    - Update trade status
DELETE /trades/:id/cancel    - Cancel trade

GET    /statistics/dashboard - Get dashboard statistics
```

### Member Endpoints

```
GET    /trades/my-trades     - Get member's own trades
POST   /trades/sell          - Create sell request
GET    /gold-rates/active    - Get active gold rate
```

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongod --version`
- Verify `.env` file exists and has correct values
- Ensure port 3000 is not in use: `lsof -i :3000`

### Frontend build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear browser cache

### Authentication issues
- Check if JWT secrets are set in backend `.env`
- Verify CORS_ORIGIN includes frontend URLs
- Clear browser localStorage and cookies

## 🚀 Production Deployment

### Backend Deployment Checklist

1. **Environment Variables**: Set all production environment variables
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mithra
   JWT_ACCESS_SECRET=<strong-random-secret>
   JWT_REFRESH_SECRET=<strong-random-secret>
   CORS_ORIGIN=https://admin.yourdomain.com,https://members.yourdomain.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM_NAME=Mithra Portfolio Tracker
   EMAIL_FROM_EMAIL=noreply@yourdomain.com
   APP_URL=https://members.yourdomain.com
   ```

2. **Build the Backend**:
   ```bash
   cd backend
   npm install --production
   npm run build
   ```

3. **Create Admin User**:
   ```bash
   cd backend
   ADMIN_NAME="Admin Name" \
   ADMIN_EMAIL="admin@yourdomain.com" \
   ADMIN_PASSWORD="SecureP@ss123" \
   ADMIN_ROLE="admin" \
   npm run create-admin:env
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

   Or use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start build/index.js --name mithra-backend
   pm2 save
   pm2 startup
   ```

### Frontend Deployment

1. **Admin Portal**:
   ```bash
   cd portfolio-tracker-admin

   # Set production API URL in .env
   echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env

   # Build
   npm install
   npm run build

   # Deploy the 'dist' folder to your hosting service
   # (Netlify, Vercel, AWS S3, etc.)
   ```

2. **Member Portal**:
   ```bash
   cd portfolio-tracker-member

   # Set production API URL in .env
   echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env

   # Build
   npm install
   npm run build

   # Deploy the 'dist' folder to your hosting service
   ```

### Database Backup (Important!)

Set up regular MongoDB backups:
```bash
# Manual backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/mithra" --out=/path/to/backup

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/mithra" /path/to/backup
```

### Security Recommendations

- ✅ Use strong, random JWT secrets (minimum 64 characters)
- ✅ Enable HTTPS for all services
- ✅ Restrict CORS to your specific domains
- ✅ Use MongoDB user with limited privileges
- ✅ Enable MongoDB authentication
- ✅ Set up firewall rules to restrict database access
- ✅ Regularly update dependencies: `npm audit fix`
- ✅ Use environment variables for all secrets (never commit to git)
- ✅ Set up monitoring and logging (PM2, CloudWatch, etc.)
- ✅ Configure rate limiting for API endpoints

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add some feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@mithra.com or create an issue in the repository.

---

**Built with ❤️ using Node.js, React, and MongoDB**
