# gameBit - Peer-to-Peer Ecommerce Marketplace

A complete, fully functional peer-to-peer ecommerce marketplace built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Four User Roles**: Admin, Seller (admin-approved), Buyer/User, Escrow Agent (admin-approved)
- **Real-time Chat**: Socket.io-powered chat with typing indicators, read receipts, and online presence
- **Product Management**: Full CRUD operations with image uploads, categories, and moderation
- **Escrow System**: Complete transaction workflow with verification milestones
- **Admin Dashboard**: Approve sellers/escrow agents, moderate products, view analytics
- **Seller Dashboard**: Manage products, track transactions, handle escrow requests
- **User Dashboard**: Browse, search, filter products, view seller profiles, initiate transactions
- **Escrow Agent Dashboard**: Manage assigned cases, verify proofs, resolve transactions

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time chat)
- JWT Authentication
- bcrypt (password hashing)
- Multer (file uploads)

### Frontend
- React + Vite
- TailwindCSS
- Zustand (state management)
- React Query (data fetching)
- Socket.io Client
- Axios

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gamebit
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-64-characters-long
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development

# Email Configuration (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Cloudinary Configuration (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important**: 
- Generate a secure 32-byte hex key for `ENCRYPTION_KEY`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- For Gmail, use an App Password (not your regular password) for `SMTP_PASS`. Enable 2FA and generate an app password in your Google Account settings.
- For Cloudinary, sign up at [cloudinary.com](https://cloudinary.com) and get your credentials from the Dashboard. All media uploads (avatars, product images, proof images) will be stored on Cloudinary.

4. Seed categories:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Default Access

After seeding, you can create an admin user manually in MongoDB or through the signup flow and update the user document to set `isAdmin: true`.

## Project Structure

```
gameBit/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # Utilities (API, Socket)
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth & role middleware
│   ├── utils/            # Utilities (crypto, seeding)
│   ├── uploads/          # Uploaded files (created automatically)
│   └── server.js
└── README.md
```

## Key Features Explained

### Category System
The platform includes a comprehensive category structure:
- **Tech**: Peripherals, Accessories, Devices (laptops/tablets/phones)
- **Gaming**: Console Ecosystems, Handheld Devices, Retro Devices, Games, Collectibles, Accessories

### Escrow Workflow
1. User requests escrow
2. Seller accepts/declines
3. Admin assigns escrow agent
4. Agent verifies proofs
5. Shipping confirmation
6. Delivery confirmation
7. Transaction resolution

### Real-time Chat
- Buyer ↔ Seller messaging
- Escrow agents and admins can join
- Typing indicators
- Read receipts
- Online/offline presence
- File attachments support

## Development Notes

- All file uploads are stored locally in `server/uploads/`
- Images are served statically at `/uploads/` route
- Socket.io connection requires authentication via JWT
- All routes are protected with appropriate middleware
- Category seeding must be run before first use

## License

ISC

