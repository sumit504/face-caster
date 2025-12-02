# Face-caster 🎭

A decentralized social media platform where users share real face photos stored on IPFS (via Lighthouse) with metadata on the blockchain.

## 🌟 Features

- ✅ Upload real photos stored on IPFS via Lighthouse
- ✅ Smart contract-based post management
- ✅ Like and comment on posts
- ✅ Maximum 10 posts limit (enforced on-chain)
- ✅ Fully decentralized storage
- ✅ Web3 wallet integration (MetaMask)
- ✅ **Farcaster Mini App integration**
- ✅ **Base blockchain (optimized for low gas fees)**
- ✅ **Share directly to Farcaster**
- ✅ Beautiful dark theme UI

## 📁 Project Structure

```
Face-caster/
├── FaceCaster.sol      # Smart contract
├── App.jsx             # React component (for React apps)
├── index.html          # Standalone HTML version
├── package.json        # NPM dependencies
└── README.md           # This file
```

## 🚀 Quick Start

### Option 1: Standalone HTML (Easiest)

1. **Deploy the Smart Contract**
   - Open `FaceCaster.sol` in Remix IDE (https://remix.ethereum.org/)
   - Compile with Solidity 0.8.20+
   - Deploy to your preferred network (Polygon, Base, Arbitrum, etc.)
   - Copy the deployed contract address

2. **Get Lighthouse API Key**
   - Go to https://files.lighthouse.storage
   - Sign up for free account
   - Get your API key from the dashboard

3. **Configure index.html**
   ```javascript
   const CONTRACT_ADDRESS = "0xYourContractAddress";
   const LIGHTHOUSE_API_KEY = "your-lighthouse-api-key";
   ```

4. **Open index.html in browser**
   - Just open the file in any modern browser
   - Connect your MetaMask wallet
   - Start posting!

### Option 2: React App

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure App.jsx**
   - Update `CONTRACT_ADDRESS` with your deployed contract
   - Update `LIGHTHOUSE_API_KEY` with your Lighthouse key

3. **Run development server**
   ```bash
   npm run dev
   ```

## 🔧 Smart Contract Deployment

### Using Remix IDE

1. Go to https://remix.ethereum.org/
2. Create new file `FaceCaster.sol`
3. Paste the contract code
4. Go to "Solidity Compiler" tab
5. Select compiler version 0.8.20 or higher
6. Click "Compile FaceCaster.sol"
7. Go to "Deploy & Run Transactions" tab
8. Select "Injected Provider - MetaMask"
9. Make sure you're on the correct network
10. Click "Deploy"
11. Confirm transaction in MetaMask
12. Copy the deployed contract address

### Recommended Networks

- **Base Mainnet (Recommended)** - Low cost, optimized for this app
- **Base Sepolia (Testnet)** - Free transactions for testing
- **Polygon** - Alternative low-cost option
- **Arbitrum** - Alternative low-cost option

**Note:** This app is optimized for Base blockchain for the best experience with Farcaster integration.

### Get Testnet Tokens

- Polygon Mumbai: https://faucet.polygon.technology/
- Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 📡 Lighthouse IPFS Setup

1. **Create Account**
   - Visit https://files.lighthouse.storage
   - Sign up with email or wallet

2. **Get API Key**
   - Go to API Keys section in dashboard
   - Create new API key
   - Copy the key

3. **Free Tier**
   - 100GB storage free
   - Perfect for testing and small apps

## 🎭 Farcaster Integration Setup

1. **Get Neynar API Key**
   - Visit https://neynar.com
   - Sign up for free account
   - Create API key from dashboard
   - Copy the API key

2. **Farcaster Mini App Metadata**
   - The app includes Farcaster miniapp meta tags
   - Update the URLs in the meta tags to match your deployment
   - Replace image.png and splash.png with your branding

3. **Deploy as Farcaster Frame**
   - Deploy your app to Vercel/Netlify
   - Share the URL on Farcaster
   - Users can interact directly in Farcaster

4. **Features**
   - Auto-loads Farcaster user profile
   - Shows FID and profile picture
   - Share posts directly to Farcaster
   - Seamless wallet connection via Farcaster

## 🎨 Smart Contract Functions

### Write Functions
- `createPost(ipfsHash, caption)` - Create a new post
- `likePost(postId)` - Like a post
- `unlikePost(postId)` - Unlike a post
- `addComment(postId, text)` - Add a comment
- `setUserName(name)` - Set display name

### Read Functions
- `getAllPostIds()` - Get all post IDs
- `getPost(postId)` - Get post details
- `getComments(postId)` - Get all comments
- `hasUserLiked(postId, user)` - Check if user liked
- `getTotalPosts()` - Get total post count

## 🔒 Security Features

- Maximum 5 posts enforced on-chain
- Author verification
- Immutable post storage
- Decentralized image hosting
- No central point of failure

## 🛠 Development

### Testing Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Contract Testing

You can test the contract on testnets before mainnet:

1. Deploy to testnet
2. Get free testnet tokens from faucet
3. Test all functions
4. Verify everything works
5. Deploy to mainnet

## 📝 How It Works

1. **Upload Flow**
   ```
   User selects image → Upload to Lighthouse IPFS → Get IPFS hash
   → Create blockchain transaction → Post stored on-chain
   ```

2. **View Flow**
   ```
   Load posts from blockchain → Get IPFS hashes
   → Fetch images from Lighthouse gateway → Display
   ```

3. **Interaction Flow**
   ```
   Like/Comment → Blockchain transaction → Smart contract update
   → Event emitted → UI updates
   ```

## 🌐 IPFS Gateway

Images are accessed via:
```
https://gateway.lighthouse.storage/ipfs/{IPFS_HASH}
```

## 💡 Tips

- **Use testnet first** - Test everything before deploying to mainnet
- **Keep API key secure** - Don't commit it to public repos
- **Optimize images** - Compress before uploading to save storage
- **Gas optimization** - Batch transactions when possible
- **Backup contract address** - Keep it safe for future reference

## 🤝 Contributing

Feel free to fork and improve the project!

## 📄 License

MIT License - Feel free to use for any purpose

## 🆘 Support

If you encounter issues:

1. Check MetaMask is connected
2. Verify contract address is correct
3. Ensure you have enough tokens for gas
4. Check Lighthouse API key is valid
5. Try on testnet first

## 🎯 Future Enhancements

- [ ] User profiles
- [ ] Follow system
- [ ] Notifications
- [ ] Post deletion (with owner check)
- [ ] Multi-chain support
- [ ] Mobile app
- [ ] Video support

---

Built with ❤️ using Blockchain, IPFS, and Web3