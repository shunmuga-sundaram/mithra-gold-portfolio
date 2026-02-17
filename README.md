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

Create a `.env` file in the `backend` directory:

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

# Email Configuration (Optional - for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
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

Create a `.env` file in the `portfolio-tracker-admin` directory:

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

Create a `.env` file in the `portfolio-tracker-member` directory:

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

## 🔑 Default Login Credentials

### Admin Portal (`http://localhost:5173`)
You need to create an admin account first. You can do this via MongoDB or create a seed script.

**Example Admin Document:**
```javascript
{
  name: "Admin User",
  email: "admin@mithra.com",
  password: "Admin@123", // Will be hashed
  isActive: true,
  role: "admin"
}
```

### Member Portal (`http://localhost:5174`)
Members are created by admins through the admin portal.

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

POST /auth/member/login      - Member login
POST /auth/member/refresh    - Refresh access token
GET  /auth/member/me         - Get member profile
POST /auth/member/logout     - Member logout
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
