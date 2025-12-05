# Face Caster - Decentralized Social Network

A decentralized social network built on Arbitrum with Farcaster integration, using Reown AppKit for wallet connections.

## 🚀 Features

- **Real Face Sharing**: Post authentic photos stored on IPFS
- **Blockchain-Based**: All posts stored permanently on Arbitrum
- **Farcaster Integration**: Seamless login with Farcaster
- **Multi-Wallet Support**: Connect with any wallet via Reown AppKit
- **User Profiles**: Search and view user profiles
- **Social Interactions**: Like posts and share on Farcaster

## 📦 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update these values in `main.js`:

```javascript
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const PINATA_JWT = "YOUR_PINATA_JWT_TOKEN";
const NEYNAR_API_KEY = "YOUR_NEYNAR_API_KEY";
const PROJECT_ID = "YOUR_REOWN_PROJECT_ID"; // Get from cloud.reown.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🔑 Getting API Keys

### Reown Project ID
1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID

### Pinata JWT
1. Go to [app.pinata.cloud](https://app.pinata.cloud)
2. Create an API key
3. Copy the JWT token

### Neynar API Key
1. Go to [neynar.com](https://neynar.com)
2. Sign up for an account
3. Create an API key

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript + Vite
- **Blockchain**: Arbitrum (Layer 2)
- **Wallet Connection**: Reown AppKit (formerly WalletConnect)
- **Identity**: Farcaster
- **Storage**: IPFS (Pinata)
- **Smart Contracts**: Solidity

## 📱 Farcaster Mini App

This app works as a Farcaster Mini App. Users can:
- Connect with their Farcaster account
- Auto-fill profile information
- Share posts directly to Farcaster

## 🔐 Wallet Support

Supports all major wallets through Reown AppKit:
- MetaMask
- Rainbow
- Coinbase Wallet
- WalletConnect
- And many more...

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.