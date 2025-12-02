import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';

// Contract ABI - CORRECTED to match deployed contract
const CONTRACT_ABI = [
  "function createPost(string memory _ipfsHash, string memory _caption) external",
  "function likePost(uint256 _postId) external",
  "function unlikePost(uint256 _postId) external",
  "function setUserName(string memory _name) external",
  "function getAllPostIds() external view returns (uint256[] memory)",
  "function getPost(uint256 _postId) external view returns (uint256 id, address author, string memory authorName, string memory ipfsHash, string memory caption, uint256 timestamp, uint256 likes)",
  "function hasUserLiked(uint256 _postId, address _user) external view returns (bool)",
  "function getTotalPosts() external view returns (uint256)",
  "function isMaxPostsReached() external view returns (bool)",
  "event PostCreated(uint256 indexed postId, address indexed author, string authorName, string ipfsHash, string caption, uint256 timestamp)",
  "event PostLiked(uint256 indexed postId, address indexed liker, uint256 totalLikes)"
];

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xc102f22A1be1dac63aCBe54dd01b97a4c0368C1d";

// Replace with your Lighthouse API key
const LIGHTHOUSE_API_KEY = "YOUR_LIGHTHOUSE_API_KEY";

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [posts, setPosts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [userName, setUserNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_POSTS = 10; // FIXED: Changed from 5 to 10

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        setAccount(accounts[0]);
        setProvider(provider);
        setContract(contract);
        
        await loadPosts(contract, accounts[0]);
      } else {
        setError('Please install MetaMask!');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
    }
  };

  // Load all posts from blockchain
  const loadPosts = async (contractInstance, userAccount) => {
    try {
      const postIds = await contractInstance.getAllPostIds();
      const loadedPosts = [];

      for (let id of postIds) {
        const postData = await contractInstance.getPost(id);
        // FIXED: Removed getComments call - no comments in contract
        const hasLiked = userAccount ? await contractInstance.hasUserLiked(id, userAccount) : false;

        loadedPosts.push({
          id: postData.id.toString(),
          author: postData.author,
          authorName: postData.authorName,
          ipfsHash: postData.ipfsHash,
          caption: postData.caption,
          timestamp: new Date(postData.timestamp.toNumber() * 1000),
          likes: postData.likes.toNumber(),
          hasLiked: hasLiked
          // REMOVED: comments array - not in contract
        });
      }

      setPosts(loadedPosts.reverse()); // Show newest first
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  };

  // Upload image to Lighthouse IPFS
  const uploadToLighthouse = async (file) => {
    try {
      setUploading(true);
      
      // Upload file to Lighthouse
      const output = await lighthouse.upload(
        [file],
        LIGHTHOUSE_API_KEY
      );
      
      console.log('File uploaded:', output);
      return output.data.Hash;
    } catch (err) {
      console.error('Error uploading to Lighthouse:', err);
      throw new Error('Failed to upload to IPFS');
    } finally {
      setUploading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!contract || !imageFile) {
      setError('Please connect wallet and select an image');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Upload to Lighthouse IPFS
      const ipfsHash = await uploadToLighthouse(imageFile);
      console.log('IPFS Hash:', ipfsHash);

      // Create post on blockchain
      const tx = await contract.createPost(ipfsHash, caption);
      await tx.wait();

      // Clear form
      setImageFile(null);
      setImagePreview(null);
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload posts
      await loadPosts(contract, account);
      
      setError('');
      alert('Post created successfully! 🎉');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Like/Unlike post
  const handleLike = async (postId, hasLiked) => {
    if (!contract) return;

    try {
      const tx = hasLiked 
        ? await contract.unlikePost(postId)
        : await contract.likePost(postId);
      await tx.wait();
      await loadPosts(contract, account);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Set user name
  const handleSetUserName = async () => {
    if (!contract || !userName.trim()) return;

    try {
      const tx = await contract.setUserName(userName);
      await tx.wait();
      alert('Username set successfully!');
      setUserNameInput('');
    } catch (err) {
      console.error('Error setting username:', err);
      setError('Failed to set username');
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) {
            loadPosts(contract, accounts[0]);
          }
        } else {
          setAccount(null);
          setContract(null);
        }
      });
    }
  }, [contract]);

  // Get Lighthouse gateway URL
  const getImageUrl = (ipfsHash) => {
    return `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
  };

  if (!account) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Face-caster</h1>
          <p>Decentralized real face social network</p>
          <p style={{ fontSize: '0.9rem', marginTop: '20px' }}>
            Powered by IPFS (Lighthouse) + Blockchain
          </p>
        </header>
        <div className="connect-wallet-section">
          <button className="post-button" onClick={connectWallet}>
            Connect Wallet
          </button>
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
            Connect your wallet to start sharing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Face-caster</h1>
        <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
        <div className="post-limit-indicator">
          <span className="dot"></span>
          <span>{posts.length} / {MAX_POSTS} posts</span>
        </div>
      </header>

      <section className="create-post-section">
        <h2>Create Post</h2>
        
        {/* Username setter */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text"
            className="caption-input"
            style={{ minHeight: '40px', marginBottom: '8px' }}
            placeholder="Set your display name (optional)"
            value={userName}
            onChange={(e) => setUserNameInput(e.target.value)}
          />
          <button 
            className="post-button"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            onClick={handleSetUserName}
          >
            Set Name
          </button>
        </div>

        <div 
          className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          ) : (
            <div className="upload-prompt">
              <strong>Click to upload</strong> your real photo
              <br />
              <small>Will be stored on IPFS (max 10MB)</small>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {imagePreview && (
          <button 
            className="post-button"
            style={{ 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
            onClick={() => {
              setImagePreview(null);
              setImageFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Change Image
          </button>
        )}

        <textarea 
          className="caption-input"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={loading || uploading}
        />

        <button 
          className="post-button"
          onClick={handleCreatePost}
          disabled={!imageFile || posts.length >= MAX_POSTS || loading || uploading}
        >
          {uploading ? 'Uploading to IPFS...' : loading ? 'Creating Post...' : 'Post to Blockchain'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </section>

      <div className="feed">
        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts yet</h3>
            <p>Be the first to share your authentic moment!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              getImageUrl={getImageUrl}
              onLike={handleLike}
            />
          ))
        )}
      </div>
    </div>
  );
}

// FIXED: Removed onComment prop and comment functionality
function PostCard({ post, getImageUrl, onLike }) {
  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-avatar">{post.authorName[0]}</div>
        <div className="post-user-info">
          <h3>{post.authorName}</h3>
          <div className="post-time">{post.timestamp.toLocaleString()}</div>
          <div className="post-time" style={{ fontSize: '0.75rem' }}>
            {post.author.slice(0, 6)}...{post.author.slice(-4)}
          </div>
        </div>
      </div>

      <img 
        src={getImageUrl(post.ipfsHash)} 
        alt="Post" 
        className="post-image"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
        }}
      />

      <div className="post-content">
        {post.caption && (
          <p className="post-caption">{post.caption}</p>
        )}

        <div className="post-actions">
          <button 
            className={`action-button ${post.hasLiked ? 'liked' : ''}`}
            onClick={() => onLike(post.id, post.hasLiked)}
          >
            <span>{post.hasLiked ? '♥' : '♡'}</span>
            <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
          </button>
        </div>

        {/* REMOVED: Comments section - not in contract */}
      </div>
    </article>
  );
}