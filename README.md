# 📸 Face Caster

> **Decentralized Real Face Onchain Social Network**

Face Caster is a decentralized social network built on Base that enables users to share authentic moments through photos stored on IPFS. Built as a Farcaster Mini App with seamless wallet integration powered by Reown AppKit.

## ✨ Features

- 📷 **Share Real Photos** - Upload authentic moments stored permanently on IPFS
- 🔗 **Onchain Posts** - All posts recorded on Base blockchain
- 👤 **User Profiles** - View and search user profiles by FID, address, or username
- ❤️ **Like System** - Like/unlike posts with onchain transactions
- 💬 **Comment System** - Comment on posts with onchain storage
- 🔍 **Advanced Search** - Search users by Farcaster FID, Ethereum address, or username
- 🔵 **Farcaster Integration** - Share posts directly to Farcaster/Warpcast
- 💜 **Farcaster Mini App** - Native experience within Farcaster clients
- 🌐 **IPFS Storage** - Decentralized photo storage via Pinata with custom gateway
- 🚫 **Post Limits** - Maximum 20 posts per user to ensure quality

## 🛠️ Technical Stack

### Frontend
* **Framework**: Vanilla JavaScript with Vite
* **Styling**: Custom CSS with CSS Variables
* **Fonts**: Google Fonts (Poppins, Space Mono)
* **Module Bundler**: Vite (ES Modules)
* **State Management**: Local state management

### Blockchain Integration
* **Network**: Base Mainnet (Chain ID: 8453)
* **Wallet Integration**:
   * 🌟 **[Reown AppKit](https://reown.com/)** (formerly WalletConnect v2) - Primary wallet connection system
   * **Wagmi Core** - Blockchain interaction layer
   * **Farcaster Mini App Connector** - Seamless Farcaster wallet integration
   * Supports 300+ wallets including MetaMask, Coinbase Wallet, WalletConnect
* **Smart Contracts**: Solidity with comment functionality
* **Libraries**: 
   * `@wagmi/core` - Ethereum interaction
   * `@reown/appkit` - Wallet connection modal
   * `@reown/appkit-adapter-wagmi` - Wagmi integration
   * `viem` - TypeScript interface for Ethereum

### Web3 Infrastructure
* **RPC Provider**: Base Mainnet
* **IPFS Gateway**: Custom Pinata Gateway (`monocats.mypinata.cloud`)
* **Farcaster API**: Neynar API v2 (user profiles, search)
* **Smart Contract ABI**: Custom FaceCaster contract

### Backend Services
* **IPFS Pinning**: Pinata Cloud (via serverless API)
* **Profile Data**: Neynar Farcaster API (via serverless API)
* **API Routes**: Vercel Serverless Functions (`/api/pinata`, `/api/neynar`)

### Development Tools
* **Package Manager**: npm/pnpm/yarn
* **Build Tool**: Vite
* **Code Splitting**: ES Modules
* **Buffer Polyfill**: For browser compatibility

### Hosting & Deployment
* **Platform**: Vercel
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
import { base } from '@wagmi/core/chains';

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks: [base],
    projectId: PROJECT_ID,
    ssr: false
});

// Create AppKit Modal
const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [base],
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

### 1. Get the Project Files

Download or clone the project files to your local machine.

```bash
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

**For Vercel Deployment** - Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
PINATA_JWT=your_pinata_jwt_token
NEYNAR_API_KEY=your_neynar_api_key
PROJECT_ID=6be120a150654d42b97a3ed83c1bf1c4
```

⚠️ **Important**: API keys are secured server-side via `/api` routes. Never expose them in client code!

### 4. Get API Keys

#### Reown Project ID (Required)
1. Go to [Reown Cloud](https://cloud.reown.com/)
2. Create a new project
3. Copy your Project ID
4. Add to Vercel as `PROJECT_ID`

#### Pinata JWT (Required)
1. Sign up at [Pinata](https://app.pinata.cloud/)
2. Create API key with pinning permissions
3. Copy JWT token
4. Add to Vercel as `PINATA_JWT`

#### Pinata Custom Gateway (Configured)
Currently using: `https://monocats.mypinata.cloud/ipfs/`

#### Neynar API Key (Required)
1. Sign up at [Neynar](https://neynar.com/)
2. Get your API key from dashboard
3. Add to Vercel as `NEYNAR_API_KEY`

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

1. Create account at [Vercel](https://vercel.com)
2. Import your project
3. Add environment variables in Vercel dashboard:
   - `PINATA_JWT`
   - `NEYNAR_API_KEY`
   - `PROJECT_ID`
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
      "splashBackgroundColor":"#834AF1"
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
Base Mainnet: 0x5F74269b1ceb756D93B8C11F051a32E764774169
Chain ID: 8453
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

// Create a comment
function createComment(
    uint256 _postId,
    string memory _text,
    uint256 _fid
) public

// Delete a comment
function deleteComment(uint256 _commentId) public

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
    uint256 likes,
    uint256 commentCount
)

// Get post comments
function getPostComments(uint256 _postId) public view returns (uint256[])

// Get comment details
function getComment(uint256 _commentId) public view returns (...)

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

### IPFS Gateway

Change in `main.js`:

```javascript
const IPFS_GATEWAY = 'https://monocats.mypinata.cloud/ipfs/';
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

### Commenting on Posts

1. Click the 💬 icon on any post
2. Type your comment
3. Press "Send" or Enter
4. Confirm transaction in wallet

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
- ✅ Environment variables protected server-side
- ✅ API routes prevent key exposure

## 🐛 Troubleshooting

### Wallet Won't Connect

- Check Reown Project ID is correct
- Ensure you're on Base network
- Try different wallet or browser
- Clear cache and refresh

### Posts Not Loading

- Verify contract address is correct
- Check RPC endpoint is responding
- Ensure wallet is connected
- Check browser console for errors

### IPFS Upload Failing

- Verify Pinata JWT is valid in Vercel env vars
- Check image size (max 10MB)
- Ensure stable internet connection
- Check `/api/pinata` route is working

### Profile Search Not Working

- Verify Neynar API key in Vercel env vars
- Check if user exists on Farcaster
- Try searching by FID instead
- Check `/api/neynar` route is working

## 📊 Performance

- ⚡ **Fast Loading** - Optimized bundle size
- 🎯 **Efficient Caching** - Profile and image caching
- 🔄 **Smart Updates** - Only reload when needed
- 📱 **Mobile Optimized** - Responsive design
- 🌐 **CDN Delivery** - Fast global access via custom gateway

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Make your changes in a separate branch
2. Test thoroughly
3. Submit your improvements
4. Ensure code follows existing patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Farcaster](https://www.farcaster.xyz/) - Decentralized social protocol
- [Reown (WalletConnect)](https://reown.com/) - Universal wallet connection
- [Base](https://base.org/) - Layer 2 scaling solution
- [Pinata](https://pinata.cloud/) - IPFS pinning service
- [Neynar](https://neynar.com/) - Farcaster API infrastructure
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum

## 📞 Support

For support and questions:
- Check the documentation above
- Review troubleshooting section
- Verify environment variables are set correctly

## 🗺️ Roadmap

- [x] Comments system
- [ ] NFT minting for posts
- [ ] Post editing/deletion
- [ ] Advanced filters
- [ ] Multiple image uploads
- [ ] Video support
- [ ] Multi-chain support
- [ ] Token rewards
- [ ] Premium features
- [ ] Mobile app

---

**Built with 💜 on Base | Powered by Reown AppKit**