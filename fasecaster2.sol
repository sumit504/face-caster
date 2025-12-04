// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FaceCaster
 * @dev A decentralized social media contract for real face photos
 * Images stored on IPFS via Pinata, metadata on-chain
 * Now with Farcaster FID support
 */
contract FaceCaster {
    
    // Structs
    struct Post {
        uint256 id;
        address author;
        uint256 authorFid;     // 🔥 NEW: Farcaster ID
        string authorName;
        string ipfsHash;
        string caption;
        uint256 timestamp;
        uint256 likes;
        bool exists;
    }
    
    // State variables
    uint256 public postCounter;
    uint256 public constant MAX_POSTS = 10;
    
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => string) public userNames;
    mapping(address => uint256) public userFids;  // 🔥 NEW: Store FID per address
    mapping(address => uint256[]) public userPosts;
    
    // Events
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        uint256 authorFid,     // 🔥 NEW
        string authorName,
        string ipfsHash,
        string caption,
        uint256 timestamp
    );
    
    event PostLiked(
        uint256 indexed postId,
        address indexed liker,
        uint256 totalLikes
    );
    
    event PostUnliked(
        uint256 indexed postId,
        address indexed unliker,
        uint256 totalLikes
    );
    
    event UserNameSet(
        address indexed user,
        string userName
    );
    
    event UserFidSet(
        address indexed user,
        uint256 fid
    );
    
    // Modifiers
    modifier postExists(uint256 _postId) {
        require(posts[_postId].exists, "Post does not exist");
        _;
    }
    
    modifier hasNotReachedLimit() {
        require(postCounter < MAX_POSTS, "Maximum post limit reached");
        _;
    }
    
    // Functions
    
    /**
     * @dev Set or update user's Farcaster ID
     * @param _fid The Farcaster ID for the user
     */
    function setUserFid(uint256 _fid) external {
        require(_fid > 0, "Invalid FID");
        userFids[msg.sender] = _fid;
        emit UserFidSet(msg.sender, _fid);
    }
    
    /**
     * @dev Set or update user's display name
     * @param _name The display name for the user
     */
    function setUserName(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 50, "Name too long");
        userNames[msg.sender] = _name;
        emit UserNameSet(msg.sender, _name);
    }
    
    /**
     * @dev Create a new post with IPFS hash and FID
     * @param _ipfsHash The Pinata IPFS hash of the uploaded image
     * @param _caption Caption text for the post
     * @param _fid Farcaster ID of the poster
     */
    function createPost(
        string memory _ipfsHash,
        string memory _caption,
        uint256 _fid
    ) external hasNotReachedLimit {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_caption).length <= 500, "Caption too long");
        require(_fid > 0, "Invalid FID");
        
        // Store FID for this user if not already set
        if (userFids[msg.sender] == 0) {
            userFids[msg.sender] = _fid;
        }
        
        string memory authorName = bytes(userNames[msg.sender]).length > 0 
            ? userNames[msg.sender] 
            : "Anonymous";
        
        postCounter++;
        
        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
            authorFid: _fid,  // 🔥 STORE FID
            authorName: authorName,
            ipfsHash: _ipfsHash,
            caption: _caption,
            timestamp: block.timestamp,
            likes: 0,
            exists: true
        });
        
        userPosts[msg.sender].push(postCounter);
        
        emit PostCreated(
            postCounter,
            msg.sender,
            _fid,
            authorName,
            _ipfsHash,
            _caption,
            block.timestamp
        );
    }
    
    /**
     * @dev Like a post
     * @param _postId ID of the post to like
     */
    function likePost(uint256 _postId) external postExists(_postId) {
        require(!hasLiked[_postId][msg.sender], "Already liked this post");
        
        hasLiked[_postId][msg.sender] = true;
        posts[_postId].likes++;
        
        emit PostLiked(_postId, msg.sender, posts[_postId].likes);
    }
    
    /**
     * @dev Unlike a post
     * @param _postId ID of the post to unlike
     */
    function unlikePost(uint256 _postId) external postExists(_postId) {
        require(hasLiked[_postId][msg.sender], "Haven't liked this post");
        
        hasLiked[_postId][msg.sender] = false;
        posts[_postId].likes--;
        
        emit PostUnliked(_postId, msg.sender, posts[_postId].likes);
    }
    
    /**
     * @dev Get all post IDs
     * @return postIds Array of all post IDs
     */
    function getAllPostIds() external view returns (uint256[] memory postIds) {
        postIds = new uint256[](postCounter);
        for (uint256 i = 1; i <= postCounter; i++) {
            postIds[i - 1] = i;
        }
        return postIds;
    }
    
    /**
     * @dev Get post details
     * @param _postId ID of the post
     */
    function getPost(uint256 _postId) external view postExists(_postId) returns (
        uint256 id,
        address author,
        uint256 authorFid,     // 🔥 RETURN FID
        string memory authorName,
        string memory ipfsHash,
        string memory caption,
        uint256 timestamp,
        uint256 likes
    ) {
        Post storage post = posts[_postId];
        return (
            post.id,
            post.author,
            post.authorFid,    // 🔥 RETURN FID
            post.authorName,
            post.ipfsHash,
            post.caption,
            post.timestamp,
            post.likes
        );
    }
    
    /**
     * @dev Check if user has liked a post
     */
    function hasUserLiked(uint256 _postId, address _user) external view postExists(_postId) returns (bool liked) {
        return hasLiked[_postId][_user];
    }
    
    /**
     * @dev Get posts by a specific user
     */
    function getUserPosts(address _user) external view returns (uint256[] memory postIds) {
        return userPosts[_user];
    }
    
    /**
     * @dev Get user's FID by address
     */
    function getUserFid(address _user) external view returns (uint256 fid) {
        return userFids[_user];
    }
    
    /**
     * @dev Get total number of posts
     */
    function getTotalPosts() external view returns (uint256 count) {
        return postCounter;
    }
    
    /**
     * @dev Check if max posts limit is reached
     */
    function isMaxPostsReached() external view returns (bool reached) {
        return postCounter >= MAX_POSTS;
    }
}