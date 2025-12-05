// Buffer polyfill for WalletConnect
import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.global = window.global || window;
window.process = window.process || { env: {} };

import { sdk } from '@farcaster/miniapp-sdk';
import {
  createConfig,
  connect,
  getAccount,
  watchAccount,
  writeContract,
  readContract,
  waitForTransactionReceipt,
  http
} from '@wagmi/core';
import { arbitrum } from '@wagmi/core/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// ===== CONFIGURATION =====
const CONTRACT_ADDRESS = "0x9BBe1531e34897e55Ecc5cf7Bf887BF73542cc85";
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNWVlZTc5Zi0xMzU5LTRmNDEtOTkyMC1mMzUwMmI1NWQwOGQiLCJlbWFpbCI6InN1bWl0am9iNzAzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0YzRmNjZhYzlmY2RkNTk2MjBmNiIsInNjb3BlZEtleVNlY3JldCI6IjFhYTEwNDBjNGIwMDdjOWQ4ZWFlMzliODE5Yzg2OGIyZjliMDM2MTY4ZGY1YmFlYjM0OGI3YTliODE1MTI4MjAiLCJleHAiOjE3OTM0Nzk2MTR9.p1NEgDx4aPs71Uol63ZzUVj3XgfRCgsRgGuFDssJ5qY";
const NEYNAR_API_KEY = "8BF81B8C-C491-4735-8E1C-FC491FF048D4";
const ARBITRUM_CHAIN_ID = 42161;
const MAX_POSTS = 20;
const PROJECT_ID = '6be120a150654d42b97a3ed83c1bf1c4';

// Contract ABI
const CONTRACT_ABI = [
    {"inputs": [{"internalType": "string", "name": "_ipfsHash", "type": "string"}, {"internalType": "string", "name": "_caption", "type": "string"}, {"internalType": "uint256", "name": "_fid", "type": "uint256"}], "name": "createPost", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}], "name": "likePost", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}], "name": "unlikePost", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [], "name": "getAllPostIds", "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}], "name": "getPost", "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "address", "name": "author", "type": "address"}, {"internalType": "uint256", "name": "authorFid", "type": "uint256"}, {"internalType": "string", "name": "authorName", "type": "string"}, {"internalType": "string", "name": "ipfsHash", "type": "string"}, {"internalType": "string", "name": "caption", "type": "string"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "uint256", "name": "likes", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}, {"internalType": "address", "name": "_user", "type": "address"}], "name": "hasUserLiked", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_fid", "type": "uint256"}], "name": "getUserPostsByFid", "outputs": [{"internalType": "uint256[]", "name": "postIds", "type": "uint256[]"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_fid", "type": "uint256"}], "name": "getPostCountByFid", "outputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "_user", "type": "address"}], "name": "getUserPosts", "outputs": [{"internalType": "uint256[]", "name": "postIds", "type": "uint256[]"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "_user", "type": "address"}], "name": "getUserFid", "outputs": [{"internalType": "uint256", "name": "fid", "type": "uint256"}], "stateMutability": "view", "type": "function"}
];

// ===== STATE =====
let state = {
    account: null,
    posts: [],
    userPosts: [],
    loading: false,
    imageFile: null,
    imagePreview: null,
    currentCaption: '',
    fid: null,
    userProfile: null,
    walletConfig: null,
    currentView: 'feed',
    viewingAddress: null,
    viewingProfile: null,
    userPostCount: 0,
    isWalletConnected: false,
    isCreatePostOpen: false
};

let profileCache = {};

// ===== INITIALIZATION =====
async function initializeFarcaster() {
    try {
        await sdk.actions.ready({ disableNativeGestures: true });
        console.log('✅ Farcaster SDK ready');
        await initializeWallet();
        return true;
    } catch (err) {
        console.log('⚠️ SDK not available:', err);
        await initializeWallet();
        return false;
    }
}

async function initializeWallet() {
    try {
        console.log('🔄 Initializing wagmi wallet with Reown AppKit...');
        
        const wagmiAdapter = new WagmiAdapter({
            networks: [arbitrum],
            projectId: PROJECT_ID,
            ssr: false
        });

        state.walletConfig = wagmiAdapter.wagmiConfig;

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

        window.appKitModal = modal;

        watchAccount(state.walletConfig, {
            onChange: (account) => {
                updateWalletConnection(account);
            }
        });

        const account = getAccount(state.walletConfig);
        
        if (account.isConnected) {
            updateWalletConnection(account);
        } else {
            try {
                const farcasterConnector = state.walletConfig.connectors.find(
                    c => c.id === 'farcasterMiniApp'
                );
                
                if (farcasterConnector) {
                    await connect(state.walletConfig, {
                        connector: farcasterConnector
                    });
                    const newAccount = getAccount(state.walletConfig);
                    updateWalletConnection(newAccount);
                }
            } catch (error) {
                console.log('⚠️ Auto-connect failed:', error);
            }
        }
    } catch (error) {
        console.error('❌ Failed to initialize wallet:', error);
    }
}

function updateWalletConnection(account) {
    if (account.isConnected && account.address) {
        state.isWalletConnected = true;
        state.account = account.address;
        console.log('✅ Wallet connected:', state.account);
        
        loadPosts().then(() => renderApp());
    } else {
        state.isWalletConnected = false;
        state.account = null;
        renderConnectWallet();
    }
}

// ===== FARCASTER PROFILE =====
async function fetchFarcasterProfile() {
    try {
        const context = await sdk.context;
        
        if (context?.user?.fid) {
            state.fid = context.user.fid;
            console.log('✅ Current user FID:', state.fid);
            
            const response = await fetch(
                `https://api.neynar.com/v2/farcaster/user/bulk?fids=${state.fid}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'api_key': NEYNAR_API_KEY
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.users && data.users.length > 0) {
                    state.userProfile = data.users[0];
                    profileCache[state.fid.toString()] = state.userProfile;
                    console.log('✅ Profile loaded:', state.userProfile.display_name || state.userProfile.username);
                }
            }
        }
    } catch (error) {
        console.log('⚠️ Failed to fetch profile:', error);
    }
}

async function fetchProfileByFid(fid) {
    try {
        const fidStr = fid.toString();
        
        if (profileCache[fidStr]) {
            return profileCache[fidStr];
        }

        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidStr}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data.users && data.users.length > 0) {
                const profile = data.users[0];
                profileCache[fidStr] = profile;
                return profile;
            }
        }
        
        return null;
    } catch (error) {
        console.log('⚠️ Failed to fetch profile for FID:', fid, error);
        return null;
    }
}

// ===== SEARCH FUNCTIONALITY =====
async function searchByUsername(username) {
    try {
        console.log('🔍 Searching for username:', username);
        
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(username)}&limit=10`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'api_key': NEYNAR_API_KEY
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            console.log('Search results:', data);
            
            if (data.result && data.result.users && data.result.users.length > 0) {
                return data.result.users[0];
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error searching username:', error);
        return null;
    }
}

async function searchUser(searchInput) {
    try {
        const searchTerm = searchInput.trim();
        
        if (!searchTerm) {
            alert('Please enter a search term');
            return;
        }
        
        console.log('🔎 Searching for:', searchTerm);
        
        const searchButton = document.querySelector('.search-button');
        const originalText = searchButton.textContent;
        searchButton.textContent = 'Searching...';
        searchButton.disabled = true;
        
        try {
            // Search by FID (number)
            if (/^\d+$/.test(searchTerm)) {
                console.log('Searching by FID:', searchTerm);
                const fid = parseInt(searchTerm);
                const profile = await fetchProfileByFid(fid);
                
                if (profile && profile.verified_addresses && profile.verified_addresses.eth_addresses.length > 0) {
                    await viewUserProfile(profile.verified_addresses.eth_addresses[0]);
                } else if (profile && profile.custody_address) {
                    await viewUserProfile(profile.custody_address);
                } else {
                    alert('No verified address found for this FID');
                }
            }
            // Search by address (0x...)
            else if (searchTerm.toLowerCase().startsWith('0x') && searchTerm.length === 42) {
                console.log('Searching by address:', searchTerm);
                await viewUserProfile(searchTerm);
            } 
            // Search by username
            else {
                console.log('Searching by username:', searchTerm);
                
                let user = state.posts.find(post => 
                    post.authorName.toLowerCase() === searchTerm.toLowerCase() ||
                    (post.authorUsername && post.authorUsername.toLowerCase() === searchTerm.toLowerCase())
                );
                
                if (!user) {
                    console.log('Not found in posts, searching via API...');
                    const profile = await searchByUsername(searchTerm);
                    
                    if (profile) {
                        console.log('Found profile:', profile);
                        
                        if (profile.verified_addresses && profile.verified_addresses.eth_addresses.length > 0) {
                            await viewUserProfile(profile.verified_addresses.eth_addresses[0]);
                        } else if (profile.custody_address) {
                            await viewUserProfile(profile.custody_address);
                        } else {
                            alert('No verified Ethereum address found for this user');
                        }
                    } else {
                        alert('User not found. Try searching by:\n• FID (number)\n• Address (0x...)\n• Username');
                    }
                } else {
                    await viewUserProfile(user.author);
                }
            }
        } finally {
            searchButton.textContent = originalText;
            searchButton.disabled = false;
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed. Please try again.');
        
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.textContent = 'Search';
            searchButton.disabled = false;
        }
    }
}

// ===== VIEW USER PROFILE =====
async function viewUserProfile(address) {
    try {
        console.log('👤 Viewing profile for:', address);
        state.currentView = 'profile';
        state.viewingAddress = address;
        state.loading = true;
        
        state.viewingProfile = null;
        
        renderApp();
        
        let userFid = 0;
        try {
            userFid = await readContract(state.walletConfig, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getUserFid',
                args: [address],
                chainId: ARBITRUM_CHAIN_ID
            });
            userFid = Number(userFid);
            console.log('📋 User FID from contract:', userFid);
        } catch (error) {
            console.log('⚠️ Could not get FID from contract:', error);
        }
        
        if (!userFid || userFid === 0) {
            console.log('🔍 Fetching profile by address from Neynar...');
            try {
                const response = await fetch(
                    `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'api_key': NEYNAR_API_KEY
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data[address.toLowerCase()] && data[address.toLowerCase()].length > 0) {
                        const profile = data[address.toLowerCase()][0];
                        state.viewingProfile = profile;
                        userFid = profile.fid;
                        console.log('✅ Found profile by address:', profile.display_name || profile.username);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile by address:', error);
            }
        }
        
        if (userFid && userFid > 0 && !state.viewingProfile) {
            state.viewingProfile = await fetchProfileByFid(userFid);
        }
        
        let userPostIds = [];
        if (userFid && userFid > 0) {
            try {
                userPostIds = await readContract(state.walletConfig, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'getUserPostsByFid',
                    args: [userFid],
                    chainId: ARBITRUM_CHAIN_ID
                });
                console.log(`📝 Found ${userPostIds.length} posts for FID ${userFid}`);
            } catch (error) {
                console.log('⚠️ Error getting posts by FID, trying by address:', error);
                userPostIds = await readContract(state.walletConfig, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'getUserPosts',
                    args: [address],
                    chainId: ARBITRUM_CHAIN_ID
                });
            }
        } else {
            userPostIds = await readContract(state.walletConfig, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getUserPosts',
                args: [address],
                chainId: ARBITRUM_CHAIN_ID
            });
        }
        
        const userPosts = [];
        for (let id of userPostIds) {
            try {
                const postData = await readContract(state.walletConfig, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'getPost',
                    args: [id],
                    chainId: ARBITRUM_CHAIN_ID
                });
                
                const hasLiked = state.account ? await readContract(state.walletConfig, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'hasUserLiked',
                    args: [id, state.account],
                    chainId: ARBITRUM_CHAIN_ID
                }) : false;

                const authorAddress = postData[1] || postData.author || '';
                const authorFid = Number(postData[2] || postData.authorFid || 0);
                
                let fcProfile = state.viewingProfile;
                if (!fcProfile && authorFid && authorFid > 0) {
                    fcProfile = await fetchProfileByFid(authorFid);
                }

                userPosts.push({
                    id: (postData[0] || postData.id)?.toString() || id.toString(),
                    author: authorAddress,
                    authorFid: authorFid,
                    authorName: fcProfile?.display_name || fcProfile?.username || postData[3] || postData.authorName || 'Anonymous',
                    authorPfp: fcProfile?.pfp_url || null,
                    authorUsername: fcProfile?.username || null,
                    ipfsHash: postData[4] || postData.ipfsHash || '',
                    caption: postData[5] || postData.caption || '',
                    timestamp: new Date((Number(postData[6] || postData.timestamp || 0)) * 1000),
                    likes: Number(postData[7] || postData.likes || 0),
                    hasLiked: hasLiked
                });
            } catch (postError) {
                console.error(`Error loading post ${id}:`, postError);
                continue;
            }
        }
        
        state.userPosts = userPosts.reverse();
        state.loading = false;
        renderApp();
    } catch (error) {
        console.error('Error viewing profile:', error);
        state.loading = false;
        alert('Failed to load user profile');
        state.currentView = 'feed';
        renderApp();
    }
}

// ===== IPFS UPLOAD =====
async function uploadToPinata(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const metadata = JSON.stringify({
            name: `face-caster-${Date.now()}`,
        });
        formData.append('pinataMetadata', metadata);

        console.log('📤 Uploading to Pinata IPFS...');
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to upload to IPFS: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Uploaded to Pinata:', data);
        return data.IpfsHash;
    } catch (error) {
        console.error('❌ Pinata upload failed:', error);
        throw new Error('Failed to upload to IPFS');
    }
}

// ===== LOAD POSTS =====
async function loadPosts() {
    try {
        if (!state.walletConfig) return;
        
        console.log('📥 Loading posts from blockchain...');
        
        const postIds = await readContract(state.walletConfig, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getAllPostIds',
            chainId: ARBITRUM_CHAIN_ID
        });
        
        console.log('📋 Found', postIds.length, 'posts');
        const posts = [];

        for (let id of postIds) {
            try {
                const postData = await readContract(state.walletConfig, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'getPost',
                    args: [id],
                    chainId: ARBITRUM_CHAIN_ID
                });
                
                const hasLiked = state.account ? await readContract(state.walletConfig, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'hasUserLiked',
                    args: [id, state.account],
                    chainId: ARBITRUM_CHAIN_ID
                }) : false;

                const authorFid = Number(postData[2] || postData.authorFid || 0);
                let fcProfile = null;
                if (authorFid && authorFid > 0) {
                    fcProfile = await fetchProfileByFid(authorFid);
                }

                const post = {
                    id: (postData[0] || postData.id)?.toString() || id.toString(),
                    author: postData[1] || postData.author || '',
                    authorFid: authorFid,
                    authorName: fcProfile?.display_name || fcProfile?.username || postData[3] || 'Anonymous',
                    authorPfp: fcProfile?.pfp_url || null,
                    authorUsername: fcProfile?.username || null,
                    ipfsHash: postData[4] || postData.ipfsHash || '',
                    caption: postData[5] || postData.caption || '',
                    timestamp: new Date((Number(postData[6] || postData.timestamp || 0)) * 1000),
                    likes: Number(postData[7] || postData.likes || 0),
                    hasLiked: hasLiked
                };
                
                posts.push(post);
                
            } catch (postError) {
                console.error(`❌ Error loading post ${id}:`, postError);
                continue;
            }
        }

        state.posts = posts.reverse();
        
        if (state.fid && state.fid > 0) {
            try {
                const userPostCount = await readContract(state.walletConfig, {
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'getPostCountByFid',
                    args: [state.fid],
                    chainId: ARBITRUM_CHAIN_ID
                });
                state.userPostCount = Number(userPostCount);
            } catch (error) {
                console.log('⚠️ Could not get post count by FID');
            }
        }
        
        console.log(`✅ Loaded ${posts.length} total posts`);
        
    } catch (err) {
        console.error('❌ Error loading posts:', err);
        state.posts = [];
    }
}

// ===== CREATE POST =====
async function createPost() {
    if (!state.imageFile) {
        alert('Please select an image');
        return;
    }

    if ((state.userPostCount || 0) >= MAX_POSTS) {
        alert('You have reached the maximum post limit');
        return;
    }

    if (!state.fid || state.fid === 0) {
        alert('⚠️ Please wait for Farcaster profile to load');
        return;
    }

    try {
        state.loading = true;
        renderApp();

        const ipfsHash = await uploadToPinata(state.imageFile);
        console.log('✅ Uploaded to IPFS:', ipfsHash);

        const caption = state.currentCaption;
        
        const hash = await writeContract(state.walletConfig, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'createPost',
            args: [ipfsHash, caption, state.fid],
            chainId: ARBITRUM_CHAIN_ID
        });
        
        console.log('⏳ Waiting for transaction confirmation...');
        await waitForTransactionReceipt(state.walletConfig, {
            hash: hash,
            chainId: ARBITRUM_CHAIN_ID
        });

        console.log('✅ Transaction confirmed!');

        state.imageFile = null;
        state.imagePreview = null;
        state.currentCaption = '';
        
        await loadPosts();
        
        state.loading = false;
        renderApp();
        
        alert('Post created successfully! 🎉');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (err) {
        console.error('Error creating post:', err);
        state.loading = false;
        renderApp();
        alert('Failed to create post: ' + err.message);
    }
}

// ===== LIKE/UNLIKE POST =====
async function toggleLike(postId, hasLiked) {
    try {
        const hash = hasLiked 
            ? await writeContract(state.walletConfig, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'unlikePost',
                args: [postId],
                chainId: ARBITRUM_CHAIN_ID
            })
            : await writeContract(state.walletConfig, {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'likePost',
                args: [postId],
                chainId: ARBITRUM_CHAIN_ID
            });
            
        await waitForTransactionReceipt(state.walletConfig, {
            hash: hash,
            chainId: ARBITRUM_CHAIN_ID
        });
        
        await loadPosts();
        if (state.currentView === 'profile') {
            await viewUserProfile(state.viewingAddress);
        } else {
            renderApp();
        }
    } catch (err) {
        console.error('Error toggling like:', err);
    }
}

// ===== SHARE TO FARCASTER =====
async function shareToFarcaster(postId, imageUrl) {
    try {
        const shareText = `Just posted on Face Caster! 💜\n\nCheck out the onchain social network on farcaster, only real photos acceptable.\n\n👉 Join Facecaster`;
        const encodedText = encodeURIComponent(shareText);
        const frameUrl = encodeURIComponent('https://face-caster.vercel.app');
        
        const castUrl = `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${frameUrl}`;
        
        if (sdk?.actions?.openUrl) {
            await sdk.actions.openUrl(castUrl);
        } else {
            window.open(castUrl, '_blank');
        }
    } catch (error) {
        console.error('Share error:', error);
        window.open(`https://warpcast.com/~/compose`, '_blank');
    }
}

// ===== FILE HANDLING =====
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be less than 10MB');
            return;
        }
        state.imageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            state.imagePreview = e.target.result;
            renderApp();
        };
        reader.readAsDataURL(file);
    }
}

function saveCaptionToState() {
    const captionInput = document.getElementById('caption-input');
    if (captionInput) {
        state.currentCaption = captionInput.value || '';
    }
}

function toggleCreatePost() {
    state.isCreatePostOpen = !state.isCreatePostOpen;
    renderApp();
}

// ===== RENDERING =====
function renderConnectWallet() {
    document.getElementById('root').innerHTML = `
        <div class="app-container">
            <header class="header">
                <h1><img src="https://face-caster.vercel.app/logo.png" alt="Logo" class="header-logo-inline"> Face Caster</h1>
                <p>Decentralized real face onchain social network</p>
            </header>
            <div class="connect-wallet-section">
                <h2>Connect Your Wallet</h2>
                <p style="margin: 20px 0; color: var(--text-secondary);">
                    Connect your wallet to start sharing your authentic moments
                </p>
                <button class="post-button" id="connectWalletBtn">
                    Connect Wallet
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('connectWalletBtn').onclick = () => {
        if (window.appKitModal) {
            window.appKitModal.open();
        }
    };
}

function getImageUrl(ipfsHash) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}

function renderApp() {
    const hasImage = state.imagePreview ? 'has-image' : '';
    const userPostCount = state.userPostCount || 0;
    
    let profileHTML = '';
    if (state.userProfile) {
        const avatar = state.userProfile.pfp_url 
            ? `<img src="${state.userProfile.pfp_url}" alt="Profile">`
            : state.userProfile.display_name.charAt(0).toUpperCase();
            
        profileHTML = `
            <div class="profile-card" style="display: block;">
                <div class="profile-content">
                    <div class="profile-avatar">${avatar}</div>
                    <div class="profile-info">
                        <div class="profile-name">${state.userProfile.display_name || state.userProfile.username}</div>
                        <div class="profile-address">FID: ${state.fid}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render profile view
    if (state.currentView === 'profile') {
        let profileData = state.viewingProfile;
        
        if (!profileData && state.userPosts.length > 0) {
            const firstPost = state.userPosts[0];
            profileData = {
                display_name: firstPost.authorName,
                username: firstPost.authorUsername,
                pfp_url: firstPost.authorPfp,
                fid: firstPost.authorFid
            };
        }
        
        const profileName = profileData?.display_name || profileData?.username || 'User';
        const profilePfp = profileData?.pfp_url;
        const profileFid = profileData?.fid || 0;
        const profileUsername = profileData?.username || null;
        const profileBio = profileData?.profile?.bio?.text || '';
        
        const profileAvatar = profilePfp 
            ? `<img src="${profilePfp}" alt="Profile">`
            : (profileName ? profileName[0].toUpperCase() : 'U');
        
        document.getElementById('root').innerHTML = `
            <div class="app-container">
                <header class="header">
                    <h1><img src="https://face-caster.vercel.app/logo.png" alt="Logo" class="header-logo-inline"> Face Caster</h1>
                    <p>Decentralized real face onchain social network.</p>
                </header>

                <button class="post-button" style="margin-bottom: 24px;" onclick="state.currentView = 'feed'; state.viewingProfile = null; renderApp();">
                    ← Back to Feed
                </button>

                <div class="profile-card" style="display: block;">
                    <div class="profile-content">
                        <div class="profile-avatar">${profileAvatar}</div>
                        <div class="profile-info">
                            <div class="profile-name">${profileName}</div>
                            ${profileUsername ? `<div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 2px; font-weight: 500;">@${profileUsername}</div>` : ''}
                            <div class="profile-address">FID: ${profileFid}</div>
                            <div style="margin-top: 4px; color: var(--text-secondary); font-size: 0.75rem;">
                                ${state.viewingAddress.slice(0, 6)}...${state.viewingAddress.slice(-4)}
                            </div>
                            ${profileBio ? `<div style="margin-top: 8px; color: var(--text-primary); font-size: 0.85rem; line-height: 1.4;">${profileBio}</div>` : ''}
                            <div style="margin-top: 8px; color: var(--text-secondary); font-weight: 600;">
                                ${state.userPosts.length} ${state.userPosts.length === 1 ? 'post' : 'posts'} on Face Caster
                            </div>
                        </div>
                    </div>
                </div>

                <div class="feed">
                    ${state.loading ? `
                        <div class="empty-state">
                            <div class="loading-spinner"></div>
                            <p style="margin-top: 20px;">Loading posts...</p>
                        </div>
                    ` : state.userPosts.length === 0 ? `
                        <div class="empty-state">
                            <h3>No posts yet</h3>
                            <p>This user hasn't posted anything on Face Caster.</p>
                        </div>
                    ` : state.userPosts.map(post => {
                        const postAvatar = post.authorPfp 
                            ? `<img src="${post.authorPfp}" alt="${post.authorName}">`
                            : post.authorName[0].toUpperCase();
                        
                        return `
                        <article class="post-card">
                            <div class="post-header">
                                <div class="post-avatar">${postAvatar}</div>
                                <div class="post-user-info">
                                    <h3>${post.authorName}</h3>
                                    <div class="post-fid">FID: ${post.authorFid}</div>
                                    <div class="post-time">${post.timestamp.toLocaleDateString()} • ${post.timestamp.toLocaleTimeString()}</div>
                                </div>
                            </div>

                            ${post.caption ? `<div class="post-content" style="padding-bottom: 0;"><p class="post-caption">${post.caption}</p></div>` : ''}

                            <img src="${getImageUrl(post.ipfsHash)}" alt="Post" class="post-image" loading="lazy" />

                            <div class="post-content">
                                <div class="post-actions">
                                    <button class="action-button ${post.hasLiked ? 'liked' : ''}" data-post-id="${post.id}" data-has-liked="${post.hasLiked}">
                                        <span>${post.hasLiked ? '❤️' : '🤍'}</span>
                                        <span>${post.likes}</span>
                                    </button>
                                    <button class="action-button" data-share-post-id="${post.id}">
                                        <span>🔵</span>
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Attach event listeners for profile view
        document.querySelectorAll('.action-button[data-post-id]').forEach(btn => {
            btn.onclick = () => {
                const postId = btn.dataset.postId;
                const hasLiked = btn.dataset.hasLiked === 'true';
                toggleLike(postId, hasLiked);
            };
        });
        
        document.querySelectorAll('.action-button[data-share-post-id]').forEach(btn => {
            btn.onclick = () => {
                const postId = btn.dataset.sharePostId;
                const post = state.userPosts.find(p => p.id === postId);
                if (post) {
                    shareToFarcaster(postId, getImageUrl(post.ipfsHash));
                }
            };
        });
        
        return;
    }
    
    // Render main feed view
    document.getElementById('root').innerHTML = `
        <div class="app-container">
            <header class="header">
                <h1><img src="https://face-caster.vercel.app/logo.png" alt="Logo" class="header-logo-inline"> Face Caster</h1>
                <p>Decentralized real face onchain social network.</p>
                <div class="post-limit-indicator">
                    <span class="dot"></span>
                    <span>Your posts: ${userPostCount} / ${MAX_POSTS}</span>
                </div>
            </header>

            ${profileHTML}

            <section class="search-section">
                <h2>Search Users 🔎</h2>
                <div class="search-input-container">
                    <input 
                        type="text" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Enter FID, address, or username"
                    />
                    <button class="search-button" id="search-btn">
                        Search
                    </button>
                </div>
            </section>

            <section class="create-post-section ${state.isCreatePostOpen ? '' : 'collapsed'}">
                <div class="create-post-header" id="toggle-create-post">
                    <div class="create-post-toggle">
                        <h2>Create Post →</h2>
                    </div>
                    <span class="toggle-icon ${state.isCreatePostOpen ? 'open' : ''}">
                        ${state.isCreatePostOpen ? '▲' : '▼'}
                    </span>
                </div>
                
                <div class="create-post-content ${state.isCreatePostOpen ? 'open' : ''}">
                    <div class="image-upload-area ${hasImage}" id="upload-area">
                        ${state.imagePreview 
                            ? `<img src="${state.imagePreview}" class="image-preview" />` 
                            : `<div class="upload-prompt">
                                <strong>Click to upload</strong> your real photo<br />
                                <small>Will be stored on IPFS (max 10MB)</small>
                               </div>`
                        }
                    </div>
                    <input type="file" id="file-input" accept="image/*" style="display: none;" />
                    
                    ${state.imagePreview ? `
                        <button class="post-button" style="background: var(--bg-secondary); color: var(--text-secondary); margin-bottom: 16px;" id="change-image-btn">
                            Change Image
                        </button>
                    ` : ''}

                    <textarea id="caption-input" class="caption-input" placeholder="Just joined facecaster..." ${state.loading ? 'disabled' : ''}>${state.currentCaption || ''}</textarea>

                    <button class="post-button" id="create-post-btn" ${!state.imageFile || userPostCount >= MAX_POSTS || state.loading || !state.fid ? 'disabled' : ''}>
                        ${state.loading ? '⏳ Posting...' : '📸 Post to Face Caster'}
                    </button>
                    
                    ${!state.fid ? `
                        <div class="warning-message" style="margin-top: 16px;">
                            ⏳ Waiting for Farcaster profile to load...
                        </div>
                    ` : ''}
                    
                    ${userPostCount >= MAX_POSTS ? `
                        <div class="warning-message" style="margin-top: 16px;">
                            You have reached the maximum post limit (${MAX_POSTS} posts)
                        </div>
                    ` : ''}
                </div>
            </section>

            <div class="tab-container">
                <button class="tab active">All Posts</button>
            </div>

            <div class="feed">
                ${state.posts.length === 0 ? `
                    <div class="empty-state">
                        <h3>No posts yet</h3>
                        <p>Be the first to share your authentic moment!</p>
                    </div>
                ` : state.posts.map(post => {
                    const postAvatar = post.authorPfp 
                        ? `<img src="${post.authorPfp}" alt="${post.authorName}">`
                        : post.authorName[0].toUpperCase();
                    
                    return `
                    <article class="post-card">
                        <div class="post-header post-header-clickable" data-author-address="${post.author}">
                            <div class="post-avatar">${postAvatar}</div>
                            <div class="post-user-info">
                                <h3>${post.authorName}</h3>
                                <div class="post-fid">FID: ${post.authorFid}</div>
                                <div class="post-time">${post.timestamp.toLocaleDateString()} • ${post.timestamp.toLocaleTimeString()}</div>
                            </div>
                        </div>

                        ${post.caption ? `<div class="post-content" style="padding-bottom: 0;"><p class="post-caption">${post.caption}</p></div>` : ''}

                        <img src="${getImageUrl(post.ipfsHash)}" alt="Post" class="post-image" loading="lazy" />

                        <div class="post-content">
                            <div class="post-actions">
                                <button class="action-button ${post.hasLiked ? 'liked' : ''}" data-post-id="${post.id}" data-has-liked="${post.hasLiked}">
                                    <span>${post.hasLiked ? '❤️' : '🤍'}</span>
                                    <span>${post.likes}</span>
                                </button>
                                <button class="action-button" data-share-post-id="${post.id}">
                                    <span>🔵</span>
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </article>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Attach event listeners
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.onclick = () => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchUser(searchInput.value);
            }
        };
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                searchUser(searchInput.value);
            }
        };
    }
    
    const toggleCreatePostBtn = document.getElementById('toggle-create-post');
    if (toggleCreatePostBtn) {
        toggleCreatePostBtn.onclick = toggleCreatePost;
    }
    
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea && !state.imagePreview) {
        uploadArea.onclick = () => {
            document.getElementById('file-input').click();
        };
    }
    
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.onchange = handleFileSelect;
    }
    
    const changeImageBtn = document.getElementById('change-image-btn');
    if (changeImageBtn) {
        changeImageBtn.onclick = () => {
            document.getElementById('file-input').click();
        };
    }
    
    const captionInput = document.getElementById('caption-input');
    if (captionInput) {
        captionInput.oninput = saveCaptionToState;
    }
    
    const createPostBtn = document.getElementById('create-post-btn');
    if (createPostBtn) {
        createPostBtn.onclick = createPost;
    }
    
    // Like buttons
    document.querySelectorAll('.action-button[data-post-id]').forEach(btn => {
        btn.onclick = () => {
            const postId = btn.dataset.postId;
            const hasLiked = btn.dataset.hasLiked === 'true';
            toggleLike(postId, hasLiked);
        };
    });
    
    // Share buttons
    document.querySelectorAll('.action-button[data-share-post-id]').forEach(btn => {
        btn.onclick = () => {
            const postId = btn.dataset.sharePostId;
            const post = state.posts.find(p => p.id === postId);
            if (post) {
                shareToFarcaster(postId, getImageUrl(post.ipfsHash));
            }
        };
    });
    
    // Profile click handlers
    document.querySelectorAll('.post-header-clickable').forEach(header => {
        header.onclick = (e) => {
            e.stopPropagation();
            const address = header.dataset.authorAddress;
            if (address) {
                viewUserProfile(address);
            }
        };
    });
}

// ===== GLOBAL EXPORTS =====
window.toggleCreatePost = toggleCreatePost;
window.handleFileSelect = handleFileSelect;
window.createPost = createPost;
window.toggleLike = toggleLike;
window.saveCaptionToState = saveCaptionToState;
window.searchUser = searchUser;
window.viewUserProfile = viewUserProfile;
window.shareToFarcaster = shareToFarcaster;
window.renderApp = renderApp;
window.state = state;

// ===== INITIALIZE =====
(async () => {
    try {
        console.log('🚀 Initializing Face-caster...');
        
        const isFarcaster = await initializeFarcaster();
        
        if (isFarcaster) {
            await fetchFarcasterProfile();
        }
        
        try {
            if (sdk?.actions?.addMiniApp) {
                await sdk.actions.addMiniApp();
                console.log('✅ Mini app added');
            }
        } catch (miniAppError) {
            console.log('⚠️ Could not add mini app (optional):', miniAppError.message);
        }
        
        console.log('✅ App initialization complete');
    } catch (err) {
        console.error("❌ Initialization error:", err);
        renderConnectWallet();
    }
})();