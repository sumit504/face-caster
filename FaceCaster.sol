// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FaceCaster
 * @dev A decentralized social media contract for real face photos
 * Images stored on IPFS via Lighthouse, metadata on-chain
 */
contract FaceCaster {
    
    // Structs
    struct Post {
        uint256 id;
        address author;
        string authorName;
        string ipfsHash;      // Lighthouse IPFS hash for the image
        string caption;
        uint256 timestamp;
        uint256 likes;
        bool exists;
    }
    
    struct Comment {
        address commenter;
        string commenterName;
        string text;
        uint256 timestamp;
    }
    
    // State variables
    uint256 public postCounter;
    uint256 public constant MAX_POSTS = 10;
    
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment[]) public postComments;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => string) public userNames;
    mapping(address => uint256[]) public userPosts;
    
    // Events
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
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
    
    event CommentAdded(
        uint256 indexed postId,
        address indexed commenter,
        string commenterName,
        string text,
        uint256 timestamp
    );
    
    event UserNameSet(
        address indexed user,
        string userName
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
     * @dev Create a new post with IPFS hash
     * @param _ipfsHash The Lighthouse IPFS hash of the uploaded image
     * @param _caption Caption text for the post
     */
    function createPost(
        string memory _ipfsHash,
        string memory _caption
    ) external hasNotReachedLimit {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_caption).length <= 500, "Caption too long");
        
        string memory authorName = bytes(userNames[msg.sender]).length > 0 
            ? userNames[msg.sender] 
            : "Anonymous";
        
        postCounter++;
        
        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
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
     * @dev Add a comment to a post
     * @param _postId ID of the post to comment on
     * @param _text Comment text
     */
    function addComment(
        uint256 _postId,
        string memory _text
    ) external postExists(_postId) {
        require(bytes(_text).length > 0, "Comment cannot be empty");
        require(bytes(_text).length <= 500, "Comment too long");
        
        string memory commenterName = bytes(userNames[msg.sender]).length > 0 
            ? userNames[msg.sender] 
            : "Anonymous";
        
        postComments[_postId].push(Comment({
            commenter: msg.sender,
            commenterName: commenterName,
            text: _text,
            timestamp: block.timestamp
        }));
        
        emit CommentAdded(_postId, msg.sender, commenterName, _text, block.timestamp);
    }
    
    /**
     * @dev Get all post IDs
     * @return Array of post IDs
     */
    function getAllPostIds() external view returns (uint256[] memory) {
        uint256[] memory postIds = new uint256[](postCounter);
        for (uint256 i = 1; i <= postCounter; i++) {
            postIds[i - 1] = i;
        }
        return postIds;
    }
    
    /**
     * @dev Get post details
     * @param _postId ID of the post
     * @return Post struct data
     */
    function getPost(uint256 _postId) external view postExists(_postId) returns (
        uint256 id,
        address author,
        string memory authorName,
        string memory ipfsHash,
        string memory caption,
        uint256 timestamp,
        uint256 likes,
        uint256 commentCount
    ) {
        Post memory post = posts[_postId];
        return (
            post.id,
            post.author,
            post.authorName,
            post.ipfsHash,
            post.caption,
            post.timestamp,
            post.likes,
            postComments[_postId].length
        );
    }
    
    /**
     * @dev Get all comments for a post
     * @param _postId ID of the post
     * @return Array of comments
     */
    function getComments(uint256 _postId) external view postExists(_postId) returns (Comment[] memory) {
        return postComments[_postId];
    }
    
    /**
     * @dev Check if user has liked a post
     * @param _postId ID of the post
     * @param _user Address of the user
     * @return Boolean indicating like status
     */
    function hasUserLiked(uint256 _postId, address _user) external view postExists(_postId) returns (bool) {
        return hasLiked[_postId][_user];
    }
    
    /**
     * @dev Get posts by a specific user
     * @param _user Address of the user
     * @return Array of post IDs
     */
    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }
    
    /**
     * @dev Get total number of posts
     * @return Total post count
     */
    function getTotalPosts() external view returns (uint256) {
        return postCounter;
    }
    
    /**
     * @dev Check if max posts limit is reached
     * @return Boolean indicating if limit is reached
     */
    function isMaxPostsReached() external view returns (bool) {
        return postCounter >= MAX_POSTS;
    }
}