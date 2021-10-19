const express = require('express');
const router = express.Router();
const middleware = require('./middleware/middleware');

const usersCtrl = require('../controllers/users');
const fakeUsersCtrl = require('../controllers/fake-users');

// Logging In & Registering
router.post('/register', usersCtrl.registerUser);
router.post('/login', usersCtrl.loginUser);

// Generating feed and gettings requests
router.get('/generate-feed', middleware.authorize, usersCtrl.generateFeed);
router.get('/get-search-results', middleware.authorize, usersCtrl.getSearchResults);
router.get('/get-user-data/:userId', middleware.authorize, usersCtrl.getUserData);

// Friend requests routes
router.post('/make-friend-request/:from/:to', middleware.authorize, usersCtrl.makeFriendRequest);
router.get('/get-friend-requests', middleware.authorize, usersCtrl.getFriendRequests);
router.post('/resolve-friend-request/:from/:to', middleware.authorize, usersCtrl.resolveFriendRequest);

// Post routes
router.post('/create-post', middleware.authorize, usersCtrl.createPost);
router.post('/like-unlike-post/:ownerId/:postId', middleware.authorize, usersCtrl.likeUnlikePost);
router.post('/post-comment/:ownerId/:postId', middleware.authorize, usersCtrl.postCommentOnPost);

// Message routes
router.post('/send-message/:to', middleware.authorize, usersCtrl.sendMessage);
router.post('/reset-message-notifications', middleware.authorize, usersCtrl.resetMessageNotifications);
router.post('/delete-message/:messageid', middleware.authorize, usersCtrl.deleteMessage);

// Misc routes
router.post('/bestie-enemy-toggle/:userId', middleware.authorize, usersCtrl.bestieEnemyToggle);
router.post('/reset-alert-notifications', middleware.authorize, usersCtrl.resetAlertNotifications);

// development routes
router.post('/create-fake-users', fakeUsersCtrl.createFakeUsers);

module.exports = router;
