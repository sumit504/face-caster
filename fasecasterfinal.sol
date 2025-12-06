// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FaceCaster v2
 * @dev Decentralized social media with FID tracking, admin controls, and COMMENTS
 */
contract FaceCaster {
    
    struct Post {
        uint256 id;
        address author;
        uint256 authorFid;
        string authorName;
        string ipfsHash;
        string caption;
        uint256 timestamp;
        uint256 likes;
        uint256 commentCount;
        bool exists;
    }
    
    struct Comment {
        uint256 id;
        uint256 postId;
        address author;
        uint256 authorFid;
        string authorName;
        string text;
        uint256 timestamp;
        bool exists;
    }
    
    address public owner;
    uint256 public postCounter;
    uint256 public commentCounter;
    uint256 public constant MAX_POSTS = 20;
    
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment) public comments;
    mapping(uint256 => uint256[]) public postComments; // postId -> commentIds[]
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => string) public userNames;
    mapping(address => uint256) public userFids;
    mapping(address => uint256[]) public userPostsByAddress;
    mapping(uint256 => uint256[]) public userPostsByFid;
    mapping(uint256 => uint256) public postCountByFid;
    
    event PostCreated(uint256 indexed postId, address indexed author, uint256 indexed authorFid, string authorName, string ipfsHash, string caption, uint256 timestamp);
    event PostDeleted(uint256 indexed postId, address indexed deletedBy, bool isAdmin);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 totalLikes);
    event PostUnliked(uint256 indexed postId, address indexed unliker, uint256 totalLikes);
    event CommentCreated(uint256 indexed commentId, uint256 indexed postId, address indexed author, uint256 authorFid, string authorName, string text, uint256 timestamp);
    event CommentDeleted(uint256 indexed commentId, uint256 indexed postId, address indexed deletedBy, bool isAdmin);
    event UserNameSet(address indexed user, string userName);
    event UserFidSet(address indexed user, uint256 fid);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier postExists(uint256 _postId) {
        require(posts[_postId].exists, "Post does not exist");
        _;
    }
    
    modifier commentExists(uint256 _commentId) {
        require(comments[_commentId].exists, "Comment does not exist");
        _;
    }
    
    modifier hasNotReachedLimit(uint256 _fid) {
        require(postCountByFid[_fid] < MAX_POSTS, "Maximum post limit reached for this FID");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    // ==================== COMMENT FUNCTIONS ====================
    
    function createComment(uint256 _postId, string memory _text, uint256 _fid) external postExists(_postId) {
        require(bytes(_text).length > 0, "Comment cannot be empty");
        require(bytes(_text).length <= 500, "Comment too long");
        require(_fid > 0, "Invalid FID");
        
        // Auto-set FID if not set
        if (userFids[msg.sender] == 0) {
            userFids[msg.sender] = _fid;
        }
        
        string memory authorName = bytes(userNames[msg.sender]).length > 0 ? userNames[msg.sender] : "Anonymous";
        
        commentCounter++;
        
        comments[commentCounter] = Comment({
            id: commentCounter,
            postId: _postId,
            author: msg.sender,
            authorFid: _fid,
            authorName: authorName,
            text: _text,
            timestamp: block.timestamp,
            exists: true
        });
        
        postComments[_postId].push(commentCounter);
        posts[_postId].commentCount++;
        
        emit CommentCreated(commentCounter, _postId, msg.sender, _fid, authorName, _text, block.timestamp);
    }
    
    function deleteComment(uint256 _commentId) external commentExists(_commentId) {
        Comment storage comment = comments[_commentId];
        require(comment.author == msg.sender, "Only comment author can delete this comment");
        
        _removeFromArray(postComments[comment.postId], _commentId);
        
        if (posts[comment.postId].commentCount > 0) {
            posts[comment.postId].commentCount--;
        }
        
        comment.exists = false;
        
        emit CommentDeleted(_commentId, comment.postId, msg.sender, false);
    }
    
    function adminDeleteComment(uint256 _commentId) external onlyOwner commentExists(_commentId) {
        Comment storage comment = comments[_commentId];
        
        _removeFromArray(postComments[comment.postId], _commentId);
        
        if (posts[comment.postId].commentCount > 0) {
            posts[comment.postId].commentCount--;
        }
        
        comment.exists = false;
        
        emit CommentDeleted(_commentId, comment.postId, msg.sender, true);
    }
    
    function getPostComments(uint256 _postId) external view postExists(_postId) returns (uint256[] memory) {
        return postComments[_postId];
    }
    
    function getComment(uint256 _commentId) external view commentExists(_commentId) returns (
        uint256 id,
        uint256 postId,
        address author,
        uint256 authorFid,
        string memory authorName,
        string memory text,
        uint256 timestamp
    ) {
        Comment storage comment = comments[_commentId];
        return (
            comment.id,
            comment.postId,
            comment.author,
            comment.authorFid,
            comment.authorName,
            comment.text,
            comment.timestamp
        );
    }
    
    function getCommentCount(uint256 _postId) external view postExists(_postId) returns (uint256) {
        return posts[_postId].commentCount;
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    function adminDeletePost(uint256 _postId) external onlyOwner postExists(_postId) {
        Post storage post = posts[_postId];
        
        _removeFromArray(userPostsByAddress[post.author], _postId);
        _removeFromArray(userPostsByFid[post.authorFid], _postId);
        
        if (postCountByFid[post.authorFid] > 0) {
            postCountByFid[post.authorFid]--;
        }
        
        post.exists = false;
        
        emit PostDeleted(_postId, msg.sender, true);
    }
    
    function adminDeleteMultiplePosts(uint256[] memory _postIds) external onlyOwner {
        for (uint256 i = 0; i < _postIds.length; i++) {
            if (posts[_postIds[i]].exists) {
                Post storage post = posts[_postIds[i]];
                
                _removeFromArray(userPostsByAddress[post.author], _postIds[i]);
                _removeFromArray(userPostsByFid[post.authorFid], _postIds[i]);
                
                if (postCountByFid[post.authorFid] > 0) {
                    postCountByFid[post.authorFid]--;
                }
                
                post.exists = false;
                
                emit PostDeleted(_postIds[i], msg.sender, true);
            }
        }
    }
    
    function adminDeleteAllPostsByFid(uint256 _fid) external onlyOwner {
        uint256[] memory userPosts = userPostsByFid[_fid];
        
        for (uint256 i = 0; i < userPosts.length; i++) {
            uint256 postId = userPosts[i];
            if (posts[postId].exists) {
                Post storage post = posts[postId];
                
                _removeFromArray(userPostsByAddress[post.author], postId);
                
                post.exists = false;
                
                emit PostDeleted(postId, msg.sender, true);
            }
        }
        
        postCountByFid[_fid] = 0;
        delete userPostsByFid[_fid];
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    // ==================== USER FUNCTIONS ====================
    
    function deletePost(uint256 _postId) external postExists(_postId) {
        Post storage post = posts[_postId];
        require(post.author == msg.sender, "Only post author can delete this post");
        
        _removeFromArray(userPostsByAddress[msg.sender], _postId);
        _removeFromArray(userPostsByFid[post.authorFid], _postId);
        
        if (postCountByFid[post.authorFid] > 0) {
            postCountByFid[post.authorFid]--;
        }
        
        post.exists = false;
        
        emit PostDeleted(_postId, msg.sender, false);
    }
    
    function setUserFid(uint256 _fid) external {
        require(_fid > 0, "Invalid FID");
        userFids[msg.sender] = _fid;
        emit UserFidSet(msg.sender, _fid);
    }
    
    function setUserName(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 50, "Name too long");
        userNames[msg.sender] = _name;
        emit UserNameSet(msg.sender, _name);
    }
    
    function createPost(string memory _ipfsHash, string memory _caption, uint256 _fid) external hasNotReachedLimit(_fid) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_caption).length <= 500, "Caption too long");
        require(_fid > 0, "Invalid FID");
        
        if (userFids[msg.sender] == 0) {
            userFids[msg.sender] = _fid;
        }
        
        string memory authorName = bytes(userNames[msg.sender]).length > 0 ? userNames[msg.sender] : "Anonymous";
        
        postCounter++;
        
        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
            authorFid: _fid,
            authorName: authorName,
            ipfsHash: _ipfsHash,
            caption: _caption,
            timestamp: block.timestamp,
            likes: 0,
            commentCount: 0,
            exists: true
        });
        
        userPostsByAddress[msg.sender].push(postCounter);
        userPostsByFid[_fid].push(postCounter);
        postCountByFid[_fid]++;
        
        emit PostCreated(postCounter, msg.sender, _fid, authorName, _ipfsHash, _caption, block.timestamp);
    }
    
    function likePost(uint256 _postId) external postExists(_postId) {
        require(!hasLiked[_postId][msg.sender], "Already liked this post");
        
        hasLiked[_postId][msg.sender] = true;
        posts[_postId].likes++;
        
        emit PostLiked(_postId, msg.sender, posts[_postId].likes);
    }
    
    function unlikePost(uint256 _postId) external postExists(_postId) {
        require(hasLiked[_postId][msg.sender], "Haven't liked this post");
        
        hasLiked[_postId][msg.sender] = false;
        posts[_postId].likes--;
        
        emit PostUnliked(_postId, msg.sender, posts[_postId].likes);
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    function getAllPostIds() external view returns (uint256[] memory postIds) {
        postIds = new uint256[](postCounter);
        for (uint256 i = 1; i <= postCounter; i++) {
            postIds[i - 1] = i;
        }
        return postIds;
    }
    
    function getActivePostIds() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= postCounter; i++) {
            if (posts[i].exists) {
                activeCount++;
            }
        }
        
        uint256[] memory activeIds = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= postCounter; i++) {
            if (posts[i].exists) {
                activeIds[index] = i;
                index++;
            }
        }
        
        return activeIds;
    }
    
    function getPost(uint256 _postId) external view postExists(_postId) returns (
        uint256 id,
        address author,
        uint256 authorFid,
        string memory authorName,
        string memory ipfsHash,
        string memory caption,
        uint256 timestamp,
        uint256 likes,
        uint256 commentCount
    ) {
        Post storage post = posts[_postId];
        return (
            post.id,
            post.author,
            post.authorFid,
            post.authorName,
            post.ipfsHash,
            post.caption,
            post.timestamp,
            post.likes,
            post.commentCount
        );
    }
    
    function hasUserLiked(uint256 _postId, address _user) external view postExists(_postId) returns (bool liked) {
        return hasLiked[_postId][_user];
    }
    
    function getUserPosts(address _user) external view returns (uint256[] memory postIds) {
        return userPostsByAddress[_user];
    }
    
    function getUserPostsByFid(uint256 _fid) external view returns (uint256[] memory postIds) {
        return userPostsByFid[_fid];
    }
    
    function getPostCountByFid(uint256 _fid) external view returns (uint256 count) {
        return postCountByFid[_fid];
    }
    
    function getUserFid(address _user) external view returns (uint256 fid) {
        return userFids[_user];
    }
    
    function getTotalPosts() external view returns (uint256 count) {
        return postCounter;
    }
    
    function getActivePosts() external view returns (uint256 count) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= postCounter; i++) {
            if (posts[i].exists) {
                activeCount++;
            }
        }
        return activeCount;
    }
    
    function isMaxPostsReached(uint256 _fid) external view returns (bool reached) {
        return postCountByFid[_fid] >= MAX_POSTS;
    }
    
    // ==================== INTERNAL HELPER ====================
    
    function _removeFromArray(uint256[] storage array, uint256 element) private {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
}
