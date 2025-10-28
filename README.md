# 🎫 Mythra - Web3 Event Ticketing Platform

A decentralized event ticketing platform built with Next.js, Solana, and Supabase, featuring **Web3 wallet authentication**, multi-role dashboards, and blockchain integration.

---

## 🚀 **Features**

### **🔐 Web3 Authentication**
- Solana wallet authentication (Phantom, OKX, Solflare, Backpack)
- Cryptographic signature verification (Ed25519)
- Email-wallet linking (1:1 mapping)
- Rate limiting & replay attack prevention
- Multi-role support with dynamic role switching

### **🎭 Multi-Role System**
- **Event Organizers** - Create and manage events
- **Investors** - Fund campaigns and earn rewards  
- **Buyers/Customers** - Purchase and manage tickets
- **Staff** - Check-in attendees
- **Admins** - Platform administration

### **🔒 Security**
- Signature verification with timestamp validation
- Rate limiting (5 attempts / 15 min)
- Failed attempt penalties
- Input validation & sanitization
- Replay attack prevention with nonces

---

## 📦 **Tech Stack**

- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS
- **Web3:** Solana Web3.js, Wallet Adapter, TweetNaCl
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **UI:** shadcn/ui, Framer Motion, Lucide Icons

---

## 🛠️ **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm/yarn/pnpm/bun
- Supabase account
- Solana wallet (Phantom recommended)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/mythra-fe.git
cd mythra-fe
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Setup environment variables**
Create a `.env.local` file:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
# For mainnet: https://api.mainnet-beta.solana.com

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Setup Supabase Database**

Run the SQL migrations in your Supabase SQL Editor:
```sql
-- Create tables: users, roles, user_roles
-- See supabase/migrations for full schema
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**
```
http://localhost:3000
```

---

## 🔐 **Wallet Authentication Setup**

### **For Users**
See [WALLET_AUTH_GUIDE.md](./WALLET_AUTH_GUIDE.md) for detailed user instructions.

**Quick Start:**
1. Install Phantom wallet
2. Go to `/login`
3. Click "Connect Wallet"
4. Sign the message (free, no gas fees!)
5. Complete registration with email & role

### **For Developers**

**Authentication Flow:**
```typescript
1. User clicks "Connect Wallet"
2. Wallet adapter connects to Solana wallet
3. Backend generates unique nonce → GET /api/auth/wallet/nonce
4. User signs message (wallet + nonce + timestamp)
5. Frontend sends signature → POST /api/auth/wallet/verify
6. Backend verifies signature cryptographically
7. Session created, user redirected to dashboard
```

**Key Files:**
- `app/login/page.tsx` - Login page with wallet connection
- `components/auth/WalletAuth.tsx` - Wallet auth component
- `components/auth/EmailModal.tsx` - Registration modal
- `lib/auth/message-signing.ts` - Signature utilities
- `app/api/auth/wallet/*` - Auth API routes

---

## 📚 **Documentation**

- **[WALLET_AUTH_GUIDE.md](./WALLET_AUTH_GUIDE.md)** - User guide for wallet auth
- **[WEB3_AUTH_IMPLEMENTATION.md](./WEB3_AUTH_IMPLEMENTATION.md)** - Full implementation details
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing guide
- **[PHASE_8_9_SUMMARY.md](./PHASE_8_9_SUMMARY.md)** - Security & testing summary

---

## 🧪 **Testing**

### **Run Unit Tests**
```bash
npm test
# or
yarn test
```

### **Manual Testing**
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive test cases.

**Quick Test:**
1. Clear localStorage
2. Connect wallet on `/login`
3. Sign message
4. Register with email
5. Verify redirect to dashboard

### **Test Rate Limiting**
```javascript
// Browser console
async function testRateLimit() {
  for (let i = 0; i < 6; i++) {
    const res = await fetch('/api/auth/wallet/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress: 'test', signature: 'test', message: 'test' })
    });
    console.log(`Attempt ${i + 1}:`, res.status);
  }
}
testRateLimit(); // Should show 429 on 6th attempt
```

---

## 🗂️ **Project Structure**

```
mythra-fe/
├── app/
│   ├── api/              # API routes
│   │   └── auth/
│   │       └── wallet/   # Wallet auth endpoints
│   ├── dashboard/        # Role-based dashboards
│   │   ├── admin/
│   │   ├── organizer/
│   │   ├── customer/
│   │   ├── investor/
│   │   └── staff/
│   └── login/            # Login page
├── components/
│   ├── auth/             # Auth components
│   ├── program/          # Wallet-related components
│   └── ui/               # UI components (shadcn)
├── lib/
│   ├── auth/             # Auth utilities
│   ├── security/         # Security (rate limiting)
│   ├── supabase/         # Supabase client
│   └── validation/       # Input validation
├── hooks/                # Custom React hooks
├── scripts/              # Migration scripts
└── __tests__/            # Unit tests
```

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### **Environment Variables Required**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SOLANA_RPC_URL`

---

## 📊 **API Endpoints**

### **Authentication**
```
POST /api/auth/wallet/check       - Check if wallet exists
POST /api/auth/wallet/nonce       - Get authentication nonce
POST /api/auth/wallet/verify      - Verify signature & authenticate
```

### **Users**
```
GET  /api/users/[wallet]/roles    - Get user roles
POST /api/users/upsert            - Create or update user
```

### **Events** (Organizer)
```
GET  /api/events                  - Get events
POST /api/events                  - Create event
```

See full API documentation in `/docs/API.md` (TODO)

---

## 🔧 **Development**

### **Code Style**
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits

### **Environment**
- Development: `npm run dev` (port 3000)
- Build: `npm run build`
- Start production: `npm start`

### **Database Migrations**
```bash
# Run migration script
ts-node scripts/migrate-users.ts
```

---

## 🆘 **Troubleshooting**

### **Wallet Not Detected**
- Install wallet extension (Phantom recommended)
- Refresh page
- Enable extension in browser

### **Signature Verification Fails**
- Check if message expired (5 min limit)
- Verify correct wallet is connected
- Try signing again

### **Rate Limited (429)**
- Wait 15-30 minutes
- Or contact support

See [WALLET_AUTH_GUIDE.md](./WALLET_AUTH_GUIDE.md#troubleshooting) for more.

---

## 📄 **License**

MIT License - see LICENSE file

---

## 🤝 **Contributing**

Contributions welcome! Please read CONTRIBUTING.md first.

---

## 📞 **Support**

- Email: support@mythra.tix
- Discord: [Mythra Community]
- Twitter: [@MythraPlatform]
- Docs: [docs.mythra.tix]

---

**Built with ❤️ by the Mythra team**
