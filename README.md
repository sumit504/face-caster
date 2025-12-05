# 📸 Face Caster

> **Decentralized Real Face Onchain Social Network**

Face Caster is a decentralized social network built on Arbitrum that enables users to share authentic moments through photos stored on IPFS. Built as a Farcaster Mini App with seamless wallet integration powered by Reown AppKit.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/face-caster)

## ✨ Features

- 📷 **Share Real Photos** - Upload authentic moments stored permanently on IPFS
- 🔗 **Onchain Posts** - All posts recorded on Arbitrum blockchain
- 👤 **User Profiles** - View and search user profiles by FID, address, or username
- ❤️ **Like System** - Like/unlike posts with onchain transactions
- 🔍 **Advanced Search** - Search users by Farcaster FID, Ethereum address, or username
- 🔵 **Farcaster Integration** - Share posts directly to Farcaster/Warpcast
- 💜 **Farcaster Mini App** - Native experience within Farcaster clients
- 🌐 **IPFS Storage** - Decentralized photo storage via Pinata
- 🚫 **Post Limits** - Maximum 20 posts per user to ensure quality

## 🛠️ Technical Stack

### Frontend
* **Framework**: React with Vite
* **Styling**: Custom CSS with CSS Variables
* **Fonts**: Google Fonts (Poppins, Space Mono)
* **Module Bundler**: Vite (ES Modules)
* **State Management**: React Hooks with local state

### Blockchain Integration
* **Network**: Arbitrum Mainnet (Chain ID: 42161)
* **Wallet Integration**:
   * 🌟 **[Reown AppKit](https://reown.com/)** (formerly WalletConnect v2) - Primary wallet connection system
   * **Wagmi Core** (React Hooks for Ethereum) - Blockchain interaction layer
   * **Farcaster Mini App Connector** - Seamless Farcaster wallet integration
   * Supports 300+ wallets including MetaMask, Coinbase Wallet, WalletConnect
* **Smart Contracts**: Solidity (ERC standards)
* **Libraries**: 
   * `@wagmi/core` - Ethereum interaction
   * `@reown/appkit` - Wallet connection modal
   * `@reown/appkit-adapter-wagmi` - Wagmi integration
   * `viem` - TypeScript interface for Ethereum

### Web3 Infrastructure
* **RPC Provider**: Alchemy (Arbitrum Mainnet)
* **IPFS Gateway**: Pinata (file storage & retrieval)
* **Farcaster API**: Neynar API v2 (user profiles, search)
* **Smart Contract ABI**: Custom FaceCaster contract

### Backend Services
* **IPFS Pinning**: Pinata Cloud
* **Profile Data**: Neynar Farcaster API
* **User Search**: Neynar Search API

### Development Tools
* **Package Manager**: npm/pnpm/yarn
* **Build Tool**: Vite
* **Code Splitting**: ES Modules
* **Buffer Polyfill**: For browser compatibility

### Hosting & Deployment
* **Platform**: Vercel (recommended)
* **CDN**: Vercel Edge Network
* **Domain**: Custom domain support
* **SSL**: Automatic HTTPS

## 🎯 Reown AppKit Integration

Face Caster leverages **Reown AppKit** (WalletConnect v2) for a superior wallet connection experience:

### Why Reown AppKit?

✅ **Universal Compatibility** - Connect with 300+ wallets  
✅ **Beautiful UI** - Modern, customizable modal interface  
✅ **Multi-Chain Support** - Easy to extend to other networks  
✅ **Mobile Optimized** - Deep linking and QR code support  
✅ **Secure** - Industry-standard WalletConnect protocol  
✅ **Analytics Ready** - Built-in usage analytics  

### AppKit Configuration

```javascript
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrum } from '@wagmi/core/chains';

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks: [arbitrum],
    projectId: PROJECT_ID,
    ssr: false
});

// Create AppKit Modal
const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [arbitrum],
    projectId: PROJECT_ID,
    metadata: {
        name: 'Face Caster',
        description: 'Decentralized real face onchain social network',
        url: 'https://face-caster.vercel.app',
        icons: ['https://face-caster.vercel.app/logo.png']
    },
    features: {
        analytics: true,
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#8b5cf6',
        '--w3m-border-radius-master': '12px'
    }
});
```

### Supported Wallets

- MetaMask
- Coinbase Wallet
- WalletConnect
- Rainbow Wallet
- Trust Wallet
- Ledger
- Farcaster Wallet
- And 300+ more...

## 📦 Installation & Setup

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/face-caster.git
cd face-caster
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
# Reown AppKit (formerly WalletConnect)
VITE_REOWN_PROJECT_ID=your_reown_project_id

# Smart Contract
VITE_CONTRACT_ADDRESS=0x9BBe1531e34897e55Ecc5cf7Bf887BF73542cc85

# IPFS (Pinata)
VITE_PINATA_JWT=your_pinata_jwt_token

# Farcaster (Neynar)
VITE_NEYNAR_API_KEY=your_neynar_api_key

# Network
VITE_CHAIN_ID=42161
VITE_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your_alchemy_key

# App URL
VITE_APP_URL=http://localhost:5173
```

### 4. Get API Keys

#### Reown Project ID (Required)
1. Go to [Reown Cloud](https://cloud.reown.com/)
2. Create a new project
3. Copy your Project ID
4. Add to `.env` as `VITE_REOWN_PROJECT_ID`

#### Pinata JWT (Required)
1. Sign up at [Pinata](https://app.pinata.cloud/)
2. Create API key with pinning permissions
3. Copy JWT token
4. Add to `.env` as `VITE_PINATA_JWT`

#### Neynar API Key (Required)
1. Sign up at [Neynar](https://neynar.com/)
2. Get your API key from dashboard
3. Add to `.env` as `VITE_NEYNAR_API_KEY`

#### Alchemy RPC (Optional but Recommended)
1. Sign up at [Alchemy](https://www.alchemy.com/)
2. Create an Arbitrum app
3. Copy the RPC URL
4. Add to `.env` as `VITE_RPC_URL`

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production

```bash
npm run build
npm run preview
```

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/face-caster)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

```bash
# Build static files
npm run build

# Output directory: dist/
# Upload dist/ folder to your hosting provider
```

## 📱 Farcaster Mini App Setup

### 1. Add Mini App Metadata

The app includes Farcaster Mini App metadata in `index.html`:

```html
<meta name="fc:miniapp" content='{
  "version":"1",
  "imageUrl":"https://face-caster.vercel.app/image.png",
  "button":{
    "title":"Share Your Face",
    "action":{
      "type":"launch_frame",
      "name":"Face caster",
      "url":"https://face-caster.vercel.app",
      "splashImageUrl":"https://face-caster.vercel.app/splash.png",
      "splashBackgroundColor":"#ff9500"
    }
  }
}' />
```

### 2. Required Assets

Create these images in your `public/` folder:
- `logo.png` - App logo (512x512px recommended)
- `image.png` - Mini app preview (1200x630px)
- `splash.png` - Splash screen (1080x1920px)

### 3. Test in Farcaster

1. Deploy your app to production
2. Share your URL in Warpcast
3. The mini app should be detected automatically

## 🔧 Smart Contract

### Contract Address
```
Arbitrum: 0x9BBe1531e34897e55Ecc5cf7Bf887BF73542cc85
```

### Main Functions

```solidity
// Create a new post
function createPost(
    string memory _ipfsHash,
    string memory _caption,
    uint256 _fid
) public

// Like a post
function likePost(uint256 _postId) public

// Unlike a post
function unlikePost(uint256 _postId) public

// Get all post IDs
function getAllPostIds() public view returns (uint256[])

// Get post details
function getPost(uint256 _postId) public view returns (
    uint256 id,
    address author,
    uint256 authorFid,
    string memory authorName,
    string memory ipfsHash,
    string memory caption,
    uint256 timestamp,
    uint256 likes
)

// Get user posts by FID
function getUserPostsByFid(uint256 _fid) public view returns (uint256[])

// Get user post count
function getPostCountByFid(uint256 _fid) public view returns (uint256)
```

## 🎨 Customization

### Theme Colors

Edit CSS variables in `index.html`:

```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f8f8;
    --bg-card: #fafafa;
    --accent: #8b5cf6;
    --accent-purple: #7c3aed;
    --accent-violet: #a78bfa;
    --text-primary: #2a2a2a;
    --text-secondary: #6a6a6a;
}
```

### Reown AppKit Theme

Customize wallet modal appearance:

```javascript
themeMode: 'dark', // or 'light'
themeVariables: {
    '--w3m-accent': '#8b5cf6',
    '--w3m-border-radius-master': '12px'
}
```

### Post Limit

Change maximum posts per user in `main.js`:

```javascript
const MAX_POSTS = 20; // Change this value
```

## 📖 Usage Guide

### Creating a Post

1. Click "Create Post" section
2. Upload an image (max 10MB)
3. Add optional caption
4. Click "Post to Face Caster"
5. Confirm transaction in wallet
6. Wait for blockchain confirmation

### Searching Users

1. Enter FID (e.g., `513318`)
2. Or enter username (e.g., `vitalik`)
3. Or enter address (e.g., `0x...`)
4. Click "Search" or press Enter

### Viewing Profiles

1. Click on any user's avatar or name
2. View their posts and profile info
3. Click "Back to Feed" to return

### Liking Posts

1. Click the heart icon on any post
2. Confirm transaction in wallet
3. Post updates with new like count

### Sharing to Farcaster

1. Click the blue "Share" button
2. Opens Warpcast compose window
3. Customize your cast
4. Share with followers

## 🔐 Security

- ✅ Client-side image validation (size, type)
- ✅ IPFS content addressing (tamper-proof)
- ✅ Onchain post verification
- ✅ Wallet signature verification
- ✅ Rate limiting via post limits
- ✅ Secure RPC connections
- ✅ Environment variable protection

## 🐛 Troubleshooting

### Wallet Won't Connect

- Check Reown Project ID is correct
- Ensure you're on Arbitrum network
- Try different wallet or browser
- Clear cache and refresh

### Posts Not Loading

- Verify contract address is correct
- Check RPC endpoint is responding
- Ensure wallet is connected
- Check browser console for errors

### IPFS Upload Failing

- Verify Pinata JWT is valid
- Check image size (max 10MB)
- Ensure stable internet connection
- Try different image format

### Profile Search Not Working

- Verify Neynar API key
- Check if user exists on Farcaster
- Try searching by FID instead
- Ensure API rate limits not exceeded

## 📊 Performance

- ⚡ **Fast Loading** - Optimized bundle size
- 🎯 **Efficient Caching** - Profile and image caching
- 🔄 **Smart Updates** - Only reload when needed
- 📱 **Mobile Optimized** - Responsive design
- 🌐 **CDN Delivery** - Fast global access

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Farcaster](https://www.farcaster.xyz/) - Decentralized social protocol
- [Reown (WalletConnect)](https://reown.com/) - Universal wallet connection
- [Arbitrum](https://arbitrum.io/) - Layer 2 scaling solution
- [Pinata](https://pinata.cloud/) - IPFS pinning service
- [Neynar](https://neynar.com/) - Farcaster API infrastructure
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum

## 📞 Support

- **Documentation**: [Your docs URL]
- **Discord**: [Your Discord invite]
- **Twitter**: [@YourHandle]
- **Email**: support@face-caster.app

## 🗺️ Roadmap

- [ ] NFT minting for posts
- [ ] Comments system
- [ ] Post editing/deletion
- [ ] Advanced filters
- [ ] Multiple image uploads
- [ ] Video support
- [ ] Multi-chain support
- [ ] Token rewards
- [ ] Premium features
- [ ] Mobile app

## 📸 Screenshots

### Main Feed
![Feed Screenshot](screenshots/feed.png)

### User Profile
![Profile Screenshot](screenshots/profile.png)

### Wallet Connection (Reown AppKit)
![Wallet Screenshot](screenshots/wallet.png)

### Create Post
![Create Screenshot](screenshots/create.png)

---

**Built with 💜 on Arbitrum | Powered by Reown AppKit**

Star ⭐ this repo if you find it useful!