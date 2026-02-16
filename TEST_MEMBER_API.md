# Test Member API - Debugging Guide

## Common Issues & Solutions

### Issue: "Required parameters in request body are either missing or invalid"

This error means the validation failed. Here are the common causes:

#### 1. Password Validation (Most Common)

The password MUST meet these requirements:
- ✅ At least 8 characters
- ✅ At least one UPPERCASE letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one digit (0-9)
- ✅ At least one special character from: `@ $ ! % * ? &`

**⚠️ IMPORTANT:** Only these special characters are allowed: `@ $ ! % * ? &`

**Valid password examples:**
```
SecurePass@123   ✅
MyPassword123!   ✅
Strong$Pass1     ✅
Test@1234        ✅
Admin@Pass99     ✅
```

**Invalid password examples:**
```
password         ❌ (no uppercase, no digit, no special char)
Password123      ❌ (no special char)
Password@        ❌ (no digit)
Pass@1           ❌ (too short, less than 8 chars)
Password#123     ❌ (# is not allowed, use @$!%*?& only)
Password_123     ❌ (_ is not allowed)
```

#### 2. Email Format

Must be a valid email:
```
john@example.com     ✅
test@company.co.uk   ✅
invalid-email        ❌
test@                ❌
@example.com         ❌
```

#### 3. Phone Number Format

Must match the pattern:
```
+1234567890          ✅
1234567890           ✅
+91-9876543210       ✅
(123) 456-7890       ✅
+1 234-567-8900      ✅
123                  ❌ (too short)
abc                  ❌ (not numbers)
```

#### 4. Name Length

- Minimum: 2 characters
- Maximum: 100 characters

```
John Doe             ✅
J                    ❌ (too short)
```

## Test via Browser DevTools

### 1. Open Browser Console (F12)

When you try to create a member, check the console for:

```javascript
// You should see:
Creating member with data: {
  name: "...",
  email: "...",
  password: "...",
  phone: "...",
  goldHoldings: 0
}

// Then check the error response:
Error response: {
  statusCode: 400,
  data: {
    validationErrors: [
      ["Password must contain at least one uppercase letter..."],
      ["Please enter a valid phone number"]
    ]
  },
  message: "Required parameters in request body are either missing or invalid"
}
```

### 2. Check Network Tab

1. Go to Network tab
2. Filter by "Fetch/XHR"
3. Look for POST request to `/members`
4. Check "Request Payload" to see what data was sent
5. Check "Response" to see validation errors

## Test via cURL

```bash
# Test with valid data
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass@123",
    "phone": "+1234567890",
    "goldHoldings": 0
  }'

# Should return 201 Created with member data
```

```bash
# Test with invalid password (no special char)
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phone": "+1234567890"
  }'

# Should return 400 with validation error about password
```

## Quick Test Data

### ✅ Valid Test Member
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@1234",
  "phone": "+1234567890",
  "goldHoldings": 0
}
```

### ✅ Another Valid Example
```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "SecurePass@123",
  "phone": "(123) 456-7890",
  "goldHoldings": 50.5
}
```

## Common Fixes

### Fix 1: Update Frontend Form Helper Text

The form already shows:
```
"Must contain: uppercase, lowercase, number, special character (@$!%*?&)"
```

Make sure you're using one of these special characters: `@ $ ! % * ? &`

### Fix 2: Check JWT Token

If you get "Authorization token is required":
1. Make sure you're logged in
2. Check localStorage has `accessToken`
3. Token might be expired (login again)

### Fix 3: Backend Not Running

If you get network error:
```bash
cd /home/shanmugam/Music/mithra/backend
npm run dev
```

Backend should show:
```
Server running on port 3000
MongoDB connected successfully
```

## Validation Rules Summary

| Field | Required | Min Length | Max Length | Pattern |
|-------|----------|------------|------------|---------|
| name | Yes | 2 | 100 | - |
| email | Yes | - | - | Valid email |
| password | Yes | 8 | - | Uppercase + lowercase + digit + special (@$!%*?&) |
| phone | Yes | - | - | Valid phone format |
| goldHoldings | No | - | - | Number >= 0 |

## Test Workflow

1. **Login** at `http://localhost:5173`
   - Email: `admin@mithra.com`
   - Password: `Admin@123`

2. **Go to Members page**

3. **Click "Add Member"**

4. **Fill form with valid data:**
   - Name: `Test User`
   - Email: `test123@example.com` (use unique email)
   - Password: `Test@1234` (contains: uppercase T, lowercase, digit, special @)
   - Phone: `+1234567890`
   - Gold Holdings: `0` (optional)

5. **Check Console (F12)** for any errors

6. **If error:**
   - Read the error message carefully
   - Check password meets ALL requirements
   - Check email is unique (not already used)
   - Check phone number format

## Backend Logs

Check backend terminal for logs:

```bash
# You should see logs like:
POST /members 201 - - 234 ms  # Success
POST /members 400 - - 45 ms   # Validation error
POST /members 409 - - 67 ms   # Duplicate email
```

## Still Having Issues?

1. Check both terminals (backend + frontend) are running
2. Check `.env` file has correct `VITE_API_BASE_URL`
3. Clear browser cache and localStorage
4. Try a different email address
5. Copy-paste a working password: `Test@1234`
6. Check browser console for detailed error
7. Check network tab for request/response details
